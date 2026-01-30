import stripQuotes from "./stripQuotes.js";

/* ----------------------------------------------------------
 * NEW: Parse export-from statements
 *
 * export * from "mod";
 * export * as ns from "mod";
 * export { foo, bar } from "mod";
 * export { default as X } from "mod";
 *
 * Returns:
 * { result: { module, type: "export", literal, reason }, nextIndex }
 *
 * If the export statement does NOT include "from", return null.
 * ---------------------------------------------------------- */
export default function parseExportFrom(tokens, startIndex) {
  let i = startIndex + 1;

  // Skip until we see "from"
  while (tokens[i] && !(tokens[i].type === "identifier" && tokens[i].value === "from")) {
    // If we hit ';' before 'from' → this export has no module
    if (tokens[i].type === "punctuator" && tokens[i].value === ";") {
      return null;
    }
    i++;
  }

  // No "from" → ignore
  if (!tokens[i] || tokens[i].value !== "from") return null;

  i++; // move to string literal

  const moduleToken = tokens[i];
  if (!moduleToken || moduleToken.type !== "string") {
    return null; // malformed export-from
  }

  const moduleName = stripQuotes(moduleToken.value);
  i++;

  // Move until ';'
  while (tokens[i] && !(tokens[i].type === "punctuator" && tokens[i].value === ";")) {
    i++;
  }

  return {
    result: {
      module: moduleName,
      type: "export",
      assertions: null,
      literal: true,
      reason: null
    },
    nextIndex: i + 1
  };
}