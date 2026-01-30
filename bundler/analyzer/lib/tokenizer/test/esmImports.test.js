import tokenizer from "../main.js";
import runTest from "../../../utils/tester.js";

runTest(
  "Default import",
  tokenizer(`import DefaultExport from "module-1";`).map(t => ({
    type: t.type,
    value: t.value
  })),
  [
    { type: "keyword", value: "import" },
    { type: "whitespace", value: " " },
    { type: "identifier", value: "DefaultExport" },
    { type: "whitespace", value: " " },
    { type: "identifier", value: "from" },
    { type: "whitespace", value: " " },
    { type: "string", value: "\"module-1\"" },
    { type: "punctuator", value: ";" }
  ]
);

runTest(
  "Named import",
  tokenizer(`import { a, b, c } from "mod";`).map(t => ({
    type: t.type,
    value: t.value
  })),
  [
    { type: "keyword", value: "import" },
    { type: "whitespace", value: " " },
    { type: "punctuator", value: "{" },
    { type: "whitespace", value: " " },
    { type: "identifier", value: "a" },
    { type: "punctuator", value: "," },
    { type: "whitespace", value: " " },
    { type: "identifier", value: "b" },
    { type: "punctuator", value: "," },
    { type: "whitespace", value: " " },
    { type: "identifier", value: "c" },
    { type: "whitespace", value: " " },
    { type: "punctuator", value: "}" },
    { type: "whitespace", value: " " },
    { type: "identifier", value: "from" },
    { type: "whitespace", value: " " },
    { type: "string", value: "\"mod\"" },
    { type: "punctuator", value: ";" }
  ]
);

runTest(
  "Named import alias",
  tokenizer(`import { x as y } from "m";`).map(t => ({
    type: t.type,
    value: t.value
  })),
  [
    { type: "keyword", value: "import" },
    { type: "whitespace", value: " " },
    { type: "punctuator", value: "{" },
    { type: "whitespace", value: " " },
    { type: "identifier", value: "x" },
    { type: "whitespace", value: " " },
    { type: "identifier", value: "as" },
    { type: "whitespace", value: " " },
    { type: "identifier", value: "y" },
    { type: "whitespace", value: " " },
    { type: "punctuator", value: "}" },
    { type: "whitespace", value: " " },
    { type: "identifier", value: "from" },
    { type: "whitespace", value: " " },
    { type: "string", value: "\"m\"" },
    { type: "punctuator", value: ";" }
  ]
);

runTest(
  "Namespace import",
  tokenizer(`import * as Utils from "utils";`).map(t => ({
    type: t.type,
    value: t.value
  })),
  [
    { type: "keyword", value: "import" },
    { type: "whitespace", value: " " },
    { type: "punctuator", value: "*" },
    { type: "whitespace", value: " " },
    { type: "identifier", value: "as" },
    { type: "whitespace", value: " " },
    { type: "identifier", value: "Utils" },
    { type: "whitespace", value: " " },
    { type: "identifier", value: "from" },
    { type: "whitespace", value: " " },
    { type: "string", value: "\"utils\"" },
    { type: "punctuator", value: ";" }
  ]
);

runTest(
  "Mixed import (default + named)",
  tokenizer(`import def, { a, b } from "pkg";`).map(t => ({
    type: t.type,
    value: t.value
  })),
  [
    { type: "keyword", value: "import" },
    { type: "whitespace", value: " " },
    { type: "identifier", value: "def" },
    { type: "punctuator", value: "," },
    { type: "whitespace", value: " " },
    { type: "punctuator", value: "{" },
    { type: "whitespace", value: " " },
    { type: "identifier", value: "a" },
    { type: "punctuator", value: "," },
    { type: "whitespace", value: " " },
    { type: "identifier", value: "b" },
    { type: "whitespace", value: " " },
    { type: "punctuator", value: "}" },
    { type: "whitespace", value: " " },
    { type: "identifier", value: "from" },
    { type: "whitespace", value: " " },
    { type: "string", value: "\"pkg\"" },
    { type: "punctuator", value: ";" }
  ]
);

