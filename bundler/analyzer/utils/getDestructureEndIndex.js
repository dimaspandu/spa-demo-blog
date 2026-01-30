/**
 * Find the end index of a destructuring pattern.
 *
 * Given a starting index pointing to the opening `{` or `[`
 * of an object or array destructure, this scans forward through
 * nested `{ ... }` or `[ ... ]` pairs and returns the index of the
 * matching closing brace `}` or bracket `]`.
 *
 * Example patterns it can handle:
 *   { a, b }
 *   { a: { b, c }, d }
 *   { a, b: { c: { d } } }
 *   [a, b]
 *   [a, [b, c]]
 *
 * Returns:
 *   - The index of the matching `}` or `]`
 *   - `null` if no matching closing brace is found
 */
export default function getDestructureEndIndex(tokens, startIndex) {
  let endIndex = null;
  let depth = 0;

  // Iterate from the starting token forward
  for (let i = startIndex; i < tokens.length; i++) {
    const tok = tokens[i];

    // Increase depth on each opening brace/bracket
    if (tok.type === "punctuator" && (tok.value === "{" || tok.value === "[")) {
      depth++;
    }
    // Decrease depth on closing brace/bracket
    else if (tok.type === "punctuator" && (tok.value === "}" || tok.value === "]")) {
      depth--;

      // If depth returns to zero, we found the matching closing bracket/brace
      if (depth === 0) {
        endIndex = i;
        break;
      }
    }
  }

  return endIndex;
}
