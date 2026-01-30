import cssTokenizer from "../../tokenizer/css/main.js";
import stringifyCSSTokens from "../../stringifyTokens/css/main.js";
import { CSS_MINIFY_LEVEL } from "./constants.js";

/**
 * minifyCSS
 * ------------------------------------------------------------------
 * High-level CSS minification utility with configurable depth.
 *
 * Minification levels:
 *
 * - CSS_MINIFY_LEVEL.SAFE
 *   Removes comments and newline tokens only.
 *   All original whitespace is preserved.
 *
 * - CSS_MINIFY_LEVEL.DEEP (default)
 *   Removes comments, newlines, and whitespace,
 *   then re-stringifies tokens into compact CSS.
 *
 * @param {string} code - Raw CSS source code
 * @param {Object} [options]
 * @param {"safe" | "deep"} [options.level] - Minification level
 * @returns {string} Minified CSS output
 */
export default function minifyCSS(code, options = {}) {
  if (typeof code !== "string" || !code) return "";

  const level = options.level ?? CSS_MINIFY_LEVEL.DEEP;
  const tokens = cssTokenizer(code);

  // --------------------------------------------------------------
  // SAFE mode:
  // Remove comments and newlines only; preserve whitespace
  // --------------------------------------------------------------
  if (level === CSS_MINIFY_LEVEL.SAFE) {
    let out = "";
    let lastWasWhitespace = false;

    for (const t of tokens) {
      if (t.type === "comment" || t.type === "newline") {
        continue;
      }

      if (t.type === "whitespace") {
        // collapse multiple / long whitespace into a single space
        if (!lastWasWhitespace) {
          out += " ";
          lastWasWhitespace = true;
        }
        continue;
      }

      lastWasWhitespace = false;
      out += t.value;
    }

    // remove leading and trailing whitespace only
    return out.trim();
  }

  // --------------------------------------------------------------
  // DEEP mode:
  // Aggressive minification by removing comments, newlines,
  // and whitespace before re-stringifying tokens
  // --------------------------------------------------------------
  const cleaned = tokens.filter(
    (t) =>
      t.type !== "comment" &&
      t.type !== "newline" &&
      t.type !== "whitespace"
  );

  return stringifyCSSTokens(cleaned);
}
