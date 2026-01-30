import stripQuotes from "./stripQuotes.js";

/* ----------------------------------------------------------
 * Parse object assertion { something: "val" }
 * ---------------------------------------------------------- */
export default function parseAssertionObject(tokens, startIndex) {
  let i = startIndex;

  if (!(tokens[i] && tokens[i].value === "{")) {
    return { object: null, nextIndex: startIndex };
  }

  i++;
  const obj = {};

  while (tokens[i] && tokens[i].value !== "}") {
    const key = tokens[i].value;
    i++;

    if (tokens[i] && tokens[i].value === ":") {
      i++;
      const valToken = tokens[i];
      if (valToken && valToken.type === "string") {
        obj[key] = stripQuotes(valToken.value);
      }
      i++;
    }

    if (tokens[i] && tokens[i].value === ",") i++;
  }

  return {
    object: obj,
    nextIndex: i + 1
  };
} 