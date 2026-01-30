import parseDynamicImport from "./helper/parseDynamicImport.js";
import parseExportFrom from "./helper/parseExportFrom.js";
import parseStaticImport from "./helper/parseStaticImport.js";

/**
 * extractModules(tokens)
 * ----------------------
 * Extract static (import) and dynamic import(...) module usages,
 * including export-from patterns such as:
 *
 *   export * from "x";
 *   export { foo, bar } from "x";
 *   export { default as X } from "x";
 */
export default function extractModules(tokens) {
  const results = [];
  let i = 0;

  while (i < tokens.length) {
    const t = tokens[i];

    /* ===============================================
     * 1. STATIC or DYNAMIC import
     * =============================================== */
    if (t.type === "keyword" && t.value === "import") {
      const next = tokens[i + 1];

      // Dynamic import(): import(...)
      if (next && next.type === "punctuator" && next.value === "(") {
        const entry = parseDynamicImport(tokens, i);
        results.push(entry.result);
        i = entry.nextIndex;
        continue;
      }

      // Static import
      const entry = parseStaticImport(tokens, i);
      results.push(entry.result);
      i = entry.nextIndex;
      continue;
    }

    /* ===============================================
     * 2. EXPORT-FROM support  (NEW)
     * =============================================== */
    if (t.type === "keyword" && t.value === "export") {
      const entry = parseExportFrom(tokens, i);
      if (entry) {
        results.push(entry.result);
        i = entry.nextIndex;
        continue;
      }
    }

    i++;
  }

  return results;
}


