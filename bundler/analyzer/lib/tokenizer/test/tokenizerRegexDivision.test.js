import tokenizer from "../main.js";
import runTest from "../../../utils/tester.js";

/**
 * Regression tests for distinguishing division operators ("/")
 * from regular expression literals.
 *
 * These tests ensure that whitespace and comments do NOT affect
 * the contextual decision of whether "/" starts a regex literal
 * or represents a division operator.
 *
 * This file protects the fix that relies on lastSignificantToken().
 */

// -----------------------------------------------------------------------------
// Division operator cases
// -----------------------------------------------------------------------------

runTest(
  "Division operator without whitespace",
  tokenizer(`const x = a/b;`).map(t => ({
    type: t.type,
    value: t.value
  })),
  [
    { type: "keyword", value: "const" },
    { type: "whitespace", value: " " },
    { type: "identifier", value: "x" },
    { type: "whitespace", value: " " },
    { type: "punctuator", value: "=" },
    { type: "whitespace", value: " " },
    { type: "identifier", value: "a" },
    { type: "punctuator", value: "/" },
    { type: "identifier", value: "b" },
    { type: "punctuator", value: ";" }
  ]
);

runTest(
  "Division operator with whitespace",
  tokenizer(`const x = a / b;`).map(t => ({
    type: t.type,
    value: t.value
  })),
  [
    { type: "keyword", value: "const" },
    { type: "whitespace", value: " " },
    { type: "identifier", value: "x" },
    { type: "whitespace", value: " " },
    { type: "punctuator", value: "=" },
    { type: "whitespace", value: " " },
    { type: "identifier", value: "a" },
    { type: "whitespace", value: " " },
    { type: "punctuator", value: "/" },
    { type: "whitespace", value: " " },
    { type: "identifier", value: "b" },
    { type: "punctuator", value: ";" }
  ]
);

runTest(
  "Division inside grouped expression with whitespace",
  tokenizer(`(passed / total) * 100;`).map(t => ({
    type: t.type,
    value: t.value
  })),
  [
    { type: "punctuator", value: "(" },
    { type: "identifier", value: "passed" },
    { type: "whitespace", value: " " },
    { type: "punctuator", value: "/" },
    { type: "whitespace", value: " " },
    { type: "identifier", value: "total" },
    { type: "punctuator", value: ")" },
    { type: "whitespace", value: " " },
    { type: "punctuator", value: "*" },
    { type: "whitespace", value: " " },
    { type: "number", value: "100" },
    { type: "punctuator", value: ";" }
  ]
);

// -----------------------------------------------------------------------------
// Regex literal cases (control tests)
// -----------------------------------------------------------------------------

runTest(
  "Regex literal after assignment",
  tokenizer(`const r = /abc+/gi;`).map(t => ({
    type: t.type,
    value: t.value
  })),
  [
    { type: "keyword", value: "const" },
    { type: "whitespace", value: " " },
    { type: "identifier", value: "r" },
    { type: "whitespace", value: " " },
    { type: "punctuator", value: "=" },
    { type: "whitespace", value: " " },
    { type: "regex", value: "/abc+/gi" },
    { type: "punctuator", value: ";" }
  ]
);

runTest(
  "Regex literal after return keyword",
  tokenizer(`function f(){ return /x*/; }`).map(t => ({
    type: t.type,
    value: t.value
  })),
  [
    { type: "keyword", value: "function" },
    { type: "whitespace", value: " " },
    { type: "identifier", value: "f" },
    { type: "punctuator", value: "(" },
    { type: "punctuator", value: ")" },
    { type: "punctuator", value: "{" },
    { type: "whitespace", value: " " },
    { type: "keyword", value: "return" },
    { type: "whitespace", value: " " },
    { type: "regex", value: "/x*/" },
    { type: "punctuator", value: ";" },
    { type: "whitespace", value: " " },
    { type: "punctuator", value: "}" }
  ]
);

// -----------------------------------------------------------------------------
// Comment + whitespace edge case
// -----------------------------------------------------------------------------

runTest(
  "Division operator after comment",
  tokenizer(`a /*comment*/ / b;`).map(t => ({
    type: t.type,
    value: t.value
  })),
  [
    { type: "identifier", value: "a" },
    { type: "whitespace", value: " " },
    { type: "comment", value: "/*comment*/" },
    { type: "whitespace", value: " " },
    { type: "punctuator", value: "/" },
    { type: "whitespace", value: " " },
    { type: "identifier", value: "b" },
    { type: "punctuator", value: ";" }
  ],
  true
);
