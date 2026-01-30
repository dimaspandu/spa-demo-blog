import transpileExportTokensToCJS from "../main.js";
import runTest from "../../../utils/tester.js";

function runExportTranspileTest(tokens) {
  const sanitizedTokens = tokens.filter(
    t => t.type !== "newline" &&
         t.type !== "whitespace" &&
         t.type !== "comment"
  );

  return transpileExportTokensToCJS(sanitizedTokens);
}

/* ============================================================================
 * 1. EXPORT VARIABLE DECLARATIONS
 * ============================================================================ */

runTest(
  "Export const assignment",
  runExportTranspileTest([
    { type: "keyword", value: "export" },
    { type: "keyword", value: "const" },
    { type: "identifier", value: "a" },
    { type: "punctuator", value: "=" },
    { type: "number", value: "1" },
    { type: "punctuator", value: ";" }
  ]),
  [
    { type: "keyword", value: "const" },
    { type: "identifier", value: "a" },
    { type: "punctuator", value: "=" },
    { type: "number", value: "1" },
    { type: "punctuator", value: ";" },
    { type: "identifier", value: "exports" },
    { type: "punctuator", value: "." },
    { type: "identifier", value: "a" },
    { type: "punctuator", value: "=" },
    { type: "identifier", value: "a" },
    { type: "punctuator", value: ";" }
  ]
);

runTest(
  "Export var assignment",
  runExportTranspileTest([
    { type: "keyword", value: "export" },
    { type: "keyword", value: "var" },
    { type: "identifier", value: "a" },
    { type: "punctuator", value: "=" },
    { type: "number", value: "1" },
    { type: "punctuator", value: ";" }
  ]),
  [
    { type: "keyword", value: "var" },
    { type: "identifier", value: "a" },
    { type: "punctuator", value: "=" },
    { type: "number", value: "1" },
    { type: "punctuator", value: ";" },
    { type: "identifier", value: "exports" },
    { type: "punctuator", value: "." },
    { type: "identifier", value: "a" },
    { type: "punctuator", value: "=" },
    { type: "identifier", value: "a" },
    { type: "punctuator", value: ";" }
  ]
);

runTest(
  "Export let without value",
  runExportTranspileTest([
    { type: "keyword", value: "export" },
    { type: "keyword", value: "let" },
    { type: "identifier", value: "noValue" },
    { type: "punctuator", value: ";" }
  ]),
  [
    { type: "keyword", value: "let" },
    { type: "identifier", value: "noValue" },
    { type: "punctuator", value: ";" },
    { type: "identifier", value: "exports" },
    { type: "punctuator", value: "." },
    { type: "identifier", value: "noValue" },
    { type: "punctuator", value: "=" },
    { type: "identifier", value: "noValue" },
    { type: "punctuator", value: ";" }
  ]
);


/* ============================================================================
 * 2. EXPORT { x, y }
 * ============================================================================ */

runTest(
  "Export named bindings",
  runExportTranspileTest([
    { type: "keyword", value: "export" },
    { type: "punctuator", value: "{" },
    { type: "identifier", value: "x" },
    { type: "punctuator", value: "," },
    { type: "identifier", value: "y" },
    { type: "punctuator", value: "}" },
    { type: "punctuator", value: ";" }
  ]),
  [
    { type: "identifier", value: "exports" },
    { type: "punctuator", value: "." },
    { type: "identifier", value: "x" },
    { type: "punctuator", value: "=" },
    { type: "identifier", value: "x" },
    { type: "punctuator", value: ";" },

    { type: "identifier", value: "exports" },
    { type: "punctuator", value: "." },
    { type: "identifier", value: "y" },
    { type: "punctuator", value: "=" },
    { type: "identifier", value: "y" },
    { type: "punctuator", value: ";" }
  ]
);

/* ============================================================================
 * 2.x EXPORT { lib.foo0 }, numeric suffix
 * ============================================================================ */

