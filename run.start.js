import http from "http";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

// Resolve current file and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read configuration JSON
const configPath = path.join(__dirname, "config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

const PORT = config.port; // Change port if needed
const distDir = path.join(__dirname, config.outputDirectory); // Root directory for built files

// Mapping of file extensions to MIME types
const mimeTypes = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain"
};

// Path to main SPA entry point (always served on fallback)
const indexHtmlPath = path.join(distDir, "index.html");

/**
 * Adjust the <script> tag so that the bundled index.js
 * can still be loaded correctly when visiting nested routes.
 */
function adjustSpaScript(htmlContent, reqUrl) {
  const segments = reqUrl.split("/").filter(Boolean);
  let relativePrefix = "";
  if (segments.length > 0) {
    relativePrefix = "../".repeat(segments.length);
  }

  return htmlContent.replace(
    /<script[^>]*src=["']\.\/index\.js["'][^>]*><\/script>/i,
    `<script type="module" src="${relativePrefix}index.js"></script>`
  );
}

/**
 * Adjust <link rel="stylesheet" href="./..."> paths for nested routes.
 */
function adjustSpaLink(htmlContent, reqUrl) {
  const segments = reqUrl.split("/").filter(Boolean);
  let relativePrefix = "";
  if (segments.length > 0) {
    relativePrefix = "../".repeat(segments.length);
  }

  return htmlContent.replace(
    /<link([^>]*?)href=["']\.\/([^"']+)["']([^>]*)>/gi,
    `<link$1href="${relativePrefix}$2"$3>`
  );
}

// Create HTTP server
const server = http.createServer((req, res) => {
  let filePath = req.url === "/" ? "/index.html" : req.url;

  // Serve index.html explicitly
  if (filePath === "/index.html" || filePath === "/") {
    fs.readFile(indexHtmlPath, "utf8", (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Error reading index.html");
      } else {
        let html = adjustSpaScript(data, filePath);
        html = adjustSpaLink(html, filePath);
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(html);
      }
    });
    return;
  }

  // Try to read the requested file from dist directory
  const absPath = path.join(distDir, filePath);

  fs.readFile(absPath, (err, data) => {
    if (err) {
      fs.readFile(indexHtmlPath, "utf8", (fbErr, fbData) => {
        if (fbErr) {
          res.writeHead(404, { "Content-Type": "text/plain" });
          res.end("Not found");
        } else {
          let html = adjustSpaScript(fbData, filePath);
          html = adjustSpaLink(html, filePath);
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(html);
        }
      });
    } else {
      const ext = path.extname(absPath).toLowerCase();
      const contentType = mimeTypes[ext] || "application/octet-stream";
      res.writeHead(200, { "Content-Type": contentType });
      res.end(data);
    }
  });
});

// Start server
server.listen(PORT, () =>
  console.log(`Start server running at http://localhost:${PORT}`)
);
