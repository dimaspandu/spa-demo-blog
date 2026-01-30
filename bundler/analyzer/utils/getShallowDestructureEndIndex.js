/**
 * getShallowDestructureEndIndex(tokens, startIndex)
 *
 * Finds the index of the *shallow* closing brace `}` that matches an opening
 * destructuring brace `{` starting at `startIndex`.
 *
 * Why this function exists:
 * -------------------------
 * In export patterns such as:
 *   export { a, b, c }
 *   export { lib.foo, lib.bar }
 *   export { x, y: alias, z = 10 }
 *
 * the parser must detect where the destructuring block ends.
 * A naive scan would break on nested braces:
 *   export { a, b: { c, d }, e }
 *
 * This function correctly handles nested `{ ... }` by tracking depth.
 *
 * Behavior:
 * ---------
 * - `startIndex` must point exactly to the `{` token.
 * - The function walks forward and:
 *     • Increases depth when encountering nested `{`
 *     • Decreases depth on `}`
 *     • Returns the index of the first `}` encountered while depth is zero
 *       → This is the matching shallow closing brace.
 *
 * - Returns `null` if no matching brace is found.
 *
 * Example:
 *   tokens = [ '{', identifier(lib), '.', identifier(foo), ',', ... , '}' ]
 *   getShallowDestructureEndIndex(tokens, 0)  → index of the top-level '}'
 */
export default function getShallowDestructureEndIndex(tokens, startIndex) {
  // Tracks nested braces: { ... { ... } ... }
  let depth = 0;

  for (let i = startIndex; i < tokens.length; i++) {
    const t = tokens[i];

    // Only punctuators can affect brace depth
    if (t.type === "punctuator") {

      // Opening brace: increase depth only if it's not the first "{"
      // because the top-level "{ ... }" should be considered depth 0
      if (t.value === "{") {
        if (i !== startIndex) depth++;
      }

      // Closing brace
      else if (t.value === "}") {
        // If depth is zero, this is the matching shallow "}"
        if (depth === 0) return i;

        // Otherwise, close one nested level
        depth--;
      }
    }
  }

  // No matching shallow closing brace found
  return null;
}
