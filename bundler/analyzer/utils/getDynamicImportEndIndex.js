/**
 * Determine the end index of a dynamic `import(...)` expression.
 *
 * This inspects the token stream starting at `startIndex`,
 * which must point to the `import` keyword *used as an expression*.
 *
 * Example supported patterns:
 *   - import("module")
 *   - import(`./style-${theme}.css`)
 *   - import("module", { with: { type: "css" } })
 *   - import("module").then(...)
 *   - import("module").then(...).catch(...)
 *
 * This function finds:
 *   - the end of the import argument list:  import( ... )
 *   - optionally continues through chained calls:
 *         import(...).then(...).catch(...)
 *   - returns the index of the final token belonging to that chain.
 */
export default function getDynamicImportEndIndex(tokens, startIndex) {
  let i = startIndex;

  // Must start at 'import'
  if (tokens[i].value !== "import") {
    throw new Error("Start index must point to 'import'");
  }

  i++;

  // --------------------------------------------------------------------
  // CASE 1: import without parentheses → NOT dynamic import
  //         (this is actually 'import identifier from "..."') → invalid here
  // --------------------------------------------------------------------
  if (tokens[i].value !== "(") {
    throw new Error("This 'import' is not a dynamic import expression");
  }

  // --------------------------------------------------------------------
  // CASE 2: parse the import( ... ) call
  // --------------------------------------------------------------------
  const importCallEnd = findMatching(tokens, i, "(", ")");
  i = importCallEnd + 1;

  // --------------------------------------------------------------------
  // CASE 3: Support chained calls, e.g.:
  //         import("x").then(...).catch(...).finally(...)
  //
  // Pattern:
  //    . <identifier> ( ... )
  //    ^ token '.'   ^ optional 'then' | 'catch' | custom
  // --------------------------------------------------------------------
  while (true) {
    // Stop if no dot-chaining
    if (!tokens[i] || tokens[i].value !== ".") break;

    i++; // skip "."

    // Expect a property name: identifier or keyword (e.g. catch)
    if (
      !tokens[i] ||
      (tokens[i].type !== "identifier" && tokens[i].type !== "keyword")
    ) {
      break;
    }
    i++;

    // Expect "(" for the call
    if (!tokens[i] || tokens[i].value !== "(") break;

    // Skip the entire argument list
    const callEnd = findMatching(tokens, i, "(", ")");
    i = callEnd + 1;
  }

  // --------------------------------------------------------------------
  // CASE 4: optional semicolon terminator
  // --------------------------------------------------------------------
  if (tokens[i] && tokens[i].value === ";") return i;

  // Last meaningful token is before the semicolon or end
  return i - 1;
}

/**
 * Find the index of the matching closing token for a bracket pair.
 *
 * Supports parentheses ( ... ), braces { ... }, brackets [ ... ].
 * Tracks nested pairs and returns when depth returns to zero.
 */
function findMatching(tokens, startIndex, open, close) {
  let depth = 0;

  for (let i = startIndex; i < tokens.length; i++) {
    const t = tokens[i];

    if (t.value === open) {
      depth++;
    } else if (t.value === close) {
      depth--;
      if (depth === 0) return i;
    }
  }

  throw new Error("Unmatched " + open + " / " + close);
}
