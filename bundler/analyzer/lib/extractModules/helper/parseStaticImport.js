import stripQuotes from "./stripQuotes.js";
import parseAssertionObject from "./parseAssertionObject.js";

/* ----------------------------------------------------------
 * Parse static import
 * ---------------------------------------------------------- */
export default function parseStaticImport(tokens, startIndex) {
  let i = startIndex;

  // Move to string literal
  while (tokens[i] && tokens[i].type !== "string") {
    i++;
  }

  const moduleToken = tokens[i];
  const moduleName = moduleToken ? stripQuotes(moduleToken.value) : null;

  i++;

  // Optional assert/with
  let assertions = null;

  if (tokens[i] && (tokens[i].value === "assert" || tokens[i].value === "with")) {
    i++;
    const parsed = parseAssertionObject(tokens, i);
    assertions = parsed.object;
    i = parsed.nextIndex;
  }

  // Move until ';'
  while (tokens[i] && !(tokens[i].type === "punctuator" && tokens[i].value === ";")) {
    i++;
  }

  return {
    result: {
      module: moduleName,
      type: "static",
      assertions,
      literal: true,
      reason: null
    },
    nextIndex: i + 1
  };
}