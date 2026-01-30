/**
 * getObjectLiteralsEndIndex(tokens, startIndex)
 *
 * Finds the index of the matching closing brace `}` for an object literal or
 * attribute object, starting from the `{` token at `startIndex`.
 *
 * How it works:
 * - Assumes `startIndex` points to a `{` token.
 * - Treats that `{` as *depth 0* (the "shallow" level).
 * - Any nested `{` inside increase depth to > 0.
 * - A closing `}` decreases depth.
 * - The first `}` encountered while depth === 0 is the correct matching brace.
 *
 * This function does NOT attempt to determine whether the brace is an
 * actual object literal, a destructuring pattern, or a block statement.
 * It simply finds the structurally correct closing brace.
 *
 * Examples of structures it can handle:
 *   { type: "json" }
 *   { a: { b: 2 }, c: 3 }
 *   { a: [1, { b: 2 }] }
 *   { fn: () => ({ nested: true }) }
 *
 * Returns:
 * - index of the matching `}` token
 * - null if no matching brace is found
 */
export default function getObjectLiteralsEndIndex(tokens, startIndex) {
  // Tracks nested braces: depth = 0 means we are at the top-level object
  let depth = 0;

  for (let i = startIndex; i < tokens.length; i++) {
    const t = tokens[i];

    // Only punctuators can affect brace depth
    if (t.type === "punctuator") {

      // Opening brace "{"
      if (t.value === "{") {
        // Only increase depth for nested braces, not the initial one
        if (i !== startIndex) depth++;
      }

      // Closing brace "}"
      else if (t.value === "}") {
        // If depth is zero, this is the matching closing brace
        if (depth === 0) return i;

        // Otherwise close one nested level
        depth--;
      }
    }
  }

  // No valid matching brace found
  return null;
}
