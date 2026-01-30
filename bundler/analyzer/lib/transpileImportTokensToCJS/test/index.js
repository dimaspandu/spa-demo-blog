import transpileImportTokensToCJS from "../main.js";
import runTest from "../../../utils/tester.js";

function transpileImportTokensToCJSPreprocessor(tokens, dynamicImportIdentifier = "requireByHttp") {
  // Filter tokens (remove newline, whitespace, comment)
  tokens = tokens.filter(
    t => t.type !== "newline" && t.type !== "whitespace" && t.type !== "comment"
  );

  return transpileImportTokensToCJS(tokens, dynamicImportIdentifier);
}

/* ---------------------------------------------
 * 1. Import - default
 * --------------------------------------------- */
runTest(
  "Import - default",
  transpileImportTokensToCJSPreprocessor([
    { type: "keyword", value: "import" },
    { type: "identifier", value: "DefaultExport" },
    { type: "identifier", value: "from" },
    { type: "string", value: "\"mod\"" },
    { type: "punctuator", value: ";" }
  ]),
  [
    { type: "keyword", value: "const" },
    { type: "identifier", value: "DefaultExport" },
    { type: "punctuator", value: "=" },
    { type: "identifier", value: "require" },
    { type: "punctuator", value: "(" },
    { type: "string", value: "\"mod\"" },
    { type: "punctuator", value: ")" },
    { type: "punctuator", value: "." },
    { type: "identifier", value: "default" },
    { type: "punctuator", value: ";" }
  ]
);

/* ---------------------------------------------
 * 2. Import - named
 * --------------------------------------------- */
runTest(
  "Import - named",
  transpileImportTokensToCJSPreprocessor([
    { type: "keyword", value: "import" },
    { type: "punctuator", value: "{" },
    { type: "identifier", value: "a" },
    { type: "punctuator", value: "," },
    { type: "identifier", value: "b" },
    { type: "punctuator", value: "}" },
    { type: "identifier", value: "from" },
    { type: "string", value: "\"x\"" },
    { type: "punctuator", value: ";" }
  ]),
  [
    { type: "keyword", value: "const" },
    { type: "identifier", value: "a" },
    { type: "punctuator", value: "=" },
    { type: "identifier", value: "require" },
    { type: "punctuator", value: "(" },
    { type: "string", value: "\"x\"" },
    { type: "punctuator", value: ")" },
    { type: "punctuator", value: "." },
    { type: "identifier", value: "a" },
    { type: "punctuator", value: ";" },

    { type: "keyword", value: "const" },
    { type: "identifier", value: "b" },
    { type: "punctuator", value: "=" },
    { type: "identifier", value: "require" },
    { type: "punctuator", value: "(" },
    { type: "string", value: "\"x\"" },
    { type: "punctuator", value: ")" },
    { type: "punctuator", value: "." },
    { type: "identifier", value: "b" },
    { type: "punctuator", value: ";" }
  ]
);

/* ---------------------------------------------
 * 3. Import - namespace
 * --------------------------------------------- */
runTest(
  "Import - namespace",
  transpileImportTokensToCJSPreprocessor([
    { type: "keyword", value: "import" },
    { type: "punctuator", value: "*" },
    { type: "identifier", value: "as" },
    { type: "identifier", value: "NS" },
    { type: "identifier", value: "from" },
    { type: "string", value: "\"lib\"" }
  ]),
  [
    { type: "keyword", value: "const" },
    { type: "identifier", value: "NS" },
    { type: "punctuator", value: "=" },
    { type: "identifier", value: "require" },
    { type: "punctuator", value: "(" },
    { type: "string", value: "\"lib\"" },
    { type: "punctuator", value: ")" },
    { type: "punctuator", value: ";" }
  ]
);

/* ---------------------------------------------
 * 4. Import - default + named
 * --------------------------------------------- */