runTest(
  "Export member expression foo0",
  runExportTranspileTest([
    { type: "keyword", value: "export" },
    { type: "punctuator", value: "{" },
    { type: "identifier", value: "lib" },
    { type: "punctuator", value: "." },
    { type: "identifier", value: "foo0" },
    { type: "punctuator", value: "}" },
    { type: "punctuator", value: ";" }
  ]),
  [
    { type: "identifier", value: "exports" },
    { type: "punctuator", value: "." },
    { type: "identifier", value: "foo0" },
    { type: "punctuator", value: "=" },
    { type: "identifier", value: "lib" },
    { type: "punctuator", value: "." },
    { type: "identifier", value: "foo0" },
    { type: "punctuator", value: ";" }
  ]
);

runTest(
  "Export member expression foo05",
  runExportTranspileTest([
    { type: "keyword", value: "export" },
    { type: "punctuator", value: "{" },
    { type: "identifier", value: "lib" },
    { type: "punctuator", value: "." },
    { type: "identifier", value: "foo05" },
    { type: "punctuator", value: "}" },
    { type: "punctuator", value: ";" }
  ]),
  [
    { type: "identifier", value: "exports" },
    { type: "punctuator", value: "." },
    { type: "identifier", value: "foo05" },
    { type: "punctuator", value: "=" },
    { type: "identifier", value: "lib" },
    { type: "punctuator", value: "." },
    { type: "identifier", value: "foo05" },
    { type: "punctuator", value: ";" }
  ]
);

runTest(
  "Export identifier x0",
  runExportTranspileTest([
    { type: "keyword", value: "export" },
    { type: "punctuator", value: "{" },
    { type: "identifier", value: "x0" },
    { type: "punctuator", value: "}" },
    { type: "punctuator", value: ";" }
  ]),
  [
    { type: "identifier", value: "exports" },
    { type: "punctuator", value: "." },
    { type: "identifier", value: "x0" },
    { type: "punctuator", value: "=" },
    { type: "identifier", value: "x0" },
    { type: "punctuator", value: ";" }
  ]
);

runTest(
  "Export identifier x05",
  runExportTranspileTest([
    { type: "keyword", value: "export" },
    { type: "punctuator", value: "{" },
    { type: "identifier", value: "x05" },
    { type: "punctuator", value: "}" },
    { type: "punctuator", value: ";" }
  ]),
  [
    { type: "identifier", value: "exports" },
    { type: "punctuator", value: "." },
    { type: "identifier", value: "x05" },
    { type: "punctuator", value: "=" },
    { type: "identifier", value: "x05" },
    { type: "punctuator", value: ";" }
  ]
);

/* ============================================================================
 * 3. EXPORT { a as b }
 * ============================================================================ */

runTest(
  "Export alias",
  runExportTranspileTest([
    { type: "keyword", value: "export" },
    { type: "punctuator", value: "{" },
    { type: "identifier", value: "a" },
    { type: "identifier", value: "as" },
    { type: "identifier", value: "b" },
    { type: "punctuator", value: "}" },
    { type: "punctuator", value: ";" }
  ]),
  [
    { type: "identifier", value: "exports" },
    { type: "punctuator", value: "." },
    { type: "identifier", value: "b" },
    { type: "punctuator", value: "=" },
    { type: "identifier", value: "a" },
    { type: "punctuator", value: ";" }
  ]
);


/* ============================================================================
 * 4. DEFAULT EXPORT - NAMED FUNCTION
 * ============================================================================ */

runTest(
  "Export default named function",
  runExportTranspileTest([
    { type: "keyword", value: "export" },
    { type: "keyword", value: "default" },
    { type: "keyword", value: "function" },
    { type: "identifier", value: "myFunc" },
    { type: "punctuator", value: "(" },
    { type: "punctuator", value: ")" },
    { type: "punctuator", value: "{" },
    { type: "punctuator", value: "}" }
  ]),
  [
    { type: "keyword", value: "function" },
    { type: "identifier", value: "myFunc" },
    { type: "punctuator", value: "(" },
    { type: "punctuator", value: ")" },
    { type: "punctuator", value: "{" },
    { type: "punctuator", value: "}" },

    { type: "identifier", value: "exports" },
    { type: "punctuator", value: "." },
    { type: "identifier", value: "default" },
    { type: "punctuator", value: "=" },
    { type: "identifier", value: "myFunc" },
    { type: "punctuator", value: ";" }
  ]
);

