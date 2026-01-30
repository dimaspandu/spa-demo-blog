/**
 * stringifyCSSTokens(tokens)
 * ------------------------------------------------------------
 * Reconstructs a CSS source string from a flat token stream.
 *
 * This stringifier is intentionally minimal:
 * - It does not validate CSS grammar
 * - It does not normalize spacing or formatting
 * - It preserves all original token values verbatim
 *
 * The function is designed to be the final step in a
 * tokenizer → transformer → stringifier pipeline.
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

// stringifyCSSTokens.js
// ------------------------------------------------------------
// Reassembles CSS tokens into a minified CSS string.
// Inserts spaces only when required to prevent invalid token merging.

export default function stringifyCSSTokens(tokens) {
  if (!Array.isArray(tokens) || tokens.length === 0) return "";
  
  let out = "";

  for (let i = 0; i < tokens.length; i++) {
    const prev = tokens[i - 1];
    const curr = tokens[i];

    if (!prev) {
      out += curr.value;
      continue;
    }

    if (needsSpace(prev, curr)) {
      out += " ";
    }

    out += curr.value;
  }

  return out;
}

function isWord(t) {
  return (
    t.type === "identifier" ||
    t.type === "at_keyword" ||
    t.type === "function"
  );
}

function needsSpace(a, b) {
  if (!a || !b) return false;

  // word + word (media screen, and, etc)
  if (isWord(a) && isWord(b)) return true;

  // identifier + number/dimension (solid 1px, transform 0.2s)
  if (
    a.type === "identifier" &&
    (b.type === "number" || b.type === "dimension")
  ) return true;

  // number/dimension + identifier (100 %)
  if (
    (a.type === "number" || a.type === "dimension") &&
    b.type === "identifier"
  ) return true;

  // number/dimension + hash (1px #fff)
  if (
    (a.type === "number" || a.type === "dimension") &&
    b.type === "hash"
  ) return true;

  // at_keyword + identifier (@media screen)
  if (a.type === "at_keyword" && b.type === "identifier") return true;

  return false;
}