runTest(
  "Import - default + named",
  transpileImportTokensToCJSPreprocessor([
    { type: "keyword", value: "import" },
    { type: "identifier", value: "A" },
    { type: "punctuator", value: "," },
    { type: "punctuator", value: "{" },
    { type: "identifier", value: "x" },
    { type: "punctuator", value: "," },
    { type: "identifier", value: "y" },
    { type: "punctuator", value: "}" },
    { type: "identifier", value: "from" },
    { type: "string", value: "\"pkg\"" }
  ]),
  [
    { type: "keyword", value: "const" },
    { type: "identifier", value: "A" },
    { type: "punctuator", value: "=" },
    { type: "identifier", value: "require" },
    { type: "punctuator", value: "(" },
    { type: "string", value: "\"pkg\"" },
    { type: "punctuator", value: ")" },
    { type: "punctuator", value: "." },
    { type: "identifier", value: "default" },
    { type: "punctuator", value: ";" },

    { type: "keyword", value: "const" },
    { type: "identifier", value: "x" },
    { type: "punctuator", value: "=" },
    { type: "identifier", value: "require" },
    { type: "punctuator", value: "(" },
    { type: "string", value: "\"pkg\"" },
    { type: "punctuator", value: ")" },
    { type: "punctuator", value: "." },
    { type: "identifier", value: "x" },
    { type: "punctuator", value: ";" },

    { type: "keyword", value: "const" },
    { type: "identifier", value: "y" },
    { type: "punctuator", value: "=" },
    { type: "identifier", value: "require" },
    { type: "punctuator", value: "(" },
    { type: "string", value: "\"pkg\"" },
    { type: "punctuator", value: ")" },
    { type: "punctuator", value: "." },
    { type: "identifier", value: "y" },
    { type: "punctuator", value: ";" }
  ]
);

/* ---------------------------------------------
 * 4.x Import - default + named (dotted module version)
 * --------------------------------------------- */

runTest(
  "Import - default + named (module-4.1)",
  transpileImportTokensToCJSPreprocessor([
    { type: "keyword", value: "import" },
    { type: "identifier", value: "Something" },
    { type: "punctuator", value: "," },
    { type: "punctuator", value: "{" },
    { type: "identifier", value: "foo" },
    { type: "punctuator", value: "}" },
    { type: "identifier", value: "from" },
    { type: "string", value: "\"module-4.1\"" }
  ]),
  [
    { type: "keyword", value: "const" },
    { type: "identifier", value: "Something" },
    { type: "punctuator", value: "=" },
    { type: "identifier", value: "require" },
    { type: "punctuator", value: "(" },
    { type: "string", value: "\"module-4.1\"" },
    { type: "punctuator", value: ")" },
    { type: "punctuator", value: "." },
    { type: "identifier", value: "default" },
    { type: "punctuator", value: ";" },

    { type: "keyword", value: "const" },
    { type: "identifier", value: "foo" },
    { type: "punctuator", value: "=" },
    { type: "identifier", value: "require" },
    { type: "punctuator", value: "(" },
    { type: "string", value: "\"module-4.1\"" },
    { type: "punctuator", value: ")" },
    { type: "punctuator", value: "." },
    { type: "identifier", value: "foo" },
    { type: "punctuator", value: ";" }
  ]
);

runTest(
  "Import - default + named (module-4.2, semicolon)",
  transpileImportTokensToCJSPreprocessor([
    { type: "keyword", value: "import" },
    { type: "identifier", value: "Something" },
    { type: "punctuator", value: "," },
    { type: "punctuator", value: "{" },
    { type: "identifier", value: "foo" },
    { type: "punctuator", value: "}" },
    { type: "identifier", value: "from" },
    { type: "string", value: "\"module-4.2\"" },
    { type: "punctuator", value: ";" }
  ]),
  [
    { type: "keyword", value: "const" },
    { type: "identifier", value: "Something" },
    { type: "punctuator", value: "=" },
    { type: "identifier", value: "require" },
    { type: "punctuator", value: "(" },
    { type: "string", value: "\"module-4.2\"" },
    { type: "punctuator", value: ")" },
    { type: "punctuator", value: "." },
    { type: "identifier", value: "default" },
    { type: "punctuator", value: ";" },

    { type: "keyword", value: "const" },
    { type: "identifier", value: "foo" },
    { type: "punctuator", value: "=" },
    { type: "identifier", value: "require" },
    { type: "punctuator", value: "(" },
    { type: "string", value: "\"module-4.2\"" },
    { type: "punctuator", value: ")" },
    { type: "punctuator", value: "." },
    { type: "identifier", value: "foo" },
    { type: "punctuator", value: ";" }
  ]
);

