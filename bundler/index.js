/**
 * @license JS+ (ESM TO CJS-CLIENT) v1.0.8
 * jsplus/#/cjs-to-cjs-client.js
 *
 * Reference: https://github.com/ronami/minipack
 *
 * Copyright (c) dimaspandu
 * Licensed under MIT
 */

import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import {
  cleanUpCode,
  cleanUpStyle,
  ensureJsExtension,
  escapeForDoubleQuote,
  mergeRequireNetworkCalls,
  minifyHTML,
  minifyJS,
  oneLineJS,
  stripComments,
  transpileESMToCJS
} from "./utils/index.js";

/**
 * RUNTIME_CODE(host)
 * -------------------
 * Returns the runtime code as a string literal.
 * This runtime defines `$d`, a custom require/bundle loader,
 * plus polyfills for CSSStyleSheet and adoptedStyleSheets.
 * The runtime is injected once into the main bundle when includeRuntime = true.
 */
const RUNTIME_CODE = (host, modules, entry) => stripComments(`
(function(GlobalConstructor, modules, entry) {
  var __modules__ = {};
  var __modulePointer__ = {};
  var __asyncModulePointer__ = {};

  // Extract host or base path from current window URL
  function getHostFromCurrentUrl() {
    var href = window.location.href;
    var clean = href.split(/[?#]/)[0];
    var parts = clean.split("/");
    var lastPart = parts[parts.length - 1];

    if (lastPart && lastPart.indexOf(".") > -1) {
      // If last part is a file, remove it
      parts.pop();
      return parts.join("/");
    } else {
      // Extract origin (protocol + host + port)
      var originMatch = clean.match(/^(https?:\\\/\\\/[^/]+)/i);
      return originMatch ? originMatch[1] : clean;
    }
  }

  // Get file extension from an id string
  function getExt(id) {
    var parts = id.split(".");
    return parts.length > 1 ? "." + parts.pop() : "";
  }

  // Ensure file path ends with .js
  function ensureJsExtension(outputFilePath) {
    var clean = outputFilePath.split(/[?#]/)[0];
    var parts = clean.split("/");
    var last = parts[parts.length - 1];

    if (last.indexOf(".") > -1) {
      last = last.replace(/\\\.[^.]+$/, ".js");
    } else {
      last = last + ".js";
    }
    parts[parts.length - 1] = last;
    return parts.join("/");
  }

  // The "registry" function registers modules into the global "__modules__" object
  // It checks if the module is already registered, and if not, it adds the module to "__modules__"
  function registry(modules) {
    // Iterate through each module in the 'modules' object using a traditional 'for...in' loop
    for (var key in modules) {
      // Ensure that the property is a direct property of 'modules', not inherited from its prototype
      if (modules.hasOwnProperty(key)) {
        // Check if the module with the given key is not already registered in __modules__
        if (!__modules__[key]) {
          // If not already registered, add it to __modules__ with the corresponding module value
          __modules__[key] = modules[key];
        }
      }
    }
  }

  // Load script asynchronously and return a Promise-like object
  function RequireAsynchronously(idAsAPath, namespace) {
    var actualPath = idAsAPath.replace("&", ${host !== undefined ? `"${host}"` : "getHostFromCurrentUrl()"});

    var scriptLoader = document.createElement("script");
    scriptLoader.setAttribute("src", ensureJsExtension(actualPath));
    var head = document.head || document.getElementsByTagName("head")[0];
    head.appendChild(scriptLoader);

    var moduleId = namespace ? namespace : idAsAPath;

    if (typeof Promise !== "undefined") {
      // Promise-based async loading
      return new Promise(function(resolve, reject) {
        scriptLoader.onload = function() {
          resolve(__modulePointer__[moduleId].exports);
        };
        scriptLoader.onerror = function(err) {
          reject(err);
        };
      });
    } else {
      // Fallback for browsers without Promise
      this.then = function(resolve) {
        scriptLoader.onload = function() {
          resolve(__modulePointer__[moduleId].exports);
        };
        return this;
      };
      this["catch"] = function(reject) {
        scriptLoader.onerror = reject;
        return this;
      };
    }
  }

  // Main require function to load modules synchronously or asynchronously
  function require(id) {
    if (!id) return;

    var asynchronously = id.indexOf("<HTTP>") !== -1 || id.indexOf("<HTTPS>") !== -1;

    if (asynchronously) {
      // Asynchronous module loading
      var separator = null;
      if (id.indexOf("<HTTP>") !== -1) {
        separator = "/<HTTP>";
      } else if (id.indexOf("<HTTPS>") !== -1) {
        separator = "/<HTTPS>";
      }

      var isExternalUrl = /^https?:\\\/\\\//.test(id);
      var actualId = id.split(separator)[0];
      var namespace = id.split(separator)[1].substring(1);
      var moduleId = actualId + namespace;

      // Reuse existing async module if already loaded
      if (__asyncModulePointer__[moduleId]) {
        return __asyncModulePointer__[moduleId];
      }

      var requireAsynchronously = null;
      var hasANamespace = namespace.length > 0;

      if (isExternalUrl && hasANamespace) {
        requireAsynchronously = new RequireAsynchronously(actualId, namespace);
      } else {
        requireAsynchronously = new RequireAsynchronously(actualId);
      }

      __asyncModulePointer__[moduleId] = requireAsynchronously;
      return requireAsynchronously;
    }

    // Handle synchronous modules
    var ext = getExt(id);
    if (!(ext === ".js" || ext === ".mjs" || ext === ".json" || ext === ".css" || ext === ".svg" || ext === ".xml" || ext === ".html")) {
      return;
    }

    // Return already cached module if available
    if (__modulePointer__[id]) {
      return __modulePointer__[id].exports;
    }

    // Retrieve module definition
    var moduleData = __modules__[id];
    if (!moduleData) {
      throw new Error("Module not found: " + id);
    }

    var fn = moduleData[0];
    var mapping = moduleData[1];

    // Local require function for module mapping
    function localRequire(name) {
      return require(mapping[name]);
    }

    // Initialize module object
    var module = { exports: {} };
    __modulePointer__[id] = module;

    // Execute module function
    fn(localRequire, module.exports, module);
    return module.exports;
  }

  // Start registering modules
  registry(modules);

  // Start execution from entry module
  require(entry);

  GlobalConstructor.prototype["*pointers"] = function(address) {
    if (address === "&registry") {
      return registry;
    } else if (address === "&require") {
      return require;
    }
    return null;
  }; 
})(
  typeof window !== "undefined" ? Window : this,
  ${modules},
  ${entry}
);
`);

