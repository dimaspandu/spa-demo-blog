import htmlTokenizer from "../../tokenizer/html/main.js";
import stringifyHTMLTokens from "../../stringifyTokens/html/main.js";

/**
 * minifyHTML(code)
 * ------------------------------------------------------------
 * Safe HTML / SVG / XML minifier using flat tokens.
 *
 * Rules:
 * - Remove comments and newline tokens
 * - Remove indentation whitespace between tags
 * - Preserve real text node whitespace
 * - Normalize whitespace inside tags
 * - Normalize self-closing tags
 * - Preserve XML declaration spacing
 *
 * @param {string} code
 * @returns {string}
 */
export default function minifyHTML(code) {
  if (typeof code !== "string" || code.length === 0) return "";

  const tokens = htmlTokenizer(code);
  const cleaned = [];

  let insideTag = false;
  let sawNewline = false;

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    const prev = cleaned.at(-1);
    const next = tokens[i + 1]; // hold on, I forgot when was the last time I used it

    // -------------------------------------------------
    // XML declaration handling (<?xml ... ?>)
    // -------------------------------------------------
    if (t.type === "xml_declaration") {
      cleaned.push({
        ...t,
        value: t.value
          .replace(/\s+\?>$/, "?>")        // remove space before ?>
          .replace(/<\?xml(?=\w)/, "<?xml ") // ensure space after ?xml
      });
      sawNewline = false;
      continue;
    }

    // -------------------------------------------------
    // Remove formatting-only tokens
    // -------------------------------------------------
    if (t.type === "comment") continue;

    if (t.type === "newline") {
      sawNewline = true;
      continue;
    }

    // -------------------------------------------------
    // Track tag boundaries
    // -------------------------------------------------
    if (t.type === "tag_open") insideTag = true;

    if (t.type === "tag_end" || t.type === "tag_self_close") {
      insideTag = false;
    }

    // -------------------------------------------------
    // Whitespace handling
    // -------------------------------------------------
    if (t.type === "whitespace") {
      // Inside tag → normalize attribute spacing
      if (insideTag) {
        if (
          prev &&
          (prev.type === "tag_name" || prev.type === "attr_value")
        ) {
          cleaned.push({ ...t, value: " " });
        }
        continue;
      }

      // Outside tag
      // Indentation after newline → drop
      if (sawNewline) continue;

      // Inline text spacing → preserve
      cleaned.push(t);
      continue;
    }

    // -------------------------------------------------
    // Text nodes
    // -------------------------------------------------
    if (t.type === "text") {
      // Multiline text → trim
      if (t.value.includes("\n")) {
        const v = t.value.trim();
        if (v) cleaned.push({ ...t, value: v });
        sawNewline = false;
        continue;
      }

      // Inline text → preserve fully
      cleaned.push(t);
      sawNewline = false;
      continue;
    }

    // -------------------------------------------------
    // Normalize self-closing tags: " />" → "/>"
    // -------------------------------------------------
    if (
      t.type === "tag_self_close" &&
      prev?.type === "whitespace"
    ) {
      cleaned.pop();
    }

    cleaned.push(t);
    sawNewline = false;
  }

  const result = stringifyHTMLTokens(cleaned);

  // -------------------------------------------------
  // Edge case: only whitespace
  // -------------------------------------------------
  return result.trim() === "" ? "" : result;
}