runTest(
  "Side-effect import",
  tokenizer(`import "side-effect-only";`).map(t => ({
    type: t.type,
    value: t.value
  })),
  [
    { type: "keyword", value: "import" },
    { type: "whitespace", value: " " },
    { type: "string", value: "\"side-effect-only\"" },
    { type: "punctuator", value: ";" }
  ]
);

runTest(
  "Import with assert",
  tokenizer(`import config from "./config.json" assert { type: "json" };`).map(t => ({
    type: t.type,
    value: t.value
  })),
  [
    { type: "keyword", value: "import" },
    { type: "whitespace", value: " " },
    { type: "identifier", value: "config" },
    { type: "whitespace", value: " " },
    { type: "identifier", value: "from" },
    { type: "whitespace", value: " " },
    { type: "string", value: "\"./config.json\"" },
    { type: "whitespace", value: " " },
    { type: "identifier", value: "assert" },
    { type: "whitespace", value: " " },
    { type: "punctuator", value: "{" },
    { type: "whitespace", value: " " },
    { type: "identifier", value: "type" },
    { type: "punctuator", value: ":" },
    { type: "whitespace", value: " " },
    { type: "string", value: "\"json\"" },
    { type: "whitespace", value: " " },
    { type: "punctuator", value: "}" },
    { type: "punctuator", value: ";" }
  ]
);

runTest(
  "Import with module attributes (with)",
  tokenizer(`import sheet from "./styles.css" with { type: "css" };`).map(t => ({
    type: t.type,
    value: t.value
  })),
  [
    { type: "keyword", value: "import" },
    { type: "whitespace", value: " " },
    { type: "identifier", value: "sheet" },
    { type: "whitespace", value: " " },
    { type: "identifier", value: "from" },
    { type: "whitespace", value: " " },
    { type: "string", value: "\"./styles.css\"" },
    { type: "whitespace", value: " " },
    { type: "keyword", value: "with" },
    { type: "whitespace", value: " " },
    { type: "punctuator", value: "{" },
    { type: "whitespace", value: " " },
    { type: "identifier", value: "type" },
    { type: "punctuator", value: ":" },
    { type: "whitespace", value: " " },
    { type: "string", value: "\"css\"" },
    { type: "whitespace", value: " " },
    { type: "punctuator", value: "}" },
    { type: "punctuator", value: ";" }
  ]
);

runTest(
  "Side-effect import with attributes",
  tokenizer(`import "./globals.css" with { type: "css" };`).map(t => ({
    type: t.type,
    value: t.value
  })),
  [
    { type: "keyword", value: "import" },
    { type: "whitespace", value: " " },
    { type: "string", value: "\"./globals.css\"" },
    { type: "whitespace", value: " " },
    { type: "keyword", value: "with" },
    { type: "whitespace", value: " " },
    { type: "punctuator", value: "{" },
    { type: "whitespace", value: " " },
    { type: "identifier", value: "type" },
    { type: "punctuator", value: ":" },
    { type: "whitespace", value: " " },
    { type: "string", value: "\"css\"" },
    { type: "whitespace", value: " " },
    { type: "punctuator", value: "}" },
    { type: "punctuator", value: ";" }
  ]
);

