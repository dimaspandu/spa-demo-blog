import tokenizer from "../tokenizer/main.js";
import extractModules from "../extractModules/main.js";
import transpileImportTokensToCJS from "../transpileImportTokensToCJS/main.js";
import transpileExportTokensToCJS from "../transpileExportTokensToCJS/main.js";
import stringifyJSTokens from "../stringifyTokens/main.js";

/**
 * convertESMToCJSWithMeta(code, options)
 * -------------------------------------
 * High–level transformation pipeline that converts ES Module syntax (import/export)
 * into CommonJS-compatible code while also extracting detailed metadata about all
 * encountered module dependencies.
 *
 * This function performs the following sequential steps:
 *
 * 1. Tokenization
 *    - Converts raw source code into a flat token stream.
 *    - Filters out tokens that are irrelevant for structural processing such as
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
 *    - Dynamic `import()` expressions are rewritten using the configured
 *      `dynamicImportIdentifier`.
 *
 * 4. Optional keyword normalization
 *    - Optionally rewrites all `let` and `const` keywords into `var` based on the
 *      provided configuration.
 *    - This step performs a shallow, syntax-only rewrite and does not analyze scope
 *      or block semantics.
 *
 * 5. Token stringification
 *    - Reassembles the transformed token stream back into a final JavaScript string.
 *
 * Options:
 *   - dynamicImportIdentifier (string)
 *       Identifier used to replace dynamic `import()` expressions.
 *
 *   - convertBlockBindingsToVar (boolean)
 *       When enabled, rewrites all `let` and `const` keywords into `var`.
 *
 * The returned object contains:
 *   - `code`: Final CommonJS-compatible JavaScript code.
 *   - `meta`: Array of extracted module metadata entries.
 */
export default function convertESMToCJSWithMeta(
  code,
  {
    dynamicImportIdentifier = "requireByHttp",
    convertBlockBindingsToVar = false
  } = {}
) {

  // STEP 1 — Tokenization & cleanup
  const cleanedTokens = tokenizer(code).filter(
    (t) =>
      t.type !== "newline" &&
      t.type !== "whitespace" &&
      t.type !== "comment"
  );

  // STEP 2 — Extract metadata of import/export statements
  const moduleMeta = extractModules(cleanedTokens);

  // STEP 3 — ESM → CJS transformations
  const transformedTokens = transpileImportTokensToCJS(
    transpileExportTokensToCJS(cleanedTokens),
    dynamicImportIdentifier
  );

  // NEW STEP — Optional conversion of let/const → var
  let finalTokens = transformedTokens;
  if (convertBlockBindingsToVar) {
    finalTokens = transformedTokens.map((tok) => {
      if (tok.type === "keyword" && (tok.value === "let" || tok.value === "const")) {
        return { ...tok, value: "var" };
      }
      return tok;
    });
  }

  // STEP 4 — Stringify tokens back into JS code
  const transformedCode = stringifyJSTokens(finalTokens);

  return {
    code: transformedCode,
    meta: moduleMeta
  };
}
