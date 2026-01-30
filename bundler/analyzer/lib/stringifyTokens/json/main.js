/**
 * stringifyJSONTokens(tokens)
 * ------------------------------------------------------------
 * Reconstructs a JSON source string from a flat token stream.
 *
 * Design principles:
 * - Lossless: preserves the original source exactly
 * - Deterministic: output depends only on token order and values
 * - Zero formatting: no spacing, indentation, or normalization
 *
 * This function does not validate JSON semantics.
 * It assumes tokens were produced by a strict JSON tokenizer.
 *
 * Expected token shape:
 *   {
 *     type: string,
 *     value: string
 *   }
 *
 * @param {Array<Object>} tokens
 * @returns {string}
 */
export default function stringifyJSONTokens(tokens) {
  // Guard against invalid or empty input
  if (!Array.isArray(tokens) || tokens.length === 0) return "";

  // Concatenate token values in original order
  return tokens.map(t => t.value).join("");
}
