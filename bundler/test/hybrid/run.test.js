import path, { dirname } from "path";
import { fileURLToPath } from "url";
import bundler from "../../index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

bundler({
  host: "http://127.0.0.1:5500/bundler/test/hybrid/dist",
  entryFile: path.join(__dirname, "index.js"),
  outputDirectory: path.join(__dirname, "dist")
});