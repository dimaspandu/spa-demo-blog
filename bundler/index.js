import fs from "fs";
import fsp from "fs/promises";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { CSS_MINIFY_LEVEL } from "./analyzer/lib/minifier/css/constants.js";

import {
  convertESMToCJSWithMeta,
  minifyCSS,
  minifyHTML,
  minifyJS
} from "./analyzer.js";

import {
  ensureJsExtension,
  escapeForDoubleQuote,
  isAssetExtension,
  isModuleAsset,
  logger,
  mapToDistPath,
  processAndCopyFile,
  uglifyJS
} from "./helper.js";

/**
 * Resolve __filename and __dirname in ESM environment.
 * Node.js does not expose these globals in ESM mode.
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * RUNTIME_CODE(host, modules, entry)
 * ----------------------------------
 * Generates runtime bootstrap code as a string.
 * This runtime is injected only into the entry bundle.
 */
const RUNTIME_CODE = (host, modules, entry) => {
  const runtimeTemplatePath = path.join(__dirname, "runtime/template.js");

  logger.info("[RUNTIME] Loading runtime template:", runtimeTemplatePath);

  let template = fs.readFileSync(runtimeTemplatePath, "utf-8");

  /**
   * Decide how the runtime resolves the host.
   * If host is not provided, runtime will infer it from the current URL.
   */
  const injectedHost =
    host !== undefined
      ? JSON.stringify(host)
      : "getHostFromCurrentUrl()";

  /**
   * Replace runtime placeholders with actual values.
   */
  template = template
    .replace(/__INJECT_MODULES__/g, modules)
    .replace(/__INJECT_ENTRY__/g, entry)
    .replace(/__INJECT_HOST__/g, injectedHost);

  return minifyJS(template);
};

/**
 * normalizeId(p)
 * ----------------
 * Normalize file paths into absolute, forward-slash-based identifiers.
 * This guarantees stable module IDs across operating systems.
 */
function normalizeId(p) {
  return path.resolve(p).replace(/\\/g, "/");
}

/**
 * Copies a non-module asset to the output directory.
 * HTML and CSS assets are minified before being written to disk.
 *
 * This function is intentionally async and fire-and-forget,
 * as asset copying does not participate in the module graph.
 */
async function copyAssetToOutput({
  absolutePath,
  outPath,
  ext
}) {
  try {
    await fsp.mkdir(path.dirname(outPath), { recursive: true });

    if (ext === ".html") {
      const raw = await fsp.readFile(absolutePath, "utf8");
      const minified = minifyHTML(raw);

      await fsp.writeFile(outPath, minified, "utf8");
      logger.success(`[COPY] Minified HTML written to ${outPath}`);

    } else if (ext === ".css") {
      const raw = await fsp.readFile(absolutePath, "utf8");
      const minified = minifyCSS(raw, {
        level: CSS_MINIFY_LEVEL.SAFE
      });

      await fsp.writeFile(outPath, minified, "utf8");
      logger.success(`[COPY] Minified CSS written to ${outPath}`);

    } else {
      await processAndCopyFile(absolutePath, outPath);
      logger.success(`[COPY] Asset copied to ${outPath}`);
    }
  } catch (err) {
    logger.error(err);
  }
}

/**
 * createNode(filename, separated)
 * --------------------------------
 * Reads and transforms a source file into a dependency graph node.
 * Each node represents a single module.
 */
function createNode(filename, separated = false) {
  logger.info(`[NODE] Processing file: ${filename}`);

  const rawCode = fs.readFileSync(filename, "utf-8");
  const ext = path.extname(filename);

  let extraction;

  /**
   * Step 1: Transform the source code based on file type.
   */
  const transformedCode = (() => {
    if (ext === ".css") {
      return minifyCSS(rawCode, { level: CSS_MINIFY_LEVEL.SAFE });
    }

    if (ext === ".svg" || ext === ".xml" || ext === ".html") {
      return minifyHTML(rawCode);
    }

    /**
     * JavaScript files:
     * Convert ESM to CommonJS and extract dependency metadata.
     */
    extraction = convertESMToCJSWithMeta(rawCode);
    return extraction.code;
  })();

  /**
   * Step 2: Wrap transformed output into CommonJS-compatible exports.
   */

  /**
   * At this point, createNode() is only called for files that are already
   * classified as modules by createGraph().
   *
   * The ".module." check below is intentionally kept as a defensive measure
   * to make the module-wrapping logic explicit and future-proof, in case
   * createNode() is reused or called directly in the future.
   */
  const isModule = filename.includes(".module.");

  let productionCode = transformedCode;

  if (ext === ".json" && isModule) {
    productionCode = `exports.default=${transformedCode};`;

  } else if (ext === ".css" && isModule) {
    productionCode =
      `var raw="${escapeForDoubleQuote(transformedCode)}";` +
      `exports.raw=raw;` +
      `if(typeof CSSStyleSheet==="undefined"){exports.default=raw;}` +
      `else{var sheet=new CSSStyleSheet();sheet.replaceSync(raw);exports.default=sheet;}`;

  } else if (
    (ext === ".svg" || ext === ".xml" || ext === ".html") &&
    isModule
  ) {
    productionCode =
      `exports.default="${escapeForDoubleQuote(transformedCode)}";`;
  }

  /**
   * Step 3: Deduplicate dependency metadata.
   */
  const dependencies = {
    keys: {},
    values: []
  };

  if (extraction) {
    for (const meta of extraction.meta) {
      if (!dependencies.keys[meta.module]) {
        dependencies.keys[meta.module] = 1;
        dependencies.values.push(meta);
      }
    }
  }

  const id = normalizeId(filename);

  logger.success(`[NODE] Successfully created node for: ${filename}`);

  return {
    id,
    key: null,
    filename: id,
    dependent: [],
    dependencies: dependencies.values,
    code: productionCode,
    separated
  };
}

