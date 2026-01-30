import stringifyJSONTokens from "../main.js";
import runTest from "../../../../utils/tester.js";

/**
 * BASIC VALUES
 */

runTest(
  "JSON - empty object",
  stringifyJSONTokens([
    { type: "punctuator", value: "{" },
    { type: "punctuator", value: "}" }
  ]),
  "{}"
);

runTest(
  "JSON - empty array",
  stringifyJSONTokens([
    { type: "punctuator", value: "[" },
    { type: "punctuator", value: "]" }
  ]),
  "[]"
);

/**
 * OBJECT WITH PROPERTIES
 */

runTest(
  "JSON - simple object",
  stringifyJSONTokens([
    { type: "punctuator", value: "{" },
    { type: "string", value: "\"a\"" },
    { type: "punctuator", value: ":" },
    { type: "number", value: "1" },
    { type: "punctuator", value: "}" }
  ]),
  "{\"a\":1}"
);

runTest(
  "JSON - object with whitespace",
  stringifyJSONTokens([
    { type: "punctuator", value: "{" },
    { type: "newline", value: "\n" },
    { type: "whitespace", value: "  " },
    { type: "string", value: "\"a\"" },
    { type: "punctuator", value: ":" },
    { type: "whitespace", value: " " },
    { type: "number", value: "1" },
    { type: "punctuator", value: "," },
    { type: "newline", value: "\n" },
    { type: "whitespace", value: "  " },
    { type: "string", value: "\"b\"" },
    { type: "punctuator", value: ":" },
    { type: "whitespace", value: " " },
    { type: "literal", value: "true" },
    { type: "newline", value: "\n" },
    { type: "punctuator", value: "}" }
  ]),
  "{\n  \"a\": 1,\n  \"b\": true\n}"
);

/**
 * ARRAYS
 */

runTest(
  "JSON - array of numbers",
  stringifyJSONTokens([
    { type: "punctuator", value: "[" },
    { type: "number", value: "1" },
    { type: "punctuator", value: "," },
    { type: "number", value: "2" },
    { type: "punctuator", value: "," },
    { type: "number", value: "3" },
    { type: "punctuator", value: "]" }
  ]),
  "[1,2,3]"
);

runTest(
  "JSON - array with mixed values",
  stringifyJSONTokens([
    { type: "punctuator", value: "[" },
    { type: "number", value: "1" },
    { type: "punctuator", value: "," },
    { type: "string", value: "\"two\"" },
    { type: "punctuator", value: "," },
    { type: "literal", value: "null" },
    { type: "punctuator", value: "]" }
  ]),
  "[1,\"two\",null]"
);

/**
 * STRINGS AND ESCAPES
 */

runTest(
  "JSON - escaped string",
  stringifyJSONTokens([
    { type: "string", value: "\"a\\nb\"" }
  ]),
  "\"a\\nb\""
);

/**
 * EDGE CASES
 */

runTest(
  "Empty token array",
  stringifyJSONTokens([]),
  ""
);

runTest(
  "Invalid input",
  stringifyJSONTokens(null),
  "",
  true
);