runTest(
  "Export default object literal",
  runExportTranspileTest([
    {
      "type": "keyword",
      "value": "export",
      "start": 1,
      "end": 7,
      "line": 2,
      "column": 0
    }, {
      "type": "keyword",
      "value": "default",
      "start": 8,
      "end": 15,
      "line": 2,
      "column": 7
    }, {
      "type": "punctuator",
      "value": "{",
      "start": 16,
      "end": 17,
      "line": 2,
      "column": 15
    }, {
      "type": "identifier",
      "value": "broly",
      "start": 20,
      "end": 25,
      "line": 3,
      "column": 2
    }, {
      "type": "punctuator",
      "value": ":",
      "start": 25,
      "end": 26,
      "line": 3,
      "column": 7
    }, {
      "type": "punctuator",
      "value": "{",
      "start": 27,
      "end": 28,
      "line": 3,
      "column": 9
    }, {
      "type": "identifier",
      "value": "name",
      "start": 33,
      "end": 37,
      "line": 4,
      "column": 4
    }, {
      "type": "punctuator",
      "value": ":",
      "start": 37,
      "end": 38,
      "line": 4,
      "column": 8
    }, {
      "type": "string",
      "value": "\"Broly Siahaan\"",
      "start": 39,
      "end": 54,
      "line": 4,
      "column": 10
    }, {
      "type": "punctuator",
      "value": ",",
      "start": 54,
      "end": 55,
      "line": 4,
      "column": 25
    }, {
      "type": "identifier",
      "value": "race",
      "start": 60,
      "end": 64,
      "line": 5,
      "column": 4
    }, {
      "type": "punctuator",
      "value": ":",
      "start": 64,
      "end": 65,
      "line": 5,
      "column": 8
    }, {
      "type": "string",
      "value": "\"saiyan\"",
      "start": 66,
      "end": 74,
      "line": 5,
      "column": 10
    }, {
      "type": "punctuator",
      "value": ",",
      "start": 74,
      "end": 75,
      "line": 5,
      "column": 18
    }, {
      "type": "identifier",
      "value": "power",
      "start": 80,
      "end": 85,
      "line": 6,
      "column": 4
    }, {
      "type": "punctuator",
      "value": ":",
      "start": 85,
      "end": 86,
      "line": 6,
      "column": 9
    }, {
      "type": "number",
      "value": "978990092",
      "start": 87,
      "end": 96,
      "line": 6,
      "column": 11
    }, {
      "type": "punctuator",
      "value": "}",
      "start": 99,
      "end": 100,
      "line": 7,
      "column": 2
    }, {
      "type": "punctuator",
      "value": ",",
      "start": 100,
      "end": 101,
      "line": 7,
      "column": 3
    }, {
      "type": "identifier",
      "value": "vegeta",
      "start": 104,
      "end": 110,
      "line": 8,
      "column": 2
    }, {
      "type": "punctuator",
      "value": ":",
      "start": 110,
      "end": 111,
      "line": 8,
      "column": 8
    }, {
      "type": "punctuator",
      "value": "{",
      "start": 112,
      "end": 113,
      "line": 8,
      "column": 10
    }, {
      "type": "identifier",
      "value": "name",
      "start": 118,
      "end": 122,
      "line": 9,
      "column": 4
    }, {
      "type": "punctuator",
      "value": ":",
      "start": 122,
      "end": 123,
      "line": 9,
      "column": 8
    }, {
      "type": "string",
      "value": "\"Vegeta Sitepu\"",
      "start": 124,
      "end": 139,
      "line": 9,
      "column": 10
    }, {
      "type": "punctuator",
      "value": ",",
      "start": 139,
      "end": 140,
      "line": 9,
      "column": 25
    }, {
      "type": "identifier",
      "value": "race",
      "start": 145,
      "end": 149,
      "line": 10,
      "column": 4
    }, {
      "type": "punctuator",
      "value": ":",
      "start": 149,
      "end": 150,
      "line": 10,
      "column": 8
    }, {
      "type": "string",
      "value": "\"saiyan\"",
      "start": 151,
      "end": 159,
      "line": 10,
      "column": 10
    }, {
      "type": "punctuator",
      "value": ",",
      "start": 159,
      "end": 160,
      "line": 10,
      "column": 18
    }, {
      "type": "identifier",
      "value": "power",
      "start": 165,
      "end": 170,
      "line": 11,
      "column": 4
    }, {
      "type": "punctuator",
      "value": ":",
      "start": 170,
      "end": 171,
      "line": 11,
      "column": 9
    }, {
      "type": "number",
      "value": "929990000",
      "start": 172,
      "end": 181,
      "line": 11,
      "column": 11
    }, {
      "type": "punctuator",
      "value": "}",
      "start": 184,
      "end": 185,
      "line": 12,
      "column": 2
    }, {
      "type": "punctuator",
      "value": ",",
      "start": 185,
      "end": 186,
      "line": 12,
      "column": 3
    }, {
      "type": "punctuator",
      "value": "}",
      "start": 187,
      "end": 188,
      "line": 13,
      "column": 0
    }
  ]),
  [
    { type: 'identifier', value: 'exports' },
    { type: 'punctuator', value: '.' },
    { type: 'keyword', value: 'default' },
    { type: 'punctuator', value: '=' },
    { type: 'punctuator', value: '{' },
    { type: 'identifier', value: 'broly' },
    { type: 'punctuator', value: ':' },
    { type: 'punctuator', value: '{' },
    { type: 'identifier', value: 'name' },
    { type: 'punctuator', value: ':' },
    { type: 'string', value: '"Broly Siahaan"' },
    { type: 'punctuator', value: ',' },
    { type: 'identifier', value: 'race' },
    { type: 'punctuator', value: ':' },
    { type: 'string', value: '"saiyan"' },
    { type: 'punctuator', value: ',' },
    { type: 'identifier', value: 'power' },
    { type: 'punctuator', value: ':' },
    { type: 'number', value: '978990092' },
    { type: 'punctuator', value: '}' },
    { type: 'punctuator', value: ',' },
    { type: 'identifier', value: 'vegeta' },
    { type: 'punctuator', value: ':' },
    { type: 'punctuator', value: '{' },
    { type: 'identifier', value: 'name' },
    { type: 'punctuator', value: ':' },
    { type: 'string', value: '"Vegeta Sitepu"' },
    { type: 'punctuator', value: ',' },
    { type: 'identifier', value: 'race' },
    { type: 'punctuator', value: ':' },
    { type: 'string', value: '"saiyan"' },
    { type: 'punctuator', value: ',' },
    { type: 'identifier', value: 'power' },
    { type: 'punctuator', value: ':' },
    { type: 'number', value: '929990000' },
    { type: 'punctuator', value: '}' },
    { type: 'punctuator', value: ',' },
    { type: 'punctuator', value: '}' },
    { type: 'punctuator', value: ';' }
  ]
);