runTest(
  "Import - default + named alias (module-4.3)",
  transpileImportTokensToCJSPreprocessor([
    { type: "keyword", value: "import" },
    { type: "identifier", value: "Something" },
    { type: "punctuator", value: "," },
    { type: "punctuator", value: "{" },
    { type: "identifier", value: "bar" },
    { type: "identifier", value: "as" },
    { type: "identifier", value: "baz" },
    { type: "punctuator", value: "}" },
    { type: "identifier", value: "from" },
    { type: "string", value: "\"module-4.3\"" }
  ]),
  [
    { type: "keyword", value: "const" },
    { type: "identifier", value: "Something" },
    { type: "punctuator", value: "=" },
    { type: "identifier", value: "require" },
    { type: "punctuator", value: "(" },
    { type: "string", value: "\"module-4.3\"" },
    { type: "punctuator", value: ")" },
    { type: "punctuator", value: "." },
    { type: "identifier", value: "default" },
    { type: "punctuator", value: ";" },

    { type: "keyword", value: "const" },
    { type: "identifier", value: "baz" },
    { type: "punctuator", value: "=" },
    { type: "identifier", value: "require" },
    { type: "punctuator", value: "(" },
    { type: "string", value: "\"module-4.3\"" },
    { type: "punctuator", value: ")" },
    { type: "punctuator", value: "." },
    { type: "identifier", value: "bar" },
    { type: "punctuator", value: ";" }
  ]
);

runTest(
  "Import - default + named alias (module-4.4, semicolon)",
  transpileImportTokensToCJSPreprocessor([
    { type: "keyword", value: "import" },
    { type: "identifier", value: "Something" },
    { type: "punctuator", value: "," },
    { type: "punctuator", value: "{" },
    { type: "identifier", value: "bar" },
    { type: "identifier", value: "as" },
    { type: "identifier", value: "baz" },
    { type: "punctuator", value: "}" },
    { type: "identifier", value: "from" },
    { type: "string", value: "\"module-4.4\"" },
    { type: "punctuator", value: ";" }
  ]),
  [
    { type: "keyword", value: "const" },
    { type: "identifier", value: "Something" },
    { type: "punctuator", value: "=" },
    { type: "identifier", value: "require" },
    { type: "punctuator", value: "(" },
    { type: "string", value: "\"module-4.4\"" },
    { type: "punctuator", value: ")" },
    { type: "punctuator", value: "." },
    { type: "identifier", value: "default" },
    { type: "punctuator", value: ";" },

    { type: "keyword", value: "const" },
    { type: "identifier", value: "baz" },
    { type: "punctuator", value: "=" },
    { type: "identifier", value: "require" },
    { type: "punctuator", value: "(" },
    { type: "string", value: "\"module-4.4\"" },
    { type: "punctuator", value: ")" },
    { type: "punctuator", value: "." },
    { type: "identifier", value: "bar" },
    { type: "punctuator", value: ";" }
  ]
);

/* ---------------------------------------------
 * 5. Import - no semicolon
 * --------------------------------------------- */
runTest(
  "Import - no semicolon",
  transpileImportTokensToCJSPreprocessor([
    { type: "keyword", value: "import" },
    { type: "identifier", value: "X" },
    { type: "identifier", value: "from" },
    { type: "string", value: "\"m\"" }
  ]),
  [
    { type: "keyword", value: "const" },
    { type: "identifier", value: "X" },
    { type: "punctuator", value: "=" },
    { type: "identifier", value: "require" },
    { type: "punctuator", value: "(" },
    { type: "string", value: "\"m\"" },
    { type: "punctuator", value: ")" },
    { type: "punctuator", value: "." },
    { type: "identifier", value: "default" },
    { type: "punctuator", value: ";" }
  ]
);

/* ---------------------------------------------
 * 5.x Import - side effect only (minimal tokens)
 * --------------------------------------------- */
runTest(
  "Import - side effect only (module-7.1)",
  transpileImportTokensToCJSPreprocessor([
    { type: "keyword", value: "import" },
    { type: "string", value: "\"module-7.1\"" }
  ]),
  [
    { type: "identifier", value: "require" },
    { type: "punctuator", value: "(" },
    { type: "string", value: "\"module-7.1\"" },
    { type: "punctuator", value: ")" },
    { type: "punctuator", value: ";" }
  ]
);

/* ---------------------------------------------
 * 6. Import - dynamic
 * --------------------------------------------- */
runTest(
  "Import - dynamic",
  transpileImportTokensToCJSPreprocessor([
    { type: "keyword", value: "import" },
    { type: "punctuator", value: "(" },
    { type: "string", value: "\"abc\"" },
    { type: "punctuator", value: ")" },
    { type: "punctuator", value: ";" }
  ]),
  [
    { type: "identifier", value: "requireByHttp" },
    { type: "punctuator", value: "(" },
    { type: "string", value: "\"abc\"" },
    { type: "punctuator", value: ")" },
    { type: "punctuator", value: ";" }
  ]
);

