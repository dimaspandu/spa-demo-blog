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
 * Load server configuration from config.json.
 * This file is expected to define:
 * - port: number
 * - devDir: string
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
 * @param {string} rootDir - Directory to serve as the web root
 * @param {number} port   - Port to listen on
 */
function createStaticServer(rootDir, port) {
  const server = http.createServer((req, res) => {
    /**
     * Extract the URL path without query parameters.
     * decodeURIComponent ensures encoded paths are handled correctly.
     */
    const urlPath = decodeURIComponent(req.url.split("?")[0]);

    /**
     * Resolve the requested file path.
     * "/" explicitly maps to "/index.html".
     */
    const filePath = path.join(
      rootDir,
      urlPath === "/" ? "/index.html" : urlPath
    );

    /**
     * Attempt to read the requested file from disk.
     */
    fs.readFile(filePath, (err, data) => {
      if (!err) {
        /**
         * File exists:
         * Serve it normally with the appropriate Content-Type.
         */
        const ext = path.extname(filePath);
        res.writeHead(200, {
          "Content-Type": typeMap[ext] || "text/plain",
          "Access-Control-Allow-Origin": "*"
        });
        res.end(data);
        return;
      }

      /**
       * File does not exist.
       * Determine whether this request should fall back to SPA routing.
       */
      const ext = path.extname(urlPath);

      /**
       * If the URL has no file extension, assume this is
       * a client-side route (e.g. /dashboard, /user/123).
       * In that case, return index.html so the SPA router can handle it.
       */
      if (!ext) {
        const indexPath = path.join(rootDir, "index.html");
        fs.readFile(indexPath, (indexErr, indexData) => {
          if (indexErr) {
            /**
             * index.html is missing or unreadable.
             * This indicates a server or build configuration problem.
             */
            res.writeHead(500);
            res.end("Failed to load index.html");
            return;
          }

          res.writeHead(200, {
            "Content-Type": "text/html",
            "Access-Control-Allow-Origin": "*"
          });
          res.end(indexData);
        });
        return;
      }

      /**
       * If the request was for a static asset (has an extension)
       * and the file does not exist, return a proper 404.
       */
      res.writeHead(404);
      res.end("Not Found");
    });
  });

  /**
   * Start listening on the specified port.
   */
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