runTest(
  "Namespace import with attributes",
  tokenizer(`import * as Data from "./data.json" with { type: "json" };`).map(t => ({
    type: t.type,
    value: t.value
  })),
  [
    { type: "keyword", value: "import" },
    { type: "whitespace", value: " " },
    { type: "punctuator", value: "*" },
    { type: "whitespace", value: " " },
    { type: "identifier", value: "as" },
    { type: "whitespace", value: " " },
    { type: "identifier", value: "Data" },
    { type: "whitespace", value: " " },
    { type: "identifier", value: "from" },
    { type: "whitespace", value: " " },
    { type: "string", value: "\"./data.json\"" },
    { type: "whitespace", value: " " },
    { type: "keyword", value: "with" },
    { type: "whitespace", value: " " },
    { type: "punctuator", value: "{" },
    { type: "whitespace", value: " " },
    { type: "identifier", value: "type" },
    { type: "punctuator", value: ":" },
    { type: "whitespace", value: " " },
    { type: "string", value: "\"json\"" },
    { type: "whitespace", value: " " },
    { type: "punctuator", value: "}" },
    { type: "punctuator", value: ";" }
  ]
);

runTest(
  "Dynamic import - basic",
  tokenizer(`import("module-12");`).map(t => ({
    type: t.type,
    value: t.value
  })),
  [
    { type: "keyword", value: "import" },
    { type: "punctuator", value: "(" },
    { type: "string", value: "\"module-12\"" },
    { type: "punctuator", value: ")" },
    { type: "punctuator", value: ";" }
  ]
);

runTest(
  "Dynamic import - awaited inside async function",
  tokenizer(`(async()=>{ await import("module-13"); })();`).map(t => ({
    type: t.type,
    value: t.value
  })),
  [
    { type: "punctuator", value: "(" },
    { type: "identifier", value: "async" },
    { type: "punctuator", value: "(" },
    { type: "punctuator", value: ")" },
    { type: "punctuator", value: "=>" },
    { type: "punctuator", value: "{" },
    { type: "whitespace", value: " " },
    { type: "keyword", value: "await" },
    { type: "whitespace", value: " " },
    { type: "keyword", value: "import" },
    { type: "punctuator", value: "(" },
    { type: "string", value: "\"module-13\"" },
    { type: "punctuator", value: ")" },
    { type: "punctuator", value: ";" },
    { type: "whitespace", value: " " },
    { type: "punctuator", value: "}" },
    { type: "punctuator", value: ")" },
    { type: "punctuator", value: "(" },
    { type: "punctuator", value: ")" },
    { type: "punctuator", value: ";" }
  ]
);

runTest(
  "Dynamic import - with options",
  tokenizer(`import("module-14", { with: { type: "css" } });`).map(t => ({
    type: t.type,
    value: t.value
  })),
  [
    { type: "keyword", value: "import" },
    { type: "punctuator", value: "(" },
    { type: "string", value: "\"module-14\"" },
    { type: "punctuator", value: "," },
    { type: "whitespace", value: " " },
    { type: "punctuator", value: "{" },
    { type: "whitespace", value: " " },
    { type: "keyword", value: "with" },
    { type: "punctuator", value: ":" },
    { type: "whitespace", value: " " },
    { type: "punctuator", value: "{" },
    { type: "whitespace", value: " " },
    { type: "identifier", value: "type" },
    { type: "punctuator", value: ":" },
    { type: "whitespace", value: " " },
    { type: "string", value: "\"css\"" },
    { type: "whitespace", value: " " },
    { type: "punctuator", value: "}" },
    { type: "whitespace", value: " " },
    { type: "punctuator", value: "}" },
    { type: "punctuator", value: ")" },
    { type: "punctuator", value: ";" }
  ]
);

runTest(
  "Dynamic import - template literal",
  tokenizer("import(`./x-${id}.js`);").map(t => ({
    type: t.type,
    value: t.value
  })),
  [
    { type: "keyword", value: "import" },
    { type: "punctuator", value: "(" },
    { type: "template_chunk", value: "`./x-" },
    { type: "template_expr_start", value: "${" },
    { type: "identifier", value: "id" },
    { type: "template_expr_end", value: "}" },
    { type: "template", value: ".js`" },
    { type: "punctuator", value: ")" },
    { type: "punctuator", value: ";" }
  ],
  true
);