/* ============================================================================
 * 4.x DEFAULT EXPORT - LITERAL (STRING / NUMBER)
 * ============================================================================ */

runTest(
  "Export default string literal",
  runExportTranspileTest([
    {
      type: "keyword",
      value: "export"
    },
    {
      type: "keyword",
      value: "default"
    },
    {
      type: "string",
      value: '"Hello, World!"'
    },
    {
      type: "punctuator",
      value: ";"
    }
  ]),
  [
    { type: "identifier", value: "exports" },
    { type: "punctuator", value: "." },
    { type: "keyword", value: "default" },
    { type: "punctuator", value: "=" },
    { type: "string", value: '"Hello, World!"' },
    { type: "punctuator", value: ";" }
  ]
);

runTest(
  "Export default number literal",
  runExportTranspileTest([
    {
      type: "keyword",
      value: "export"
    },
    {
      type: "keyword",
      value: "default"
    },
    {
      type: "number",
      value: "999"
    }
  ]),
  [
    { type: "identifier", value: "exports" },
    { type: "punctuator", value: "." },
    { type: "keyword", value: "default" },
    { type: "punctuator", value: "=" },
    { type: "number", value: "999" },
    { type: "punctuator", value: ";" }
  ]
);


/* ============================================================================
 * 5. EXPORT FUNCTION / ASYNC / GENERATOR
 * ============================================================================ */

