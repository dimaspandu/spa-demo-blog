import {
  cleanUpCode,
  cleanUpStyle,
  stripComments
} from "./index.js";

/**
 * stripHTMLComments(html)
 * -----------------------
 * Removes:
 * - HTML comments <!-- ... -->
 * - JS/CSS comments inside <script>...</script> or <style>...</style>
 * Additionally:
 * - Minifies JS inside <script> tags using cleanUpCode
 * - Minifies CSS inside <style> tags using cleanUpStyle
 *
 * @param {string} html - The input HTML string
 * @returns {string} - The processed HTML string with comments stripped and inline JS/CSS minified
 */
export default function stripHTMLComments(html) {
  let output = "";

  // Regex with capture group for tag name (script/style)
  const regex = /<(script|style)([\s\S]*?)>([\s\S]*?)<\/\1>/gi;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(html)) !== null) {
    // Part before the block → strip HTML comments
    const before = html.slice(lastIndex, match.index);
    output += before.replace(/<!--[\s\S]*?-->/g, "");

    const tagName = match[1].toLowerCase();
    const attrs = match[2] || "";
    const inner = match[3] || "";

    // Strip JS/CSS comments first
    let cleanedInner = stripComments(inner);

    // Then minify by type
    if (tagName === "script") {
      cleanedInner = cleanUpCode(cleanedInner);
    } else if (tagName === "style") {
      cleanedInner = cleanUpStyle(cleanedInner);
    }

    // Reconstruct block
    output += `<${tagName}${attrs}>${cleanedInner}</${tagName}>`;

    lastIndex = regex.lastIndex;
  }

  // Remaining tail → strip HTML comments
  output += html.slice(lastIndex).replace(/<!--[\s\S]*?-->/g, "");

  return output;
}