/**
 * createGraph(entry, outputFilePath, defaultNamespace)
 * ----------------------------------------------------
 * Builds a dependency graph starting from the entry file.
 */
function createGraph(entry, outputFilePath, defaultNamespace) {
  logger.info("[GRAPH] Creating dependency graph from entry:", entry);

  const entryNode = createNode(entry);
  const queue = [entryNode];

  const baseDir = path.dirname(path.resolve(entry)).replaceAll("\\", "/");
  const outputDir = normalizeId(path.dirname(outputFilePath));

  /**
   * Assign a namespaced key to the entry module.
   */
  entryNode.key = entryNode.id.replace(
    `${baseDir}/`,
    `${defaultNamespace}::`
  );

  for (const node of queue) {
    node.mapping = {};
    const currentDir = path.dirname(node.filename);

    for (const dependency of node.dependencies) {
      const relativePath = dependency.module;

      /**
       * Case 0: Dynamic import with non-literal argument.
       * Example: import(finalPath)
       *
       * Such dependencies cannot be statically resolved and must be ignored.
       * They are expected to be handled at runtime.
       */
      if (relativePath == null) {
        logger.warn(
          "[GRAPH] Skipping unresolved dynamic import (non-literal)",
          {
            importer: node.filename,
            type: dependency.type
          }
        );
        continue;
      }

      /**
       * Case 1: HTTP / HTTPS imports.
       * These modules are not bundled and are resolved at runtime.
       */
      if (/^https?:\/\//.test(relativePath)) {
        const url = new URL(relativePath);
        const namespace =
          dependency.assertions.namespace || defaultNamespace;

        const moduleId = `${namespace}::${url.pathname.slice(1)}`;
        node.mapping[relativePath] = moduleId;

        logger.warn(`[GRAPH] External URL skipped: ${relativePath}`);
        continue;
      }

      /**
       * Case 2: Local file imports.
       */
      const absolutePath = normalizeId(
        path.join(currentDir, relativePath)
      );

      const ext = path.extname(absolutePath);
      const isJS = [".js", ".mjs"].includes(ext);
      const isModule =
        isJS ||
        (isAssetExtension(ext) && isModuleAsset(absolutePath));

      if (isModule) {
        logger.info(`[GRAPH] Adding dependency module: ${absolutePath}`);

        const childNode = createNode(
          absolutePath,
          dependency.type === "dynamic"
        );

        childNode.dependent = node.id;
        childNode.key = absolutePath.replace(
          `${baseDir}/`,
          `${defaultNamespace}::`
        );

        queue.push(childNode);
      } else {
        /**
         * Non-JS assets are copied directly to the output directory.
         */
        logger.info(`[GRAPH] Copying asset dependency: ${absolutePath}`);

        const relativeToEntry = path.relative(
          path.dirname(entry),
          absolutePath
        );

        const outPath = normalizeId(
          path.join(outputDir, relativeToEntry)
        );

        copyAssetToOutput({
          absolutePath,
          outPath,
          ext
        });
      }

      /**
       * Register module mapping for resolvable extensions only.
       */
      
      /**
       * Only register runtime mappings for files that are actually bundled
       * as modules. Non-module assets must never appear in the module map,
       * otherwise the runtime would attempt to require a non-existent module.
       */
      if (isModule) {
        node.mapping[relativePath] = absolutePath.replace(
          `${baseDir}/`,
          `${defaultNamespace}::`
        );
      }
    }
  }

  logger.success("[GRAPH] Dependency graph built successfully.");
  return queue;
}

