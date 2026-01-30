import extractModules from "../main.js";
import runTest from "../../../utils/tester.js";

/* ------------------------------------------------------
 * 1. STATIC IMPORTS
 * ------------------------------------------------------ */

// 1. Default import
runTest(
  "Static Import - default",
  extractModules([
    { type: "keyword", value: "import" },
    { type: "identifier", value: "DefaultExport" },
    { type: "identifier", value: "from" },
    { type: "string", value: '"module-1"' },
    { type: "punctuator", value: ";" }
  ]),
  [{
    module: "module-1",
    type: "static",
    assertions: null,
    literal: true,
    reason: null
  }]
);

// 2. Named imports
runTest(
  "Static Import - named",
  extractModules([
    { type: "keyword", value: "import" },
    { type: "punctuator", value: "{" },
    { type: "identifier", value: "a" },
    { type: "punctuator", value: "," },
    { type: "identifier", value: "b" },
    { type: "punctuator", value: "," },
    { type: "identifier", value: "c" },
    { type: "punctuator", value: "}" },
    { type: "identifier", value: "from" },
    { type: "string", value: '"module-2"' },
    { type: "punctuator", value: ";" }
  ]),
  [{
    module: "module-2",
    type: "static",
    assertions: null,
    literal: true,
    reason: null
  }]
);

// 3. Named imports alias
runTest(
  "Static Import - named alias",
  extractModules([
    { type: "keyword", value: "import" },
    { type: "punctuator", value: "{" },
    { type: "identifier", value: "a" },
    { type: "identifier", value: "as" },
    { type: "identifier", value: "x" },
    { type: "punctuator", value: "," },
    { type: "identifier", value: "b" },
    { type: "identifier", value: "as" },
    { type: "identifier", value: "y" },
    { type: "punctuator", value: "}" },
    { type: "identifier", value: "from" },
    { type: "string", value: '"module-3"' },
    { type: "punctuator", value: ";" }
  ]),
  [{
    module: "module-3",
    type: "static",
    assertions: null,
    literal: true,
    reason: null
  }]
);

// 4. Default + named
runTest(
  "Static Import - default + named",
  extractModules([
    { type: "keyword", value: "import" },
    { type: "identifier", value: "Something" },
    { type: "punctuator", value: "," },
    { type: "punctuator", value: "{" },
    { type: "identifier", value: "foo" },
    { type: "punctuator", value: "," },
    { type: "identifier", value: "bar" },
    { type: "identifier", value: "as" },
    { type: "identifier", value: "baz" },
    { type: "punctuator", value: "}" },
    { type: "identifier", value: "from" },
    { type: "string", value: '"module-4"' },
    { type: "punctuator", value: ";" }
  ]),
  [{
    module: "module-4",
    type: "static",
    assertions: null,
    literal: true,
    reason: null
  }]
);

// 5. Namespace
runTest(
  "Static Import - namespace",
  extractModules([
    { type: "keyword", value: "import" },
    { type: "punctuator", value: "*" },
    { type: "identifier", value: "as" },
    { type: "identifier", value: "Utils" },
    { type: "identifier", value: "from" },
    { type: "string", value: '"module-5"' },
    { type: "punctuator", value: ";" }
  ]),
  [{
    module: "module-5",
    type: "static",
    assertions: null,
    literal: true,
    reason: null
  }]
);

// 6. Default + namespace
runTest(
  "Static Import - default + namespace",
  extractModules([
    { type: "keyword", value: "import" },
    { type: "identifier", value: "DefaultThing" },
    { type: "punctuator", value: "," },
    { type: "punctuator", value: "*" },
    { type: "identifier", value: "as" },
    { type: "identifier", value: "Everything" },
    { type: "identifier", value: "from" },
    { type: "string", value: '"module-6"' },
    { type: "punctuator", value: ";" }
  ]),
  [{
    module: "module-6",
    type: "static",
    assertions: null,
    literal: true,
    reason: null
  }]
);

// 7. Side-effect only
runTest(
  "Static Import - side effect",
  extractModules([
    { type: "keyword", value: "import" },
    { type: "string", value: '"module-7"' },
    { type: "punctuator", value: ";" }
  ]),
  [{
    module: "module-7",
    type: "static",
    assertions: null,
    literal: true,
    reason: null
  }]
);

