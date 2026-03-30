import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Resolve __filename and __dirname for ESM modules.
 * Node.js does not provide them automatically when using ES modules.
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Track latest file change time in the dev root.
 */
function getLatestMtimeMs(dir) {
  let latest = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      latest = Math.max(latest, getLatestMtimeMs(fullPath));
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (![".js", ".json", ".css", ".html"].includes(ext)) continue;

    const stat = fs.statSync(fullPath);
    if (stat.mtimeMs > latest) latest = stat.mtimeMs;
  }

  return latest;
}

/**
 * Load server configuration from config.json.
 * This file is expected to define:
 * - port: number
 * - devDir: string
 *
 * Note:
 * devDir points to the source directory (src) because this server
 * is for development and serves unbundled source files.
 */
const configPath = path.join(__dirname, "config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

const PORT = config.port;
const devDir = path.join(__dirname, config.devDir);

/**
 * Basic MIME type mapping for static assets.
 * Extend this map if you add more asset types.
 */
const typeMap = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".json": "application/json",
  ".css": "text/css",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml"
};

/**
 * Creates a minimal static HTTP server with SPA fallback support.
 *
 * Behavior:
 * 1. Try to serve the requested file directly from disk.
 * 2. If the file does not exist:
 *    - If the request is NOT for a static asset, return index.html
 *      (SPA client-side routing fallback).
 *    - If the request IS for a static asset, return 404.
 *
 * This server does not bundle or transform files.
 * It is intended for quick development iteration.
 */
function createStaticServer(rootDir, port) {
  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent(req.url.split("?")[0]);

    if (urlPath === "/__dev/version") {
      const version = String(getLatestMtimeMs(rootDir));
      res.writeHead(200, {
        "Content-Type": "text/plain",
        "Access-Control-Allow-Origin": "*"
      });
      res.end(version);
      return;
    }

    const injectReloadScript = (html) => {
      const inject = `\n<script>\n(function () {\n  let lastVersion = null;\n  async function checkReload() {\n    try {\n      const res = await fetch(\"/__dev/version\", { cache: \"no-store\" });\n      const version = await res.text();\n      if (lastVersion && version !== lastVersion) {\n        location.reload();\n        return;\n      }\n      lastVersion = version;\n    } catch (_) {}\n  }\n  window.addEventListener(\"focus\", checkReload);\n  checkReload();\n})();\n</script>\n`;
      if (html.includes("</body>")) {
        return html.replace("</body>", `${inject}</body>`);
      }
      return html + inject;
    };

    const filePath = path.join(
      rootDir,
      urlPath === "/" ? "/index.html" : urlPath
    );

    fs.readFile(filePath, (err, data) => {
      if (!err) {
        const ext = path.extname(filePath);
        let body = data;
        if (ext === ".html") {
          body = injectReloadScript(data.toString());
        }
        res.writeHead(200, {
          "Content-Type": typeMap[ext] || "text/plain",
          "Access-Control-Allow-Origin": "*"
        });
        res.end(body);
        return;
      }

      // File does not exist. Determine whether to fallback to SPA routing.
      const ext = path.extname(urlPath);

      /**
       * SPA fallback rule:
       * - No extension → treat as client-side route
       * - Serve index.html so the SPA router can handle the route
       */
      if (!ext) {
        const indexPath = path.join(rootDir, "index.html");
        fs.readFile(indexPath, (indexErr, indexData) => {
          if (indexErr) {
            res.writeHead(500);
            res.end("Failed to load index.html");
            return;
          }

          const body = injectReloadScript(indexData.toString());
          res.writeHead(200, {
            "Content-Type": "text/html",
            "Access-Control-Allow-Origin": "*"
          });
          res.end(body);
        });
        return;
      }

      // Static asset requested but not found
      res.writeHead(404);
      res.end("Not Found");
    });
  });

  server.listen(port, () => {
    console.log(`✔ Dev server running at http://localhost:${port}`);
    console.log(`  Serving source from: ${rootDir}`);
  });
}

/**
 * Start the development server.
 * This serves pre-built frontend files without bundling.
 */
createStaticServer(devDir, PORT);
