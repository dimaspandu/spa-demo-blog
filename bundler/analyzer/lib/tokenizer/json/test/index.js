import jsonTokenizer from "../main.js";
import runTest from "../../../../utils/tester.js";

/**
 * BASIC VALUES
 */

runTest(
  "Literal - null",
  jsonTokenizer(`null`).map(t => ({ type: t.type, value: t.value })),
  [
    { type: "literal", value: "null" }
  ]
);

runTest(
  "Literal - boolean true",
  jsonTokenizer(`true`).map(t => ({ type: t.type, value: t.value })),
  [
    { type: "literal", value: "true" }
  ]
);

runTest(
  "Literal - boolean false",
  jsonTokenizer(`false`).map(t => ({ type: t.type, value: t.value })),
  [
    { type: "literal", value: "false" }
  ]
);

/**
 * STRINGS
 */

runTest(
  "String - simple",
  jsonTokenizer(`"hello"`).map(t => ({ type: t.type, value: t.value })),
  [
    { type: "string", value: "\"hello\"" }
  ]
);

runTest(
  "String - escaped characters",
  jsonTokenizer(`"a\\nb\\t\\"c"`).map(t => ({ type: t.type, value: t.value })),
  [
    { type: "string", value: "\"a\\nb\\t\\\"c\"" }
  ]
);

/**
 * NUMBERS
 */

runTest(
  "Number - integer",
  jsonTokenizer(`123`).map(t => ({ type: t.type, value: t.value })),
  [
    { type: "number", value: "123" }
  ]
);

runTest(
  "Number - negative float",
  jsonTokenizer(`-0.75`).map(t => ({ type: t.type, value: t.value })),
  [
    { type: "number", value: "-0.75" }
  ]
);

runTest(
  "Number - exponent",
  jsonTokenizer(`1.2e+10`).map(t => ({ type: t.type, value: t.value })),
  [
    { type: "number", value: "1.2e+10" }
  ]
);

/**
 * OBJECTS
 */

runTest(
  "Object - empty",
  jsonTokenizer(`{}`).map(t => ({ type: t.type, value: t.value })),
  [
    { type: "punctuator", value: "{" },
    { type: "punctuator", value: "}" }
  ]
);

runTest(
  "Object - simple key value",
  jsonTokenizer(`{"a":1}`).map(t => ({ type: t.type, value: t.value })),
  [
    { type: "punctuator", value: "{" },
    { type: "string", value: "\"a\"" },
    { type: "punctuator", value: ":" },
    { type: "number", value: "1" },
    { type: "punctuator", value: "}" }
  ]
);

runTest(
  "Object - multiple properties",
  jsonTokenizer(`{"a":1,"b":true,"c":null}`).map(t => ({ type: t.type, value: t.value })),
  [
    { type: "punctuator", value: "{" },
    { type: "string", value: "\"a\"" },
    { type: "punctuator", value: ":" },
    { type: "number", value: "1" },
    { type: "punctuator", value: "," },
    { type: "string", value: "\"b\"" },
    { type: "punctuator", value: ":" },
    { type: "literal", value: "true" },
    { type: "punctuator", value: "," },
    { type: "string", value: "\"c\"" },
    { type: "punctuator", value: ":" },
    { type: "literal", value: "null" },
    { type: "punctuator", value: "}" }
  ]
);

/**
 * ARRAYS
 */

runTest(
  "Array - empty",
  jsonTokenizer(`[]`).map(t => ({ type: t.type, value: t.value })),
  [
    { type: "punctuator", value: "[" },
    { type: "punctuator", value: "]" }
  ]
);

runTest(
  "Array - mixed values",
  jsonTokenizer(`[1,"a",false,null]`).map(t => ({ type: t.type, value: t.value })),
  [
    { type: "punctuator", value: "[" },
    { type: "number", value: "1" },
    { type: "punctuator", value: "," },
    { type: "string", value: "\"a\"" },
    { type: "punctuator", value: "," },
    { type: "literal", value: "false" },
    { type: "punctuator", value: "," },
    { type: "literal", value: "null" },
    { type: "punctuator", value: "]" }
  ]
);

/**
 * WHITESPACE & NEWLINES
 */

runTest(
  "Whitespace preserved",
  jsonTokenizer(`{ "a" : 1 }`).map(t => ({ type: t.type, value: t.value })),
  [
    { type: "punctuator", value: "{" },
    { type: "whitespace", value: " " },
    { type: "string", value: "\"a\"" },
    { type: "whitespace", value: " " },
    { type: "punctuator", value: ":" },
    { type: "whitespace", value: " " },
    { type: "number", value: "1" },
    { type: "whitespace", value: " " },
    { type: "punctuator", value: "}" }
  ]
);

runTest(
  "Newlines preserved",
  jsonTokenizer(`{\n  "a": 1\n}`).map(t => ({ type: t.type, value: t.value })),
  [
    { type: "punctuator", value: "{" },
    { type: "newline", value: "\n" },
    { type: "whitespace", value: "  " },
    { type: "string", value: "\"a\"" },
    { type: "punctuator", value: ":" },
    { type: "whitespace", value: " " },
    { type: "number", value: "1" },
    { type: "newline", value: "\n" },
    { type: "punctuator", value: "}" }
  ],
  true
);

/**
 * ERROR CASES (STRICT JSON)
 */

runTest(
  "Invalid - trailing comma",
  () => jsonTokenizer(`{"a":1,}`),
  SyntaxError
);

runTest(
  "Invalid - comment",
  () => jsonTokenizer(`{ /* no */ "a":1 }`),
  SyntaxError
);

runTest(
  "Invalid - unquoted key",
  () => jsonTokenizer(`{a:1}`),
  SyntaxError
);
