/**
 * cleanUpCode(code)
 * -----------------
 * Lightweight minifier for JavaScript source code.
 *
 * Features:
 * - Removes newlines, carriage returns, and tabs
 * - Collapses multiple spaces into one
 * - Removes spaces around symbols such as {},();,:
 * - Removes space after opening symbols { ( [
 * - Preserves strings, template literals, and regex literals
 * - Special case: If a template literal is assigned to `.innerHTML`,
 *   its HTML content is also minified into a single line
 */
export default function cleanUpCode(code) {
  let result = "";
  let inSingle = false, inDouble = false, inTemplate = false, inRegex = false;
  let prev = "";

  let buffer = "";         // Collects content inside template literals
  let isInnerHTML = false; // Flag → are we inside an `innerHTML =` template?

  for (let i = 0; i < code.length; i++) {
    const c = code[i];

    // --- Detect backtick first (opening/closing template literal) ---
    if (c === "`" && !inSingle && !inDouble && !inRegex && prev !== "\\") {
      if (inTemplate) {
        // Closing template literal
        if (isInnerHTML) {
          // Minify HTML inside innerHTML template
          const minified = buffer
            .replace(/\s+/g, " ")    // collapse all whitespace
            .replace(/>\s+</g, "><") // remove space/newline between tags
            .trim();                 // remove leading/trailing space
          result += "`" + minified + "`";
          isInnerHTML = false;
        } else {
          // Normal template literal → just trim outer whitespace
          result += "`" + buffer.trim() + "`";
        }
        buffer = "";
      } else {
        // Opening template literal → check if it's after `.innerHTML =`
        const before = result.slice(-50); // look behind with wider range
        if (/innerHTML\s*=$/.test(before)) {
          isInnerHTML = true;
        }
      }
      inTemplate = !inTemplate;
      prev = c;
      continue;
    }

    // --- Toggle quote/regex states ---
    if (c === "'" && !inDouble && !inTemplate && !inRegex && prev !== "\\") {
      inSingle = !inSingle;
    } else if (c === '"' && !inSingle && !inTemplate && !inRegex && prev !== "\\") {
      inDouble = !inDouble;
    } else if (c === "/" && !inSingle && !inDouble && !inTemplate && prev !== "\\") {
      // Heuristic: regex starts after certain symbols or whitespace
      if (!inRegex && /[\(\{=:\[,]|\s/.test(prev)) {
        inRegex = true;
      } else if (inRegex) {
        inRegex = false;
      }
    }

    // --- Inside template literal → just collect ---
    if (inTemplate) {
      if (c === "\n" || c === "\r" || c === "\t") {
        if (buffer.slice(-1) !== " ") buffer += " ";
      } else {
        buffer += c;
      }
      prev = c;
      continue;
    }

    // --- Inside string or regex → output as-is ---
    if (inSingle || inDouble || inRegex) {
      result += c;
      prev = c;
      continue;
    }

    // --- Whitespace cleanup outside literals ---
    if (c === "\n" || c === "\r" || c === "\t") {
      prev = c;
      continue;
    }

    // --- Space cleanup outside literals ---
    if (c === " ") {
      const next = code[i + 1] || "";

      // Skip space before symbols
      if (/[\{\}\(\)\[\];,:]/.test(prev)) {
        prev = c;
        continue;
      }
      // Skip space after symbols
      if (/[\{\}\(\)\[\];,:]/.test(next)) {
        prev = c;
        continue;
      }
      // Skip space after opening { ( [
      if (/[\{\(\[]/.test(prev)) {
        prev = c;
        continue;
      }
    }

    // Append character to result
    result += c;
    prev = c;
  }

  // Collapse multiple spaces into one and trim edges
  return result.replace(/ {2,}/g, " ").trim();
}
