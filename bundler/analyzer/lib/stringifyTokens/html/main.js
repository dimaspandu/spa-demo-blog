/**
 * stringifyHTMLTokens(tokens)
 * ------------------------------------------------------------
 * Reconstructs an HTML/SVG string from a flat token stream.
 *
 * This function performs a minimal, lossless stringification by
 * concatenating the `value` field of each token in order.
 *
 * Design characteristics:
 * - Does not validate HTML structure
 * - Does not mutate or normalize token values
 * - Preserves original formatting and whitespace
 * - Suitable for round-trip token → string workflows
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
export default function stringifyHTMLTokens(tokens) {
  // Guard against invalid or empty input
  if (!Array.isArray(tokens) || tokens.length === 0) return "";

  // Concatenate raw token values in source order
  return tokens.map(t => t.value).join("");
}