runTest(
  "Export normal function",
  runExportTranspileTest([
    { type: "keyword", value: "export" },
    { type: "keyword", value: "function" },
    { type: "identifier", value: "greet" },
    { type: "punctuator", value: "(" },
    { type: "punctuator", value: ")" },
    { type: "punctuator", value: "{" },
    { type: "punctuator", value: "}" }
  ]),
  [
    { type: "keyword", value: "function" },
    { type: "identifier", value: "greet" },
    { type: "punctuator", value: "(" },
    { type: "punctuator", value: ")" },
    { type: "punctuator", value: "{" },
    { type: "punctuator", value: "}" },
    { type: "identifier", value: "exports" },
    { type: "punctuator", value: "." },
    { type: "identifier", value: "greet" },
    { type: "punctuator", value: "=" },
    { type: "identifier", value: "greet" },
    { type: "punctuator", value: ";" }
  ]
);

runTest(
  "Export async function",
  runExportTranspileTest([
    { type: "keyword", value: "export" },
    { type: "identifier", value: "async" },
    { type: "keyword", value: "function" },
    { type: "identifier", value: "fetchData" },
    { type: "punctuator", value: "(" },
    { type: "punctuator", value: ")" },
    { type: "punctuator", value: "{" },
    { type: "punctuator", value: "}" }
  ]),
  [
    { type: "identifier", value: "async" },
    { type: "keyword", value: "function" },
    { type: "identifier", value: "fetchData" },
    { type: "punctuator", value: "(" },
    { type: "punctuator", value: ")" },
    { type: "punctuator", value: "{" },
    { type: "punctuator", value: "}" },
    { type: "identifier", value: "exports" },
    { type: "punctuator", value: "." },
    { type: "identifier", value: "fetchData" },
    { type: "punctuator", value: "=" },
    { type: "identifier", value: "fetchData" },
    { type: "punctuator", value: ";" }
  ]
);


/* ============================================================================
 * 6. EXPORT * FROM "module"
 * ============================================================================ */

runTest(
  "Export all from string module",
  runExportTranspileTest([
    { type: "keyword", value: "export" },
    { type: "punctuator", value: "*" },
    { type: "identifier", value: "from" },
    { type: "string", value: '"./mod.js"' }
  ]),
  [
    { type: "identifier", value: "Object" },
    { type: "punctuator", value: "." },
    { type: "identifier", value: "assign" },
    { type: "punctuator", value: "(" },
    { type: "identifier", value: "exports" },
    { type: "punctuator", value: "," },
    { type: "identifier", value: "require" },
    { type: "punctuator", value: "(" },
    { type: "string", value: '"./mod.js"' },
    { type: "punctuator", value: ")" },
    { type: "punctuator", value: ")" },
    { type: "punctuator", value: ";" }
  ]
);


/* ============================================================================
 * 7. export * as utils from "./mod.js"
 * ============================================================================ */

runTest(
  "Export namespace as",
  runExportTranspileTest([
    { type: "keyword", value: "export" },
    { type: "punctuator", value: "*" },
    { type: "identifier", value: "as" },
    { type: "identifier", value: "utils" },
    { type: "identifier", value: "from" },
    { type: "string", value: '"./util.js"' }
  ]),
  [
    { type: "identifier", value: "exports" },
    { type: "punctuator", value: "." },
    { type: "identifier", value: "utils" },
    { type: "punctuator", value: "=" },
    { type: "identifier", value: "require" },
    { type: "punctuator", value: "(" },
    { type: "string", value: '"./util.js"' },
    { type: "punctuator", value: ")" },
    { type: "punctuator", value: ";" }
  ]
);


/* ============================================================================
 * 8. export * from dynamicIdentifier
 * ============================================================================ */

runTest(
  "Export all from identifier",
  runExportTranspileTest([
    { type: "keyword", value: "export" },
    { type: "punctuator", value: "*" },
    { type: "identifier", value: "from" },
    { type: "identifier", value: "dynamicPath" }
  ]),
  [
    { type: "identifier", value: "Object" },
    { type: "punctuator", value: "." },
    { type: "identifier", value: "assign" },
    { type: "punctuator", value: "(" },
    { type: "identifier", value: "exports" },
    { type: "punctuator", value: "," },
    { type: "identifier", value: "require" },
    { type: "punctuator", value: "(" },
    { type: "identifier", value: "dynamicPath" },
    { type: "punctuator", value: ")" },
    { type: "punctuator", value: ")" },
    { type: "punctuator", value: ";" }
  ]
);