// 8. Import assertions (classic)
runTest(
  "Static Import - with assertions",
  extractModules([
    { type: "keyword", value: "import" },
    { type: "identifier", value: "config" },
    { type: "identifier", value: "from" },
    { type: "string", value: '"./config.json"' },
    { type: "identifier", value: "assert" },
    { type: "punctuator", value: "{" },
    { type: "identifier", value: "type" },
    { type: "punctuator", value: ":" },
    { type: "string", value: '"json"' },
    { type: "punctuator", value: "}" }
  ]),
  [{
    module: "./config.json",
    type: "static",
    assertions: { type: "json" },
    literal: true,
    reason: null
  }]
);

// 9. import with { type: "css" }
runTest(
  "Static Import - with module attributes `with`",
  extractModules([
    { type: "keyword", value: "import" },
    { type: "identifier", value: "sheet" },
    { type: "identifier", value: "from" },
    { type: "string", value: '"./styles.css"' },
    { type: "identifier", value: "with" },
    { type: "punctuator", value: "{" },
    { type: "identifier", value: "type" },
    { type: "punctuator", value: ":" },
    { type: "string", value: '"css"' },
    { type: "punctuator", value: "}" }
  ]),
  [{
    module: "./styles.css",
    type: "static",
    assertions: { type: "css" },
    literal: true,
    reason: null
  }]
);

// 10. side-effect with module attributes
runTest(
  "Static Import - side effect + with",
  extractModules([
    { type: "keyword", value: "import" },
    { type: "string", value: '"./globals.css"' },
    { type: "identifier", value: "with" },
    { type: "punctuator", value: "{" },
    { type: "identifier", value: "type" },
    { type: "punctuator", value: ":" },
    { type: "string", value: '"css"' },
    { type: "punctuator", value: "}" }
  ]),
  [{
    module: "./globals.css",
    type: "static",
    assertions: { type: "css" },
    literal: true,
    reason: null
  }]
);

// 11. namespace import with attributes
runTest(
  "Static Import - namespace + with",
  extractModules([
    { type: "keyword", value: "import" },
    { type: "punctuator", value: "*" },
    { type: "identifier", value: "as" },
    { type: "identifier", value: "Data" },
    { type: "identifier", value: "from" },
    { type: "string", value: '"./data.json"' },
    { type: "identifier", value: "with" },
    { type: "punctuator", value: "{" },
    { type: "identifier", value: "type" },
    { type: "punctuator", value: ":" },
    { type: "string", value: '"json"' },
    { type: "punctuator", value: "}" }
  ]),
  [{
    module: "./data.json",
    type: "static",
    assertions: { type: "json" },
    literal: true,
    reason: null
  }]
);


/* ------------------------------------------------------
 * 2. DYNAMIC IMPORTS
 * ------------------------------------------------------ */

// 12
runTest(
  "Dynamic import - basic",
  extractModules([
    { type: "keyword", value: "import" },
    { type: "punctuator", value: "(" },
    { type: "string", value: '"module-12"' },
    { type: "punctuator", value: ")" }
  ]),
  [{
    module: "module-12",
    type: "dynamic",
    assertions: null,
    literal: true,
    reason: null
  }]
);

// 13
runTest(
  "Dynamic import - awaited",
  extractModules([
    { type: "keyword", value: "await" },
    { type: "keyword", value: "import" },
    { type: "punctuator", value: "(" },
    { type: "string", value: '"module-13"' },
    { type: "punctuator", value: ")" }
  ]),
  [{
    module: "module-13",
    type: "dynamic",
    assertions: null,
    literal: true,
    reason: null
  }]
);

// 14
runTest(
  "Dynamic import - with attributes",
  extractModules([
    { type: "keyword", value: "import" },
    { type: "punctuator", value: "(" },
    { type: "string", value: '"module-14"' },
    { type: "punctuator", value: "," },
    { type: "punctuator", value: "{" },
    { type: "identifier", value: "with" },
    { type: "punctuator", value: ":" },
    { type: "punctuator", value: "{" },
    { type: "identifier", value: "type" },
    { type: "punctuator", value: ":" },
    { type: "string", value: '"css"' },
    { type: "punctuator", value: "}" },
    { type: "punctuator", value: "}" },
    { type: "punctuator", value: ")" }
  ]),
  [{
    module: "module-14",
    type: "dynamic",
    assertions: { type: "css" },
    literal: true,
    reason: null
  }]
);

