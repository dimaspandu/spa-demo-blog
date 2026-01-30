import cssTokenizer from "../main.js";
import runTest from "../../../../utils/tester.js";

/**
 * BASIC SELECTORS
 */

runTest(
  "Selector - simple class",
  cssTokenizer(`.box {}`).map(t => ({ type: t.type, value: t.value })),
  [
    { type: "punctuator", value: "." },
    { type: "identifier", value: "box" },
    { type: "whitespace", value: " " },
    { type: "punctuator", value: "{" },
    { type: "punctuator", value: "}" }
  ]
);

runTest(
  "Selector - id",
  cssTokenizer(`#main {}`).map(t => ({ type: t.type, value: t.value })),
  [
    { type: "hash", value: "#main" },
    { type: "whitespace", value: " " },
    { type: "punctuator", value: "{" },
    { type: "punctuator", value: "}" }
  ]
);

/**
 * PROPERTIES & VALUES
 */

runTest(
  "Declaration - simple property",
  cssTokenizer(`color: red;`).map(t => ({ type: t.type, value: t.value })),
  [
    { type: "identifier", value: "color" },
    { type: "punctuator", value: ":" },
    { type: "whitespace", value: " " },
    { type: "identifier", value: "red" },
    { type: "punctuator", value: ";" }
  ]
);

runTest(
  "Declaration - dimension",
  cssTokenizer(`width: 100px;`).map(t => ({ type: t.type, value: t.value })),
  [
    { type: "identifier", value: "width" },
    { type: "punctuator", value: ":" },
    { type: "whitespace", value: " " },
    { type: "dimension", value: "100px" },
    { type: "punctuator", value: ";" }
  ]
);

runTest(
  "Declaration - float dimension",
  cssTokenizer(`opacity: 0.75;`).map(t => ({ type: t.type, value: t.value })),
  [
    { type: "identifier", value: "opacity" },
    { type: "punctuator", value: ":" },
    { type: "whitespace", value: " " },
    { type: "number", value: "0.75" },
    { type: "punctuator", value: ";" }
  ]
);

/**
 * FUNCTIONS
 */

runTest(
  "Value - function",
  cssTokenizer(`transform: rotate(45deg);`).map(t => ({ type: t.type, value: t.value })),
  [
    { type: "identifier", value: "transform" },
    { type: "punctuator", value: ":" },
    { type: "whitespace", value: " " },
    { type: "function", value: "rotate" },
    { type: "punctuator", value: "(" },
    { type: "dimension", value: "45deg" },
    { type: "punctuator", value: ")" },
    { type: "punctuator", value: ";" }
  ]
);

/**
 * STRINGS
 */

runTest(
  "String - url path",
  cssTokenizer(`background: "img/bg.png";`).map(t => ({ type: t.type, value: t.value })),
  [
    { type: "identifier", value: "background" },
    { type: "punctuator", value: ":" },
    { type: "whitespace", value: " " },
    { type: "string", value: "\"img/bg.png\"" },
    { type: "punctuator", value: ";" }
  ]
);

/**
 * COMMENTS
 */

runTest(
  "Comment - block",
  cssTokenizer(`/* hello */`).map(t => ({ type: t.type, value: t.value })),
  [
    { type: "comment", value: "/* hello */" }
  ]
);

/**
 * AT-RULES
 */

runTest(
  "@media rule",
  cssTokenizer(`@media screen and (max-width: 600px) {}`).map(t => ({ type: t.type, value: t.value })),
  [
    { type: "at_keyword", value: "@media" },
    { type: "whitespace", value: " " },
    { type: "identifier", value: "screen" },
    { type: "whitespace", value: " " },
    { type: "identifier", value: "and" },
    { type: "whitespace", value: " " },
    { type: "punctuator", value: "(" },
    { type: "identifier", value: "max-width" },
    { type: "punctuator", value: ":" },
    { type: "whitespace", value: " " },
    { type: "dimension", value: "600px" },
    { type: "punctuator", value: ")" },
    { type: "whitespace", value: " " },
    { type: "punctuator", value: "{" },
    { type: "punctuator", value: "}" }
  ]
);

/**
 * HASH COLORS
 */

runTest(
  "Color - hex",
  cssTokenizer(`color: #fff;`).map(t => ({ type: t.type, value: t.value })),
  [
    { type: "identifier", value: "color" },
    { type: "punctuator", value: ":" },
    { type: "whitespace", value: " " },
    { type: "hash", value: "#fff" },
    { type: "punctuator", value: ";" }
  ]
);

/**
 * COMPLEX SELECTORS
 */

runTest(
  "Selector - combinators",
  cssTokenizer(`ul > li.active + li:hover {}`).map(t => ({ type: t.type, value: t.value })),
  [
    { type: "identifier", value: "ul" },
    { type: "whitespace", value: " " },
    { type: "punctuator", value: ">" },
    { type: "whitespace", value: " " },
    { type: "identifier", value: "li" },
    { type: "punctuator", value: "." },
    { type: "identifier", value: "active" },
    { type: "whitespace", value: " " },
    { type: "punctuator", value: "+" },
    { type: "whitespace", value: " " },
    { type: "identifier", value: "li" },
    { type: "punctuator", value: ":" },
    { type: "identifier", value: "hover" },
    { type: "whitespace", value: " " },
    { type: "punctuator", value: "{" },
    { type: "punctuator", value: "}" }
  ]
);

/**
 * NEWLINES
 */

runTest(
  "Newlines preserved",
  cssTokenizer(`a {\n  color: red;\n}`).map(t => ({ type: t.type, value: t.value })),
  [
    { type: "identifier", value: "a" },
    { type: "whitespace", value: " " },
    { type: "punctuator", value: "{" },
    { type: "newline", value: "\n" },
    { type: "whitespace", value: "  " },
    { type: "identifier", value: "color" },
    { type: "punctuator", value: ":" },
    { type: "whitespace", value: " " },
    { type: "identifier", value: "red" },
    { type: "punctuator", value: ";" },
    { type: "newline", value: "\n" },
    { type: "punctuator", value: "}" }
  ],
  true
);
