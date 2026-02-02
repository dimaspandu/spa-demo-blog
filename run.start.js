import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

/**
 * Resolve __filename and __dirname for ESM modules.
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Load server configuration from config.json.
 */
const configPath = path.join(__dirname, "config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

const PORT = config.port;
const outputDir = path.join(__dirname, config.outputDir);

/**
 * Build the project before starting the server.
 *
 * The bundler is imported dynamically to ensure the build step completes
 * before the server starts serving files.
 */
await import("./run.bundle.js");

/**
 * Basic MIME type mapping.
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
 * Create a minimal static HTTP server with SPA fallback support.
 */
function createStaticServer(rootDir, port) {
  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent(req.url.split("?")[0]);

    const filePath = path.join(
      rootDir,
      urlPath === "/" ? "/index.html" : urlPath
    );

    fs.readFile(filePath, (err, data) => {
      if (!err) {
        const ext = path.extname(filePath);
        res.writeHead(200, {
          "Content-Type": typeMap[ext] || "text/plain",
          "Access-Control-Allow-Origin": "*"
        });
        res.end(data);
        return;
      }

      const ext = path.extname(urlPath);

      // SPA fallback rule
      if (!ext) {
        const indexPath = path.join(rootDir, "index.html");
        fs.readFile(indexPath, (indexErr, indexData) => {
          if (indexErr) {
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

      res.writeHead(404);
      res.end("Not Found");
    });
  });

  server.listen(port, () => {
    console.log(`✔ Server running at http://localhost:${port}`);
    console.log(`  Serving bundled output from: ${rootDir}`);
  });
}

/**
 * Start server using bundled output.
 */
createStaticServer(outputDir, PORT);