// 15
runTest(
  "Dynamic import - custom options",
  extractModules([
    { type: "keyword", value: "import" },
    { type: "punctuator", value: "(" },
    { type: "string", value: '"module-15"' },
    { type: "punctuator", value: "," },
    { type: "punctuator", value: "{" },
    { type: "identifier", value: "namespace" },
    { type: "punctuator", value: ":" },
    { type: "string", value: '"ExampleNS"' },
    { type: "punctuator", value: "}" },
    { type: "punctuator", value: ")" }
  ]),
  [{
    module: "module-15",
    type: "dynamic",
    assertions: { namespace: "ExampleNS" },
    literal: true,
    reason: null
  }]
);

// 16
runTest(
  "Dynamic import - assert JSON",
  extractModules([
    { type: "keyword", value: "import" },
    { type: "punctuator", value: "(" },
    { type: "string", value: '"./config.json"' },
    { type: "punctuator", value: "," },
    { type: "punctuator", value: "{" },
    { type: "identifier", value: "assert" },
    { type: "punctuator", value: ":" },
    { type: "punctuator", value: "{" },
    { type: "identifier", value: "type" },
    { type: "punctuator", value: ":" },
    { type: "string", value: '"json"' },
    { type: "punctuator", value: "}" },
    { type: "punctuator", value: "}" },
    { type: "punctuator", value: ")" }
  ]),
  [{
    module: "./config.json",
    type: "dynamic",
    assertions: { type: "json" },
    literal: true,
    reason: null
  }]
);

// 17
runTest(
  "Dynamic import - template literal",
  extractModules([
    { type: "keyword", value: "import" },
    { type: "punctuator", value: "(" },
    { type: "template_chunk", value: "`https://example.com/module-17.js`" },
    { type: "punctuator", value: ")" }
  ]),
  [{
    module: "`https://example.com/module-17.js`",
    type: "dynamic",
    assertions: null,
    literal: true,
    reason: null
  }]
);

// 18
runTest(
  "Dynamic import - single quote",
  extractModules([
    { type: "keyword", value: "import" },
    { type: "punctuator", value: "(" },
    { type: "string", value: "'https://example.com/module-18.js'" },
    { type: "punctuator", value: ")" }
  ]),
  [{
    module: "https://example.com/module-18.js",
    type: "dynamic",
    assertions: null,
    literal: true,
    reason: null
  }]
);

// 19
runTest(
  "Dynamic import - template + options",
  extractModules([
    { type: "keyword", value: "import" },
    { type: "punctuator", value: "(" },
    { type: "template_chunk", value: "`./style-${theme}.css`" },
    { type: "punctuator", value: "," },
    { type: "punctuator", value: "{" },
    { type: "identifier", value: "with" },
    { type: "punctuator", value: ":" },
    { type: "punctuator", value: "{" },
    { type: "identifier", value: "type" },
    { type: "punctuator", value: ":" },
    { type: "string", value: '"css"' },
    { type: "punctuator", value: "}" },
    { type: "punctuator", value: "}" },
    { type: "punctuator", value: ")" }
  ]),
  [{
    module: "`./style-${theme}.css`",
    type: "dynamic",
    assertions: { type: "css" },
    literal: false,
    reason: "template-literal"
  }]
);

// 20
runTest(
  "Dynamic import - chained",
  extractModules([
    { type: "keyword", value: "import" },
    { type: "punctuator", value: "(" },
    { type: "string", value: '"module-20"' },
    { type: "punctuator", value: ")" },
    { type: "punctuator", value: "." },
    { type: "identifier", value: "then" }
  ]),
  [{
    module: "module-20",
    type: "dynamic",
    assertions: null,
    literal: true,
    reason: null
  }]
);

