import path, { dirname } from "path";
import { fileURLToPath } from "url";
import bundler from "../../index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

bundler({
  entryFile: path.join(__dirname, "entry.js"),
  includeRuntime: false,
  namespace: `&/galaxy/`,
  outputFile: path.join(__dirname, "cdn", "services.js")
});