/* ---------------------------------------------
 * 7. Import - assertion
 * --------------------------------------------- */
runTest(
  "Import - assertion",
  transpileImportTokensToCJSPreprocessor([
    { type: "keyword", value: "import" },
    { type: "identifier", value: "data" },
    { type: "identifier", value: "from" },
    { type: "string", value: "\"file.json\"" },
    { type: "identifier", value: "assert" },
    { type: "punctuator", value: "{" },
    { type: "identifier", value: "type" },
    { type: "punctuator", value: ":" },
    { type: "string", value: "\"json\"" },
    { type: "punctuator", value: "}" }
  ]),
  [
    { type: "keyword", value: "const" },
    { type: "identifier", value: "data" },
    { type: "punctuator", value: "=" },
    { type: "identifier", value: "require" },
    { type: "punctuator", value: "(" },
    { type: "string", value: "\"file.json\"" },
    { type: "punctuator", value: ")" },
    { type: "punctuator", value: "." },
    { type: "identifier", value: "default" },
    { type: "punctuator", value: ";" }
  ]
);

/* ---------------------------------------------
 * 8. Import - tight spacing keyword + identifier
 * --------------------------------------------- */
runTest(
  "Import - tight spacing keyword + identifier",
  transpileImportTokensToCJSPreprocessor([
    { type: "keyword", value: "import" },
    { type: "identifier", value: "A" }
  ]),
  [
    { type: "keyword", value: "import" },
    { type: "identifier", value: "A" }
  ]
);

/* ---------------------------------------------
 * 9. Import - number-like identifier
 * --------------------------------------------- */
runTest(
  "Import - number-like identifier",
  transpileImportTokensToCJSPreprocessor([
    { type: "keyword", value: "import" },
    { type: "number", value: "1" },
    { type: "identifier", value: "in" }
  ]),
  [
    { type: "keyword", value: "import" },
    { type: "number", value: "1" },
    { type: "identifier", value: "in" }
  ]
);

/* ---------------------------------------------
 * 10. Import - template literal path
 * --------------------------------------------- */
runTest(
  "Import - template literal path",
  transpileImportTokensToCJSPreprocessor([
    { type: "keyword", value: "import" },
    { type: "identifier", value: "A" },
    { type: "identifier", value: "from" },
    { type: "template", value: "`x/${y}`" }
  ]),
  [
    { type: "keyword", value: "import" },
    { type: "identifier", value: "A" },
    { type: "identifier", value: "from" },
    { type: "template", value: "`x/${y}`" }
  ]
);

/* ---------------------------------------------
 * 11. Import - dynamic template
 * --------------------------------------------- */
runTest(
  "Import - dynamic template",
  transpileImportTokensToCJSPreprocessor([
    { type: "keyword", value: "import" },
    { type: "punctuator", value: "(" },
    { type: "template", value: "`./${x}`" },
    { type: "punctuator", value: ")" },
    { type: "punctuator", value: ";" }
  ]),
  [
    { type: "identifier", value: "requireByHttp" },
    { type: "punctuator", value: "(" },
    { type: "template", value: "`./${x}`" },
    { type: "punctuator", value: ")" },
    { type: "punctuator", value: ";" }
  ]
);

/* ---------------------------------------------
 * 12. Import - private identifier
 * --------------------------------------------- */
runTest(
  "Import - private identifier",
  transpileImportTokensToCJSPreprocessor([
    { type: "keyword", value: "import" },
    { type: "privateIdentifier", value: "#x" }
  ]),
  [
    { type: "keyword", value: "import" },
    { type: "privateIdentifier", value: "#x" }
  ]
);

/* ---------------------------------------------
 * 13. Complex - import then export
 * --------------------------------------------- */
runTest(
  "Complex - import then export",
  transpileImportTokensToCJSPreprocessor([
    { type: "keyword", value: "import" },
    { type: "identifier", value: "X" },
    { type: "identifier", value: "from" },
    { type: "string", value: "\"m1\"" },
    { type: "keyword", value: "export" },
    { type: "identifier", value: "X" }
  ]),
  [
    { type: "keyword", value: "const" },
    { type: "identifier", value: "X" },
    { type: "punctuator", value: "=" },
    { type: "identifier", value: "require" },
    { type: "punctuator", value: "(" },
    { type: "string", value: "\"m1\"" },
    { type: "punctuator", value: ")" },
    { type: "punctuator", value: "." },
    { type: "identifier", value: "default" },
    { type: "punctuator", value: ";" },

    { type: "keyword", value: "export" },
    { type: "identifier", value: "X" }
  ]
);