// 21
runTest(
  "Dynamic import - inside export function",
  extractModules([
    { type: "keyword", value: "export" },
    { type: "keyword", value: "function" },
    { type: "identifier", value: "getModule" },
    { type: "punctuator", value: "(" },
    { type: "punctuator", value: ")" },
    { type: "punctuator", value: "{" },
    { type: "keyword", value: "return" },
    { type: "keyword", value: "import" },
    { type: "punctuator", value: "(" },
    { type: "string", value: '"module-21"' },
    { type: "punctuator", value: ")" },
    { type: "punctuator", value: ";" },
    { type: "punctuator", value: "}" }
  ]),
  [{
    module: "module-21",
    type: "dynamic",
    assertions: null,
    literal: true,
    reason: null
  }]
);


/* ------------------------------------------------------
 * 3. EXPORT-FROM
 * ------------------------------------------------------ */

// 22
runTest(
  "Export all",
  extractModules([
    { type: "keyword", value: "export" },
    { type: "punctuator", value: "*" },
    { type: "identifier", value: "from" },
    { type: "string", value: '"./module-22.js"' },
    { type: "punctuator", value: ";" }
  ]),
  [{
    module: "./module-22.js",
    type: "export",
    assertions: null,
    literal: true,
    reason: null
  }]
);

// 23
runTest(
  "Export named",
  extractModules([
    { type: "keyword", value: "export" },
    { type: "punctuator", value: "{" },
    { type: "identifier", value: "foo" },
    { type: "punctuator", value: "," },
    { type: "identifier", value: "bar" },
    { type: "punctuator", value: "}" },
    { type: "identifier", value: "from" },
    { type: "string", value: '"./module-23.js"' },
    { type: "punctuator", value: ";" }
  ]),
  [{
    module: "./module-23.js",
    type: "export",
    assertions: null,
    literal: true,
    reason: null
  }]
);

// 24
runTest(
  "Export named alias",
  extractModules([
    { type: "keyword", value: "export" },
    { type: "punctuator", value: "{" },
    { type: "identifier", value: "baz" },
    { type: "identifier", value: "as" },
    { type: "identifier", value: "myBaz" },
    { type: "punctuator", value: "}" },
    { type: "identifier", value: "from" },
    { type: "string", value: '"./module-24.js"' },
    { type: "punctuator", value: ";" }
  ]),
  [{
    module: "./module-24.js",
    type: "export",
    assertions: null,
    literal: true,
    reason: null
  }]
);

// 25
runTest(
  "Export default alias",
  extractModules([
    { type: "keyword", value: "export" },
    { type: "punctuator", value: "{" },
    { type: "keyword", value: "default" },
    { type: "identifier", value: "as" },
    { type: "identifier", value: "RemoteDefault" },
    { type: "punctuator", value: "}" },
    { type: "identifier", value: "from" },
    { type: "string", value: '"./module-25.js"' },
    { type: "punctuator", value: ";" }
  ]),
  [{
    module: "./module-25.js",
    type: "export",
    assertions: null,
    literal: true,
    reason: null
  }]
);

// 26
runTest(
  "Export mixture",
  extractModules([
    { type: "keyword", value: "export" },
    { type: "punctuator", value: "{" },
    { type: "keyword", value: "default" },
    { type: "identifier", value: "as" },
    { type: "identifier", value: "MainComponent" },
    { type: "punctuator", value: "," },
    { type: "identifier", value: "helper" },
    { type: "punctuator", value: "}" },
    { type: "identifier", value: "from" },
    { type: "string", value: '"./components.js"' },
    { type: "punctuator", value: ";" }
  ]),
  [{
    module: "./components.js",
    type: "export",
    assertions: null,
    literal: true,
    reason: null
  }]
);

// 27
runTest(
  "Export namespace",
  extractModules([
    { type: "keyword", value: "export" },
    { type: "punctuator", value: "*" },
    { type: "identifier", value: "as" },
    { type: "identifier", value: "utils" },
    { type: "identifier", value: "from" },
    { type: "string", value: '"./utils.js"' },
    { type: "punctuator", value: ";" }
  ]),
  [{
    module: "./utils.js",
    type: "export",
    assertions: null,
    literal: true,
    reason: null
  }]
);


/* ------------------------------------------------------
 * FINAL SUMMARY
 * ------------------------------------------------------ */

runTest("FINAL SUMMARY", [], [], true);

