/**
 * stripComments(code)
 * -------------------
 * Removes both single-line (//) and multi-line (/* ... * /) comments
 * while preserving strings, template literals, and regex literals.
 * This ensures that comment-like sequences inside strings/regex are not removed.
 */
export default function stripComments(code) {
  let result = "";
  let insideSingleQuote = false;
  let insideDoubleQuote = false;
  let insideTemplate = false;
  let insideRegex = false;
  let insideBlockComment = false;
  let insideLineComment = false;
  let prevChar = "";

  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    const nextChar = code[i + 1];

    // Handle block comment
    if (insideBlockComment) {
      if (char === "*" && nextChar === "/") {
        insideBlockComment = false;
        i++; // Skip closing '/'
      }
      continue;
    }

    // Handle line comment
    if (insideLineComment) {
      if (char === "\n") {
        insideLineComment = false;
        result += char; // Preserve newline
      }
      continue;
    }

    // Detect start of comment when not inside quotes/templates/regex
    if (!insideSingleQuote && !insideDoubleQuote && !insideTemplate && !insideRegex) {
      if (char === "/" && nextChar === "*") {
        insideBlockComment = true;
        i++;
        continue;
      }
      if (char === "/" && nextChar === "/") {
        insideLineComment = true;
        i++;
        continue;
      }
    }

    // Toggle states for strings/templates/regex
    if (char === '"' && !insideSingleQuote && !insideTemplate && !insideRegex && prevChar !== "\\") {
      insideDoubleQuote = !insideDoubleQuote;
    } else if (char === "'" && !insideDoubleQuote && !insideTemplate && !insideRegex && prevChar !== "\\") {
      insideSingleQuote = !insideSingleQuote;
    } else if (char === "`" && !insideSingleQuote && !insideDoubleQuote && !insideRegex && prevChar !== "\\") {
      insideTemplate = !insideTemplate;
    } else if (char === "/" && !insideSingleQuote && !insideDoubleQuote && !insideTemplate && prevChar !== "\\") {
      // Simple heuristic to detect regex literals
      if (
        (!insideRegex && /[\(\[=:\,!\?\{\}\;\+\-\*\/]|\breturn\b|\bcase\b|\bthrow\b/.test(prevChar)) ||
        prevChar.trim() === ""
      ) {
        insideRegex = true;
      } else if (insideRegex) {
        insideRegex = false;
      }
    }

    result += char;
    prevChar = char;
  }

  return result;
}