/**
 * escapeForDoubleQuote(str)
 * -------------------------
 * Escapes characters so the string can be safely wrapped
 * in double quotes inside JavaScript source code.
 * - Escapes backslashes
 * - Escapes double quotes
 * - Escapes newlines into \n
 */
export default function escapeForDoubleQuote(str) {
  return str
    .replace(/\\/g, "\\\\") // escape backslash
    .replace(/"/g, '\\"')   // escape double quotes
    .replace(/\r?\n/g, "\\n"); // normalize newlines
}