import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import bundler from "./bundler/index.js";

/**
 * Resolve __filename and __dirname for ESM modules.
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const resolver = (filePath) => path.resolve(__dirname, filePath);

/**
 * Read configuration JSON
 */
const configPath = path.join(__dirname, "config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

/**
 * Execute the bundler with an explicit configuration.
 *
 * This script:
 * - Builds the dependency graph starting from `pre-index.js`
 * - Emits all bundles and assets into `dist/`
 * - Enables minification to simulate production output
 *
 * Note:
 * This file does NOT start a server.
 */
await bundler({
  entry: resolver(config.entry),
  outputDir: resolver(config.outputDir),
  uglified: config.uglified
});
