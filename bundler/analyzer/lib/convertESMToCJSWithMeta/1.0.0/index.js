import tokenizer from "../tokenizer/main.js";
import extractModules from "../extractModules/main.js";
import transpileImportTokensToCJS from "../transpileImportTokensToCJS/main.js";
import transpileExportTokensToCJS from "../transpileExportTokensToCJS/main.js";
import stringifyTokens from "../stringifyTokens/main.js";

/**
 * convertESMToCJSWithMeta(code)
 * ------------------------------
 * High–level transformation pipeline that converts ES Module syntax (import/export)
 * into CommonJS-compatible code while also extracting detailed metadata about all
 * encountered module dependencies.
 *
 * This function performs four sequential steps:
 *
 * 1. Tokenization
 *    - Converts raw source code into a flat token stream.
 *    - Filters out tokens that are irrelevant for structural processing such as:
 *      whitespace, newlines, and comments.
 *
 * 2. Metadata extraction
 *    - Scans the cleaned token stream to collect information about all static and
 *      dynamic import/export usages.
 *    - Produces structured metadata describing module paths, import types, attributes,
 *      assertion objects, and literal status.
 *
 * 3. ESM → CJS transpilation
 *    - Rewrites ES import/export syntax into equivalent CommonJS patterns.
 *    - Import transformations are applied before export transformations to preserve
 *      execution order and avoid naming conflicts.
 *
 * 4. Token stringification
 *    - Reassembles the transformed token stream back into a final JavaScript string.
 *
 * The output object contains:
 *   - `code`:   Final CommonJS-compatible JavaScript code.
 *   - `meta`:   Array of extracted module metadata entries.
 */
export default function convertESMToCJSWithMeta(code) {
  // STEP 1 — Tokenize the input source code.
  // Only keep meaningful tokens to simplify the analysis and transformation stages.
  const cleanedTokens = tokenizer(code).filter(
    (t) =>
      t.type !== "newline" &&
      t.type !== "whitespace" &&
      t.type !== "comment"
  );

  // STEP 2 — Extract metadata regarding all import/export statements.
  // This step does not mutate tokens; it only collects information used for analysis,
  // tooling, or dependency graphs.
  const moduleMeta = extractModules(cleanedTokens);

  // STEP 3 — Transform ES Module syntax into CommonJS.
  // Import transformations are applied first, then export transformations.
  // Both transformations operate on the token stream and replace ESM-specific tokens.
  const cjsTokens = transpileImportTokensToCJS(
    transpileExportTokensToCJS(cleanedTokens)
  );

  // STEP 4 — Convert the transformed token sequence back to a raw code string.
  const transformedCode = stringifyTokens(cjsTokens);

  return {
    code: transformedCode,
    meta: moduleMeta
  };
}
