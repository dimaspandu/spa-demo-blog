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
 * This file is expected to define:
 * - port: number
 * - outputDir: string
 */
const configPath = path.join(__dirname, "config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

const PORT = config.port;
const outputDir = path.join(__dirname, config.outputDir);

/**
 * Build the project before starting the server.
 *
 * This ensures:
 * - dist/ is always up to date
 * - no stale bundles are served
 */
await import("./run.bundle.js");

/**
 * Create a minimal static HTTP server for bundled output.
 *
 * Unlike `run.dev.js`, this server:
 * - Serves files from `dist/`
 * - Assumes all assets are already bundled
 *
 * @param {string} rootDir - Directory to serve as web root
 * @param {number} port   - Port to listen on
 */
function createStaticServer(rootDir, port) {
  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent(req.url.split("?")[0]);
    const filePath = path.join(
      rootDir,
      urlPath === "/" ? "/index.html" : urlPath
    );

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end("Not Found");
        return;
      }

      const ext = path.extname(filePath);
      const typeMap = {
        ".html": "text/html",
        ".js": "application/javascript",
        ".json": "application/json",
        ".css": "text/css"
      };

      res.writeHead(200, {
        "Content-Type": typeMap[ext] || "text/plain",
        "Access-Control-Allow-Origin": "*"
      });

      res.end(data);
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
