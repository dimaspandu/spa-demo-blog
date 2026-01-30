import parseAssertionObject from "./parseAssertionObject.js";
import parseTemplateLiteral from "./parseTemplateLiteral.js";
import stripQuotes from "./stripQuotes.js";

/* ----------------------------------------------------------
 * Parse dynamic import(...)
 * ---------------------------------------------------------- */
export default function parseDynamicImport(tokens, startIndex) {
  let i = startIndex + 1; // points to '('
  i++; // now inside parentheses

  let moduleName = null;
  const t = tokens[i];

  // Import("string")
  if (t && t.type === "string") {
    moduleName = stripQuotes(t.value);
    i++;
  }

  // Import(`template-${x}.css`)
  else if (t && (t.type === "template_chunk" || t.type === "template")) {
    const tpl = parseTemplateLiteral(tokens, i);
    moduleName = tpl.value;
    i = tpl.nextIndex;
  }

  // Optional assertions: import(x, {...})
  let assertions = null;

  if (tokens[i] && tokens[i].value === ",") {
    i++;
    if (tokens[i] && tokens[i].value === "{") {
      const parsed = parseAssertionObject(tokens, i);
      assertions = parsed.object;
      i = parsed.nextIndex;
    }
  }

  // Move until ')'
  while (tokens[i] && !(tokens[i].type === "punctuator" && tokens[i].value === ")")) {
    i++;
  }

  return {
    result: {
      module: moduleName,
      type: "dynamic",
      assertions,
      literal: typeof moduleName === "string" && !moduleName.includes("${"),
      reason: moduleName && moduleName.includes("${") ? "template-literal" : null
    },
    nextIndex: i + 1
  };
}