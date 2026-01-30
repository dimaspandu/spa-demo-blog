/**
 * getArrayLiteralsEndIndex(tokens, startIndex)
 *
 * Finds the index of the matching closing bracket `]` for an array literal,
 * starting from the `[` token at `startIndex`.
 *
 * How it works:
 * - Assumes startIndex points to a `[` token.
 * - Treats that `[` as depth 0.
 * - Any nested `[` inside increases depth > 0.
 * - A closing `]` decreases depth.
 * - The first `]` encountered while depth === 0 is the correct matching bracket.
 *
 * Examples it can handle:
 *   [1, 2, 3]
 *   [1, [2, 3], 4]
 *   [ { a: 1 }, [2, 3] ]
 *
 * Returns:
 * - index of the matching `]` token
 * - null if no matching bracket is found
 */
export default function getArrayLiteralsEndIndex(tokens, startIndex) {
  let depth = 0;

  for (let i = startIndex; i < tokens.length; i++) {
    const t = tokens[i];

    if (t.type === "punctuator") {

      if (t.value === "[") {
        // Only increase depth for nested brackets, not the first one
        if (i !== startIndex) depth++;
      } else if (t.value === "]") {
        if (depth === 0) return i; // Found matching closing bracket
        depth--;
      }
    }
  }

  // No matching bracket found
  return null;
}
