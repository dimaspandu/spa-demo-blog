/**
 * cleanUpStyle(css)
 * -----------------
 * Lightweight minifier for CSS source code.
 *
 * Features:
 * - Removes newlines, carriage returns, and tabs
 * - Collapses multiple spaces into one
 * - Removes spaces around symbols such as {}();:>,=
 * - Preserves strings (normalizes to double quotes)
 * - Ensures spacing after "and(" in media queries is corrected
 * - Removes unnecessary semicolons before "}"
 */
export default function cleanUpStyle(css) {
  let result = "";
  let inSingle = false, inDouble = false;
  let prev = "";

  for (let i = 0; i < css.length; i++) {
    const c = css[i];

    // --- Toggle string states ---
    if (c === "'" && !inDouble && prev !== "\\") {
      inSingle = !inSingle;
      // normalize to double quote
      result += "\"";
      prev = c;
      continue;
    } else if (c === '"' && !inSingle && prev !== "\\") {
      inDouble = !inDouble;
      result += "\"";
      prev = c;
      continue;
    }

    // --- Inside string → keep content as-is ---
    if (inSingle || inDouble) {
      result += c;
      prev = c;
      continue;
    }

    // --- Remove newlines, carriage returns, tabs ---
    if (c === "\n" || c === "\r" || c === "\t") {
      prev = c;
      continue;
    }

    // --- Handle spaces outside strings ---
    if (c === " ") {
      const next = css[i + 1] || "";

      // Skip space if before or after symbol
      if (/[\{\}\(\);:,>+=]/.test(prev) || /[\{\}\(\);:,>+=]/.test(next)) {
        prev = c;
        continue;
      }
    }

    result += c;
    prev = c;
  }

  // --- Post-processing cleanup ---
  let cleaned = result
    .replace(/ {2,}/g, " ") // collapse multiple spaces
    .trim();

  // Remove spaces after { or ;, before }
  cleaned = cleaned
    .replace(/\{\s+/g, "{")
    .replace(/;\s+/g, ";")
    .replace(/\s+\}/g, "}");

  // Remove space before :
  cleaned = cleaned.replace(/\s*:\s*/g, ":");

  // Remove space around =
  cleaned = cleaned.replace(/\s*=\s*/g, "=");

  // Remove semicolon right before }
  cleaned = cleaned.replace(/;+\}/g, "}");

  // Fix "and(" → "and ("
  cleaned = cleaned.replace(/and\(/g, "and (");

  return cleaned;
}