/**
 * normalizeId(p)
 * ----------------
 * Converts a file path into an absolute normalized path using forward slashes.
 */
function normalizeId(p) {
  return path.resolve(p).replace(/\\/g, "/");
}

/**
 * processAndCopyFile(src, dest)
 * ------------------------------
 * Copies non-JS files (images, fonts, etc.) to destination.
 * Used for asset handling. JS files are skipped since bundler handles them.
 */
async function processAndCopyFile(src, dest) {
  await fsp.mkdir(path.dirname(dest), { recursive: true });
  await fsp.copyFile(src, dest);
}

/**
 * createNode(filename)
 * ---------------------
 * Reads a file and transforms it into a node object for the dependency graph.
 * Handles special processing for CSS, JSON, HTML, SVG, and XML.
 * Transpiles JS/ESM files to CJS and strips comments.
 */
function createNode(filename) {
  const parts = filename.split(".");
  const extension = parts.length > 1 ? "." + parts.pop() : "";
  const rawCode = fs.readFileSync(filename, "utf-8");

  // Prepare transformed code depending on file type
  const originalCode = (function() {
    if (extension === ".css") {
      return cleanUpStyle(stripComments(rawCode));
    }
    if (extension === ".svg" || extension === ".xml" || extension === ".html") {
      return minifyHTML(rawCode);
    }
    // For JS: transpile ESM -> CJS, strip comments, inline into single line
    return mergeRequireNetworkCalls(
      cleanUpCode(
        transpileESMToCJS(
          oneLineJS(
            stripComments(rawCode)
          )
        )
      )
      .replaceAll(".http()", ".http(\"\")")
      .replaceAll(".https()", ".https(\"\")")
    );
  }());

  // Convert to production-ready code
  let productionCode = originalCode;
  if (extension === ".json") {
    productionCode = `exports.default = ${originalCode};`;
  } else if (extension === ".css") {
    productionCode = `var raw = "${escapeForDoubleQuote(originalCode)}";if(typeof CSSStyleSheet === "undefined"){exports.default = raw;}else{var sheet = new CSSStyleSheet();sheet.replaceSync(raw);exports.default = sheet;}`;
  } else if (extension === ".svg" || extension === ".xml" || extension === ".html") {
    productionCode = `exports.default = "${escapeForDoubleQuote(originalCode)}";`;
  }

  // Collect require() calls for dependency tracking
  const requireRegex = /require\(['"](.*?)['"]\)/g;
  const dependencies = [];
  let match;
  while ((match = requireRegex.exec(originalCode)) !== null) {
    dependencies.push(match[1]);
  }

  const id = normalizeId(filename);

  return {
    id,
    filename: id,
    dependencies,
    code: productionCode,
    separated: false
  };
}

/**
 * createGraph(entry, outputFilePath)
 * -----------------------------------
 * Builds a dependency graph starting from entry file.
 * Traverses require() calls, creates nodes, and resolves absolute paths.
 * Handles both local files and external separated modules (<HTTP>/<HTTPS>).
 */
function createGraph(entry, outputFilePath) {
  const entryNode = createNode(entry);
  const queue = [entryNode];
  const seen = { [entryNode.id]: entryNode };
  const outputDir = normalizeId(path.dirname(outputFilePath));

  for (const node of queue) {
    node.mapping = {};
    const dirname = path.dirname(node.filename);

    for (const relativePath of node.dependencies) {
      // Ignore absolute HTTP/HTTPS URLs
      if (/^https?:\/\//.test(relativePath)) {
        node.mapping[relativePath] = relativePath;
      } else {
        const absolutePath = normalizeId(path.join(dirname, relativePath));

        // Detect external separated modules (<HTTP> or <HTTPS>)
        const separated = absolutePath.includes("<HTTP>") || absolutePath.includes("<HTTPS>");

        // Normalize separator for separated modules
        let separator = null;
        if (absolutePath.includes("<HTTP>")) {
          separator = "/<HTTP>";
        } else if (absolutePath.includes("<HTTPS>")) {
          separator = "/<HTTPS>";
        }

        // Actual file path (strip separator)
        const actualPath = separated ? absolutePath.split(separator)[0] : absolutePath;

        // If unseen before, process it
        if (!seen[actualPath]) {
          if (
            [".js", ".mjs", ".json", ".css", ".svg", ".xml", ".html"].includes(path.extname(actualPath))
          ) {
            // Treat as module dependency
            const nextNode = createNode(actualPath);
            seen[actualPath] = nextNode;
            queue.push(nextNode);
          } else {
            // Copy non-code assets directly
            const relativeToEntry = path.relative(path.dirname(entry), actualPath);
            const outPath = normalizeId(path.join(outputDir, relativeToEntry));

            processAndCopyFile(actualPath, outPath).catch(console.error);
          }
        }

        // Update dependency mapping
        if (seen[actualPath]) {
          node.mapping[relativePath] = separated ? absolutePath : seen[actualPath].id;
        }

        // Mark as separated if external
        if (separated) {
          seen[actualPath].separated = true;
        }
      }
    }
  }

  return queue;
}

/**
 * bundle(graph, entryFilePath, host, includeRuntime)
 * ---------------------------------------------------
 * Generates the final bundle string.
 * - includeRuntime = true: injects runtime + modules + entry execution
 * - includeRuntime = false: injects only modules (runtime assumed global)
 */
function bundle(graph, entryFilePath, host, includeRuntime) {
  let modules = ``;

  // Serialize modules into key/value pairs
  graph.forEach((mod) => {
    modules += `"${mod.id}": [
      function(require, exports, module) {
        ${mod.code}
      },
      ${JSON.stringify(mod.mapping)}
    ],`;
  });

  const entryId = entryFilePath ? normalizeId(entryFilePath) : null;

  if (includeRuntime) {
    return cleanUpCode(`
      ${RUNTIME_CODE(host, `{${modules.slice(0, -1)}}`, `"${entryId}"`)}
    `);
  } else {
    return cleanUpCode(`
      (function(global, modules, entry) {
        global["*pointers"]("&registry")(modules);
        global["*pointers"]("&require")(entry);
      })(
        typeof window !== "undefined" ? window : this,
        {${modules.slice(0, -1)}},
        "${entryId}"
      );
    `);
  }
}

/**
 * generateOutput(outputFilePath, bundleResult)
 * ---------------------------------------------
 * Writes the final bundled code into the output file.
 * Ensures directory exists before writing.
 */
function generateOutput(outputFilePath, bundleResult) {
  const outputDir = path.dirname(outputFilePath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  fs.writeFileSync(outputFilePath, bundleResult, "utf8");
}

let fixedBaseDir = "";

/**
 * main(options)
 * ---------------
 * Entry point of the bundler.
 * Parameters:
 * - host: base host for replacing "&" placeholders
 * - entryFile: main input file path
 * - outputFile: specific output file path (optional)
 * - outputDirectory: output directory for generated bundle
 * - namespace: replacement prefix for baseDir in final code (default "&/")
 * - includeRuntime: whether to include runtime in this bundle (default true)
 *
 * Creates dependency graph, generates bundle, writes output file,
 * and recursively handles separated graphs (external modules).
 */
export default async function main({
  host,
  entryFile,
  outputFile,
  outputDirectory,
  namespace = "&/",
  includeRuntime = true
}) {
  // Ensure output path ends with .js
  const outputFilePath = ensureJsExtension(outputFile ? outputFile : path.join(outputDirectory, "index.js"));
  
  // Build dependency graph
  const graph = createGraph(entryFile, outputFilePath);
  
  // Lock baseDir only once
  if (!fixedBaseDir) {
    fixedBaseDir = normalizeId(path.dirname(entryFile)) + "/";
  }
  const baseDir = fixedBaseDir;

  // Split separated modules (<HTTP>/<HTTPS>) from main graph
  const separatedGraphs = graph.filter(module => module.separated);
  const mainGraph = separatedGraphs.length > 0 ? graph.filter(module => !module.separated) : graph;

  // Generate main bundle
  let code = cleanUpCode(
    bundle(mainGraph, entryFile, host, includeRuntime)
  );

  // Important: minify is async
  let result = await minifyJS(code);

  // Replace baseDir with namespace
  result = result.replace(new RegExp(baseDir, "g"), namespace);

  // Write main output file
  generateOutput(outputFilePath, result);

  // Handle separated modules by bundling them individually without runtime
  if (separatedGraphs.length > 0) {
    const rootDir = entryFile.split("\\").filter(segment => !segment.includes(".js")).join("/");
    for (const i in separatedGraphs) {
      const separatedEntryFile = separatedGraphs[i].filename.replaceAll("/", "\\");
      const separatedInputFilePath = separatedGraphs[i].filename.split(rootDir).join("").replaceAll("/", "\\");
      const separatedOutputFilePath = path.join(outputDirectory, separatedInputFilePath);

      main({
        host,
        entryFile: separatedEntryFile,
        outputFile: separatedOutputFilePath,
        outputDirectory,
        namespace,
        includeRuntime: false
      });
    }
  }
}