/**
 * createBundle(graph, host)
 * --------------------------
 * Groups graph nodes into output bundles.
 * Produces one entry bundle and multiple dynamic bundles if needed.
 */
function createBundle(graph, host) {
  const bundles = Object.create(null);
  const nodeMap = Object.create(null);

  // Build fast lookup for nodes
  for (const node of graph) {
    nodeMap[node.id] = node;
  }

  /**
   * Ensure bundle exists
   */
  function ensureBundle(bundleId, entry = false) {
    if (!bundles[bundleId]) {
      bundles[bundleId] = {
        entry,
        path: bundleId,
        files: [],
        modules: "",
        codes: ""
      };
    }
    return bundles[bundleId];
  }

  /**
   * STEP 0:
   * Initialize entry bundle
   */
  const entryNode = graph[0];
  entryNode.bundleId = entryNode.id;
  ensureBundle(entryNode.bundleId, true);

  /**
   * STEP 1:
   * Assign bundleId to every node
   */
  for (let i = 1; i < graph.length; i++) {
    const node = graph[i];

    // Dynamic import → own bundle
    if (node.separated) {
      node.bundleId = node.id;
      ensureBundle(node.bundleId, false);
      continue;
    }

    // Static import → inherit parent bundle
    const parent = nodeMap[node.dependent];

    if (parent && parent.bundleId) {
      node.bundleId = parent.bundleId;
    } else {
      // Safety fallback (external / asset / missing parent)
      logger.warn(
        `[BUNDLE] Missing parent for ${node.id}, attached to entry bundle`
      );
      node.bundleId = entryNode.bundleId;
    }
  }

  /**
   * STEP 2:
   * Attach nodes to bundles
   */
  for (const node of graph) {
    const bundle = bundles[node.bundleId];
    bundle.files.push(node);
  }

  /**
   * STEP 3:
   * Generate final bundle code
   */
  for (const bundleId in bundles) {
    const bundle = bundles[bundleId];

    for (const mod of bundle.files) {
      bundle.modules += `"${mod.key}":[
        function(require, exports, module, requireByHttp){
          ${mod.code}
        },
        ${JSON.stringify(mod.mapping)}
      ],`;
    }

    const entryId = bundle.files[0].key;

    if (bundle.entry) {
      logger.info("[BUNDLE] Including runtime in entry bundle");

      bundle.codes = minifyJS(
        RUNTIME_CODE(
          host,
          `{${bundle.modules.slice(0, -1)}}`,
          `"${entryId}"`
        )
      );
    } else {
      logger.info("[BUNDLE] Generating dynamic bundle");

      bundle.codes = minifyJS(`
        (function(global, modules, entry){
          global["*pointers"]("&registry")(modules);
          global["*pointers"]("&require")(entry);
        })(
          typeof window !== "undefined" ? window : this,
          {${bundle.modules.slice(0, -1)}},
          "${entryId}"
        );
      `);
    }

    // Cleanup
    delete bundle.files;
    delete bundle.modules;
  }

  return bundles;
}

/**
 * generateOutput(outputFilePath, code)
 * ------------------------------------
 * Writes bundled output to disk.
 */
function generateOutput(outputFilePath, code) {
  logger.info(`[OUTPUT] Writing bundle to ${outputFilePath}`);

  const dir = path.dirname(outputFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputFilePath, code, "utf8");
  logger.success(`[OUTPUT] Bundle successfully written to ${outputFilePath}`);
}

/**
 * main(options)
 * ---------------
 * Bundler entry point.
 * Orchestrates graph creation, bundling, minification, and output.
 */
export default async function main({
  entry,
  host,
  namespace = "&",
  outputDir,
  outputFilename = "index.js",
  uglified = false
}) {
  logger.info(`[MAIN] Starting bundler for entry: ${entry}`);

  const outputFilePath = ensureJsExtension(
    path.join(outputDir, outputFilename)
  );

  const graph = createGraph(entry, outputFilePath, namespace);
  const bundles = createBundle(graph, host);

  for (const id in bundles) {
    const bundle = bundles[id];
    const code = bundle.codes;

    logger.info("[MAIN] Minifying generated code...");
    const result = !uglified ? code : await uglifyJS(code);

    if (bundle.entry) {
      generateOutput(outputFilePath, result);
    } else {
      const mapped = mapToDistPath(bundle.path, outputDir, entry)?.destination;
      generateOutput(ensureJsExtension(mapped), result);
    }
  }

  logger.success("[MAIN] Bundling process completed successfully.");
}