/* ---------------------------------------------
 * 14. Complex - multiple imports
 * --------------------------------------------- */
runTest(
  "Complex - multiple imports",
  transpileImportTokensToCJSPreprocessor([
    { type: "keyword", value: "import" },
    { type: "identifier", value: "A" },
    { type: "identifier", value: "from" },
    { type: "string", value: "\"a\"" },

    { type: "keyword", value: "import" },
    { type: "identifier", value: "B" },
    { type: "identifier", value: "from" },
    { type: "string", value: "\"b\"" }
  ]),
  [
    { type: "keyword", value: "const" },
    { type: "identifier", value: "A" },
    { type: "punctuator", value: "=" },
    { type: "identifier", value: "require" },
    { type: "punctuator", value: "(" },
    { type: "string", value: "\"a\"" },
    { type: "punctuator", value: ")" },
    { type: "punctuator", value: "." },
    { type: "identifier", value: "default" },
    { type: "punctuator", value: ";" },

    { type: "keyword", value: "const" },
    { type: "identifier", value: "B" },
    { type: "punctuator", value: "=" },
    { type: "identifier", value: "require" },
    { type: "punctuator", value: "(" },
    { type: "string", value: "\"b\"" },
    { type: "punctuator", value: ")" },
    { type: "punctuator", value: "." },
    { type: "identifier", value: "default" },
    { type: "punctuator", value: ";" }
  ]
);

/* ---------------------------------------------
 * 15. Complex - import assert then export
 * --------------------------------------------- */
runTest(
  "Complex - import assert then export",
  transpileImportTokensToCJSPreprocessor([
    { type: "keyword", value: "import" },
    { type: "identifier", value: "cfg" },
    { type: "identifier", value: "from" },
    { type: "string", value: "\"conf.json\"" },
    { type: "identifier", value: "assert" },
    { type: "punctuator", value: "{" },
    { type: "identifier", value: "type" },
    { type: "punctuator", value: ":" },
    { type: "string", value: "\"json\"" },
    { type: "punctuator", value: "}" },
    { type: "keyword", value: "export" },
    { type: "identifier", value: "cfg" }
  ]),
  [
    { type: "keyword", value: "const" },
    { type: "identifier", value: "cfg" },
    { type: "punctuator", value: "=" },
    { type: "identifier", value: "require" },
    { type: "punctuator", value: "(" },
    { type: "string", value: "\"conf.json\"" },
    { type: "punctuator", value: ")" },
    { type: "punctuator", value: "." },
    { type: "identifier", value: "default" },
    { type: "punctuator", value: ";" },

    { type: "keyword", value: "export" },
    { type: "identifier", value: "cfg" }
  ]
);

/* ---------------------------------------------
 * 16. Import - dynamic with custom identifier
 * --------------------------------------------- */
runTest(
  "Import - dynamic (custom identifier)",
  transpileImportTokensToCJSPreprocessor([
    { type: "keyword", value: "import" },
    { type: "punctuator", value: "(" },
    { type: "string", value: "\"x\"" },
    { type: "punctuator", value: ")" },
    { type: "punctuator", value: "." },
    { type: "identifier", value: "then" },
    { type: "punctuator", value: "(" },
    { type: "punctuator", value: "(" },
    { type: "punctuator", value: ")" },
    { type: "punctuator", value: "=>" },
    { type: "punctuator", value: "{" },
    { type: "punctuator", value: "}" },
    { type: "punctuator", value: ")" },
    { type: "punctuator", value: ";" },
  ], "customLoader"),
  [
    { type: "identifier", value: "customLoader" },
    { type: "punctuator", value: "(" },
    { type: "string", value: "\"x\"" },
    { type: "punctuator", value: ")" },
    { type: "punctuator", value: "." },
    { type: "identifier", value: "then" },
    { type: "punctuator", value: "(" },
    { type: "punctuator", value: "(" },
    { type: "punctuator", value: ")" },
    { type: "punctuator", value: "=>" },
    { type: "punctuator", value: "{" },
    { type: "punctuator", value: "}" },
    { type: "punctuator", value: ")" },
    { type: "punctuator", value: ";" },
  ],
  true
);
