import stringifyCSSTokens from "../main.js";
import runTest from "../../../../utils/tester.js";

/**
 * BASIC DECLARATIONS
 */

runTest(
  "CSS - simple declaration",
  stringifyCSSTokens([
    { type: "identifier", value: "color" },
    { type: "punctuator", value: ":" },
    { type: "whitespace", value: " " },
    { type: "identifier", value: "red" },
    { type: "punctuator", value: ";" }
  ]),
  "color: red;"
);

/**
 * SELECTORS
 */

runTest(
  "CSS - class selector",
  stringifyCSSTokens([
    { type: "punctuator", value: "." },
    { type: "identifier", value: "box" },
    { type: "whitespace", value: " " },
    { type: "punctuator", value: "{" },
    { type: "punctuator", value: "}" }
  ]),
  ".box {}"
);

/**
 * FUNCTIONS AND DIMENSIONS
 */

runTest(
  "CSS - function value",
  stringifyCSSTokens([
    { type: "identifier", value: "transform" },
    { type: "punctuator", value: ":" },
    { type: "whitespace", value: " " },
    { type: "function", value: "rotate" },
    { type: "punctuator", value: "(" },
    { type: "dimension", value: "45deg" },
    { type: "punctuator", value: ")" },
    { type: "punctuator", value: ";" }
  ]),
  "transform: rotate(45deg);"
);

/**
 * STRINGS
 */

runTest(
  "CSS - string value",
  stringifyCSSTokens([
    { type: "identifier", value: "background" },
    { type: "punctuator", value: ":" },
    { type: "whitespace", value: " " },
    { type: "string", value: "\"img/bg.png\"" },
    { type: "punctuator", value: ";" }
  ]),
  "background: \"img/bg.png\";"
);

/**
 * COMMENTS
 */

runTest(
  "CSS - comment",
  stringifyCSSTokens([
    { type: "comment", value: "/* hello */" }
  ]),
  "/* hello */"
);

/**
 * NEWLINES
 */

runTest(
  "CSS - newlines preserved",
  stringifyCSSTokens([
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
  ]),
  "a {\n  color: red;\n}"
);

/**
 * EDGE CASES
 */

runTest(
  "Empty token array",
  stringifyCSSTokens([]),
  ""
);

runTest(
  "Invalid input",
  stringifyCSSTokens(undefined),
  ""
);

/**
 * DIMENSIONS AND COLORS
 */

runTest(
  "CSS - dimension followed by hex color requires space",
  stringifyCSSTokens([
    { type: "identifier", value: "border" },
    { type: "punctuator", value: ":" },
    { type: "whitespace", value: " " },
    { type: "identifier", value: "solid" },
    { type: "whitespace", value: " " },
    { type: "dimension", value: "1px" },
    { type: "whitespace", value: " " },
    { type: "hash", value: "#000000" },
    { type: "punctuator", value: ";" }
  ]),
  "border: solid 1px #000000;"
);

runTest(
  "CSS - dimension + hash without whitespace tokens",
  stringifyCSSTokens([
    { type: "identifier", value: "border" },
    { type: "punctuator", value: ":" },
    { type: "identifier", value: "solid" },
    { type: "dimension", value: "1px" },
    { type: "hash", value: "#fff" },
    { type: "punctuator", value: ";" }
  ]),
  "border:solid 1px #fff;",
  true
);

