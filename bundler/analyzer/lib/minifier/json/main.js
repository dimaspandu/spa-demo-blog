/**
 * minifyJSON(code)
 * ------------------------------------------------------------
 * High-level JSON minification utility.
 *
 * This function performs a safe JSON minification by:
 * 1. Parsing the input JSON string to validate correctness.
 * 2. Re-stringifying it without extra whitespace.
 *
 * Design notes:
 * - Strictly follows JSON specification.
 * - Comments, trailing commas, and invalid syntax will throw.
 * - Preserves key order and all string contents.
 * - Produces deterministic, compact output.
 *
 * @param {string} code - Raw JSON source
 * @returns {string} Minified JSON output
 */
export default function minifyJSON(code) {
  if (typeof code !== "string" || code.length === 0) return "";

  const data = JSON.parse(code);
  return JSON.stringify(data);
}