/* ============================================================================ 
 * 9. EXPORT DEFAULT CASES FOR VARIOUS TYPES 
 * ============================================================================ */

runTest(
  "Export default identifier from local const (no semicolon)",
  runExportTranspileTest([
    // const app1 = {};
    { type: "keyword", value: "const" },
    { type: "identifier", value: "app1" },
    { type: "punctuator", value: "=" },
    { type: "punctuator", value: "{" },
    { type: "punctuator", value: "}" },
    { type: "punctuator", value: ";" },

    // export default app1
    { type: "keyword", value: "export" },
    { type: "keyword", value: "default" },
    { type: "identifier", value: "app1" }
  ]),
  [
    // const app1 = {};
    { type: "keyword", value: "const" },
    { type: "identifier", value: "app1" },
    { type: "punctuator", value: "=" },
    { type: "punctuator", value: "{" },
    { type: "punctuator", value: "}" },
    { type: "punctuator", value: ";" },

    // exports.default = app1;
    { type: "identifier", value: "exports" },
    { type: "punctuator", value: "." },
    { type: "keyword", value: "default" },
    { type: "punctuator", value: "=" },
    { type: "identifier", value: "app1" },
    { type: "punctuator", value: ";" }
  ]
);

runTest(
  "Export default identifier from local const (with semicolon)",
  runExportTranspileTest([
    // const app2 = {};
    { type: "keyword", value: "const" },
    { type: "identifier", value: "app2" },
    { type: "punctuator", value: "=" },
    { type: "punctuator", value: "{" },
    { type: "punctuator", value: "}" },
    { type: "punctuator", value: ";" },

    // export default app2;
    { type: "keyword", value: "export" },
    { type: "keyword", value: "default" },
    { type: "identifier", value: "app2" },
    { type: "punctuator", value: ";" }
  ]),
  [
    // const app2 = {};
    { type: "keyword", value: "const" },
    { type: "identifier", value: "app2" },
    { type: "punctuator", value: "=" },
    { type: "punctuator", value: "{" },
    { type: "punctuator", value: "}" },
    { type: "punctuator", value: ";" },

    // exports.default = app2;
    { type: "identifier", value: "exports" },
    { type: "punctuator", value: "." },
    { type: "keyword", value: "default" },
    { type: "punctuator", value: "=" },
    { type: "identifier", value: "app2" },
    { type: "punctuator", value: ";" }
  ]
);

// Export default dynamic value (dynamicValue1)
runTest(
  "Export default dynamicValue1",
  runExportTranspileTest([
    { type: "keyword", value: "export" },
    { type: "keyword", value: "default" },
    { type: "identifier", value: "dynamicValue1" }
  ]),
  [
    { type: "identifier", value: "exports" },
    { type: "punctuator", value: "." },
    { type: "keyword", value: "default" },
    { type: "punctuator", value: "=" },
    { type: "identifier", value: "dynamicValue1" },
    { type: "punctuator", value: ";" }
  ]
);

// Export default dynamic value (dynamicValue2)
runTest(
  "Export default dynamicValue2",
  runExportTranspileTest([
    { type: "keyword", value: "export" },
    { type: "keyword", value: "default" },
    { type: "identifier", value: "dynamicValue2" },
    { type: "punctuator", value: ";" }
  ]),
  [
    { type: "identifier", value: "exports" },
    { type: "punctuator", value: "." },
    { type: "keyword", value: "default" },
    { type: "punctuator", value: "=" },
    { type: "identifier", value: "dynamicValue2" },
    { type: "punctuator", value: ";" }
  ]
);

// Export default string literal "Hello, World!"
runTest(
  "Export default string literal",
  runExportTranspileTest([
    { type: "keyword", value: "export" },
    { type: "keyword", value: "default" },
    { type: "string", value: '"Hello, World!"' },
    { type: "punctuator", value: ";" }
  ]),
  [
    { type: "identifier", value: "exports" },
    { type: "punctuator", value: "." },
    { type: "keyword", value: "default" },
    { type: "punctuator", value: "=" },
    { type: "string", value: '"Hello, World!"' },
    { type: "punctuator", value: ";" }
  ]
);

