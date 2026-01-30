/**
 * unwrapNestedLiteral(str)
 * --------------------------------------------------
 * Unwrap string literals that contain a nested
 * backtick-wrapped literal.
 *
 * Examples:
 *   "`https://a.com`"   → https://a.com
 *   "`${x}/a.js`"       → ${x}/a.js
 *   "`hello`"           → hello
 *
 * @param {string} str
 * @returns {string}
 */
export default function unwrapNestedLiteral(str) {
  if (typeof str !== "string" || str.length < 2) return str;

  const first = str[0];
  const last = str[str.length - 1];

  // Outer string must be quoted
  if (
    (first !== "'" && first !== '"' && first !== "`") ||
    first !== last
  ) {
    return str;
  }

  // Remove outer quotes
  const inner = str.slice(1, -1);

  // Check if inner is wrapped by backticks
  if (
    inner.length >= 2 &&
    inner[0] === "`" &&
    inner[inner.length - 1] === "`"
  ) {
    return inner.slice(1, -1);
  }

  return inner;
}
