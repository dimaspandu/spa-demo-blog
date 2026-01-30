/**
 * Convert an array of token objects back into a JavaScript source string.
 * The function attempts to restore the original spacing rules between tokens
 * without performing full formatting or pretty-printing. It only inserts
 * spaces when absolutely necessary to avoid unintended token merging or
 * syntactic changes.
 */
export default function stringifyTokens(tokens) {
  if (!Array.isArray(tokens) || tokens.length === 0) return "";

  let out = "";

  for (let i = 0; i < tokens.length; i++) {
    const prev = tokens[i - 1];
    const curr = tokens[i];

    // First token: no adjacency checks needed.
    if (!prev) {
      out += curr.value;
      continue;
    }

    const p = prev;
    const c = curr;

    let needSpace = false;

    /**
     * Template literals require special handling:
     * - The tokenizer provides templates as atomic tokens.
     * - Concatenating template tokens must not introduce spaces because
     *   template delimiters (`, ${`, `}`) have strict syntactic meaning.
     */
    if (p.type === "template" || c.type === "template") {
      out += c.value;
      continue;
    }

    /**
     * Adjacent identifiers/keywords and private identifiers must be separated.
     * Examples:
     *   "let" + "x" → "let x"
     *   "foo" + "bar" → "foo bar"
     *   "identifier" + "#private" → "identifier #private"
     */
    if (
      (isWord(p) && isWord(c)) ||
      (isWord(p) && isPrivateId(c)) ||
      (isPrivateId(p) && isWord(c))
    ) {
      needSpace = true;
    }

    /**
     * Number followed by a word-like token must be spaced to avoid accidental
     * merging into a single identifier.
     * Example:
     *   "1" + "in" → "1 in"  (otherwise becomes invalid "1in")
     */
    if (p.type === "number" && (isWord(c) || isPrivateId(c))) {
      needSpace = true;
    }

    /**
     * Word followed by a number can also be ambiguous.
     * Example:
     *   "await" + "1" → "await 1"
     * This rule errs on the safe side by always inserting a space.
     */
    if (isWord(p) && c.type === "number") {
      needSpace = true;
    }

    /**
     * Punctuator adjacency edge cases:
     * Some token pairs must be spaced to prevent unintended operators forming.
     * Tokenizer normally splits valid multi-character punctuators, but pairs
     * like "--" followed by ">" must be prevented from collapsing into "-->".
     */
    if (p.type === "punctuator" && c.type === "punctuator") {
      if (needsPunctuatorSpace(p.value, c.value)) {
        needSpace = true;
      }
    }

    /**
     * Division vs regex ambiguity is resolved at the tokenizer stage,
     * so this assembler does not attempt to re-disambiguate them.
     */

    out += needSpace ? " " + c.value : c.value;
  }

  return out;
}

/**
 * Determine whether a token is "word-like"
 * (identifier or keyword), meaning it participates
 * in spacing rules that prevent accidental merging.
 */
function isWord(tok) {
  return tok.type === "identifier" || tok.type === "keyword";
}

/**
 * Check whether a token represents a private class field (#x).
 */
function isPrivateId(tok) {
  return tok.type === "privateIdentifier";
}

/**
 * Determine whether two adjacent punctuators require a space
 * to avoid merging into an unintended operator.
 *
 * This function is intentionally conservative: it only handles
 * known ambiguous cases. Additional rules can be added as needed.
 */
function needsPunctuatorSpace(a, b) {
  // Prevent merging "--" + ">" into the JSX closing syntax "-->"
  if (a === "--" && b === ">") return true;

  // Prevent ambiguous sequence "+ ++" or "- --"
  if (a === "+" && b === "++") return true;
  if (a === "-" && b === "--") return true;

  // No space required by default
  return false;
}
