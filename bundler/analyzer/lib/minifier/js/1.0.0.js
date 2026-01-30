import tokenizer from "../tokenizer/main.js";
import stringifyJSTokens from "../stringifyTokens/main.js";

/**
 * minifyJS(code)
 * ------------------------------------------------------------
 * High-level JavaScript normalization utility.
 *
 * This function performs a lightweight JS minification by:
 * 1. Tokenizing the input JavaScript source.
 * 2. Removing non-semantic tokens (whitespace, newlines, comments).
 * 3. Re-stringifying the remaining tokens into a compact JS string.
 *
 * Design notes:
 * - This is NOT a full JavaScript parser or optimizer.
 * - No variable renaming, dead-code elimination, or reordering.
 * - Preserves execution semantics.
 * - Safe for static analysis and deterministic output.
 *
 * @param {string} code - Raw JavaScript source code
 * @returns {string} Minified JavaScript output
 */
export default function minifyJS(code) {
  if (typeof code !== "string" || code.length === 0) return "";

  const tokens = tokenizer(code);

  // Remove formatting-only tokens
  const cleanedTokens = tokens.filter(
    (t) =>
      t.type !== "newline" &&
      t.type !== "whitespace" &&
      t.type !== "comment"
  );

  return stringifyJSTokens(cleanedTokens);
}