// Export default number literal 999
runTest(
  "Export default number literal",
  runExportTranspileTest([
    { type: "keyword", value: "export" },
    { type: "keyword", value: "default" },
    { type: "number", value: "999" },
    { type: "punctuator", value: ";" }
  ]),
  [
    { type: "identifier", value: "exports" },
    { type: "punctuator", value: "." },
    { type: "keyword", value: "default" },
    { type: "punctuator", value: "=" },
    { type: "number", value: "999" },
    { type: "punctuator", value: ";" }
  ]
);

// Export default true
runTest(
  "Export default true",
  runExportTranspileTest([
    { type: "keyword", value: "export" },
    { type: "keyword", value: "default" },
    { type: "identifier", value: "true" },
    { type: "punctuator", value: ";" }
  ]),
  [
    { type: "identifier", value: "exports" },
    { type: "punctuator", value: "." },
    { type: "keyword", value: "default" },
    { type: "punctuator", value: "=" },
    { type: "identifier", value: "true" },
    { type: "punctuator", value: ";" }
  ]
);

// Export default null
runTest(
  "Export default null",
  runExportTranspileTest([
    { type: "keyword", value: "export" },
    { type: "keyword", value: "default" },
    { type: "identifier", value: "null" },
    { type: "punctuator", value: ";" }
  ]),
  [
    { type: "identifier", value: "exports" },
    { type: "punctuator", value: "." },
    { type: "keyword", value: "default" },
    { type: "punctuator", value: "=" },
    { type: "identifier", value: "null" },
    { type: "punctuator", value: ";" }
  ]
);

// Export default undefined
runTest(
  "Export default undefined",
  runExportTranspileTest([
    { type: "keyword", value: "export" },
    { type: "keyword", value: "default" },
    { type: "identifier", value: "undefined" },
    { type: "punctuator", value: ";" }
  ]),
  [
    { type: "identifier", value: "exports" },
    { type: "punctuator", value: "." },
    { type: "keyword", value: "default" },
    { type: "punctuator", value: "=" },
    { type: "identifier", value: "undefined" },
    { type: "punctuator", value: ";" }
  ]
);

// Export default empty object {}
runTest(
  "Export default empty object",
  runExportTranspileTest([
    { type: "keyword", value: "export" },
    { type: "keyword", value: "default" },
    { type: "punctuator", value: "{" },
    { type: "punctuator", value: "}" },
    { type: "punctuator", value: ";" }
  ]),
  [
    { type: "identifier", value: "exports" },
    { type: "punctuator", value: "." },
    { type: "keyword", value: "default" },
    { type: "punctuator", value: "=" },
    { type: "punctuator", value: "{" },
    { type: "punctuator", value: "}" },
    { type: "punctuator", value: ";" }
  ]
);

// Export default empty object with dynamicValue1
runTest(
  "Export default object with dynamicValue1",
  runExportTranspileTest([
    { type: "keyword", value: "export" },
    { type: "keyword", value: "default" },
    { type: "punctuator", value: "{" },
    { type: "identifier", value: "dynamicValue1" },
    { type: "punctuator", value: "}" }
  ]),
  [
    { type: "identifier", value: "exports" },
    { type: "punctuator", value: "." },
    { type: "keyword", value: "default" },
    { type: "punctuator", value: "=" },
    { type: "punctuator", value: "{" },
    { type: "identifier", value: "dynamicValue1" },
    { type: "punctuator", value: "}" },
    { type: "punctuator", value: ";" }
  ]
);

// Export default object with dynamicValue2
runTest(
  "Export default object with dynamicValue2",
  runExportTranspileTest([
    { type: "keyword", value: "export" },
    { type: "keyword", value: "default" },
    { type: "punctuator", value: "{" },
    { type: "identifier", value: "dynamicValue2" },
    { type: "punctuator", value: "}" },
    { type: "punctuator", value: ";" }
  ]),
  [
    { type: "identifier", value: "exports" },
    { type: "punctuator", value: "." },
    { type: "keyword", value: "default" },
    { type: "punctuator", value: "=" },
    { type: "punctuator", value: "{" },
    { type: "identifier", value: "dynamicValue2" },
    { type: "punctuator", value: "}" },
    { type: "punctuator", value: ";" }
  ],
  true
);