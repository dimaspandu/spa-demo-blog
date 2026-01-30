import stringifyTokens from "../main.js";
import runTest from "../../../utils/tester.js";

/**
 * IMPORT TESTS
 */

// 1. Default import
runTest(
  "Import - default",
  stringifyTokens([
    { type: "keyword", value: "import" },
    { type: "identifier", value: "DefaultExport" },
    { type: "identifier", value: "from" },
    { type: "string", value: '"mod"' },
    { type: "punctuator", value: ";" }
  ]),
  `import DefaultExport from"mod";`
);

// 2. Named import
runTest(
  "Import - named",
  stringifyTokens([
    { type: "keyword", value: "import" },
    { type: "punctuator", value: "{" },
    { type: "identifier", value: "a" },
    { type: "punctuator", value: "," },
    { type: "identifier", value: "b" },
    { type: "punctuator", value: "}" },
    { type: "identifier", value: "from" },
    { type: "string", value: '"x"' },
    { type: "punctuator", value: ";" }
  ]),
  `import{a,b}from"x";`
);

// 3. Namespace import
runTest(
  "Import - namespace",
  stringifyTokens([
    { type: "keyword", value: "import" },
    { type: "punctuator", value: "*" },
    { type: "identifier", value: "as" },
    { type: "identifier", value: "NS" },
    { type: "identifier", value: "from" },
    { type: "string", value: '"lib"' }
  ]),
  `import*as NS from"lib"`
);

// 4. Mixed import
runTest(
  "Import - default + named",
  stringifyTokens([
    { type: "keyword", value: "import" },
    { type: "identifier", value: "A" },
    { type: "punctuator", value: "," },
    { type: "punctuator", value: "{" },
    { type: "identifier", value: "x" },
    { type: "punctuator", value: "," },
    { type: "identifier", value: "y" },
    { type: "punctuator", value: "}" },
    { type: "identifier", value: "from" },
    { type: "string", value: '"pkg"' },
  ]),
  `import A,{x,y}from"pkg"`
);

// 5. Import without semicolon
runTest(
  "Import - no semicolon",
  stringifyTokens([
    { type: "keyword", value: "import" },
    { type: "identifier", value: "X" },
    { type: "identifier", value: "from" },
    { type: "string", value: '"m"' }
  ]),
  `import X from"m"`
);

// 6. Dynamic import
runTest(
  "Import - dynamic",
  stringifyTokens([
    { type: "identifier", value: "import" },
    { type: "punctuator", value: "(" },
    { type: "string", value: '"abc"' },
    { type: "punctuator", value: ")" }
  ]),
  `import("abc")`
);

// 7. Import with assertion
runTest(
  "Import - assertion",
  stringifyTokens([
    { type: "keyword", value: "import" },
    { type: "identifier", value: "data" },
    { type: "identifier", value: "from" },
    { type: "string", value: '"file.json"' },
    { type: "identifier", value: "assert" },
    { type: "punctuator", value: "{" },
    { type: "identifier", value: "type" },
    { type: "punctuator", value: ":" },
    { type: "string", value: '"json"' },
    { type: "punctuator", value: "}" }
  ]),
  `import data from"file.json"assert{type:"json"}`
);


/**
 * EXPORT TESTS
 */

// 8. Export default function
runTest(
  "Export - default function",
  stringifyTokens([
    { type: "keyword", value: "export" },
    { type: "keyword", value: "default" },
    { type: "keyword", value: "function" },
    { type: "identifier", value: "f" },
    { type: "punctuator", value: "(" },
    { type: "punctuator", value: ")" },
    { type: "punctuator", value: "{" },
    { type: "punctuator", value: "}" }
  ]),
  `export default function f(){}`
);

// 9. Export default class
runTest(
  "Export - default class",
  stringifyTokens([
    { type: "keyword", value: "export" },
    { type: "keyword", value: "default" },
    { type: "keyword", value: "class" },
    { type: "identifier", value: "C" },
    { type: "punctuator", value: "{" },
    { type: "punctuator", value: "}" }
  ]),
  `export default class C{}`
);

// 10. Export named identifiers
runTest(
  "Export - named list",
  stringifyTokens([
    { type: "keyword", value: "export" },
    { type: "punctuator", value: "{" },
    { type: "identifier", value: "a" },
    { type: "punctuator", value: "," },
    { type: "identifier", value: "b" },
    { type: "punctuator", value: "}" }
  ]),
  `export{a,b}`
);

// 11. Export with alias
runTest(
  "Export - alias",
  stringifyTokens([
    { type: "keyword", value: "export" },
    { type: "punctuator", value: "{" },
    { type: "identifier", value: "a" },
    { type: "identifier", value: "as" },
    { type: "identifier", value: "x" },
    { type: "punctuator", value: "}" }
  ]),
  `export{a as x}`
);

// 12. Export namespace
runTest(
  "Export - namespace",
  stringifyTokens([
    { type: "keyword", value: "export" },
    { type: "punctuator", value: "*" },
    { type: "identifier", value: "as" },
    { type: "identifier", value: "NS" }
  ]),
  `export*as NS`
);

// 13. Export from (named)
runTest(
  "Export - named from",
  stringifyTokens([
    { type: "keyword", value: "export" },
    { type: "punctuator", value: "{" },
    { type: "identifier", value: "a" },
    { type: "punctuator", value: "," },
    { type: "identifier", value: "b" },
    { type: "punctuator", value: "}" },
    { type: "identifier", value: "from" },
    { type: "string", value: '"lib"' }
  ]),
  `export{a,b}from"lib"`
);

// 14. Export * from
runTest(
  "Export - export all from",
  stringifyTokens([
    { type: "keyword", value: "export" },
    { type: "punctuator", value: "*" },
    { type: "identifier", value: "from" },
    { type: "string", value: '"pkg"' }
  ]),
  `export*from"pkg"`
);

// 15. Export string literal
runTest(
  "Export - string literal",
  stringifyTokens([
    { type: "keyword", value: "export" },
    { type: "string", value: '"hello"' }
  ]),
  `export"hello"`
);

/**
 * ADVANCED SPACING CASES
 */

// 16. Import with no space after keyword (identifier follows)
runTest(
  "Import - tight spacing keyword + identifier",
  stringifyTokens([
    { type: "keyword", value: "import" },
    { type: "identifier", value: "A" },
  ]),
  `import A`
);

// 17. Import with identifier starting with a number-like char (to check spacing)
runTest(
  "Import - check 1in case",
  stringifyTokens([
    { type: "keyword", value: "import" },
    { type: "number", value: "1" },
    { type: "identifier", value: "in" },
  ]),
  `import 1 in`
);

// 18. Default import + template literal
runTest(
  "Import - template literal path",
  stringifyTokens([
    { type: "keyword", value: "import" },
    { type: "identifier", value: "A" },
    { type: "identifier", value: "from" },
    { type: "template", value: "`x/${y}`" },
  ]),
  "import A from`x/${y}`"
);

// 19. Dynamic import using template literal
runTest(
  "Import - dynamic template",
  stringifyTokens([
    { type: "identifier", value: "import" },
    { type: "punctuator", value: "(" },
    { type: "template", value: "`./${x}`" },
    { type: "punctuator", value: ")" }
  ]),
  "import(`./${x}`)"
);

// 20. Import with private identifier (synthetic case)
runTest(
  "Import - private id (synthetic)",
  stringifyTokens([
    { type: "keyword", value: "import" },
    { type: "privateIdentifier", value: "#x" }
  ]),
  `import #x`
);

/**
 * EXPORT EDGE CASES
 */

// 21. Export number literal
runTest(
  "Export - number literal",
  stringifyTokens([
    { type: "keyword", value: "export" },
    { type: "number", value: "123" }
  ]),
  `export 123`
);

// 22. Export default arrow function
runTest(
  "Export - default arrow",
  stringifyTokens([
    { type: "keyword", value: "export" },
    { type: "keyword", value: "default" },
    { type: "punctuator", value: "(" },
    { type: "punctuator", value: ")" },
    { type: "punctuator", value: "=>" },
    { type: "identifier", value: "x" }
  ]),
  `export default()=>x`
);

// 23. Export of template literal
runTest(
  "Export - template literal",
  stringifyTokens([
    { type: "keyword", value: "export" },
    { type: "template", value: "`hello`" },
  ]),
  "export`hello`"
);

// 24. Export private identifier
runTest(
  "Export - private id",
  stringifyTokens([
    { type: "keyword", value: "export" },
    { type: "privateIdentifier", value: "#z" }
  ]),
  `export #z`
);

// 25. Export destructuring list
runTest(
  "Export - destructuring",
  stringifyTokens([
    { type: "keyword", value: "export" },
    { type: "punctuator", value: "{" },
    { type: "identifier", value: "a" },
    { type: "punctuator", value: "," },
    { type: "identifier", value: "b" },
    { type: "punctuator", value: ":" },
    { type: "identifier", value: "c" },
    { type: "punctuator", value: "}" }
  ]),
  `export{a,b:c}`
);

/**
 * PUNCTUATOR EDGE RULES
 */

// 26. "--" followed by ">" must have space
runTest(
  "Punctuator - prevent '-->'",
  stringifyTokens([
    { type: "punctuator", value: "--" },
    { type: "punctuator", value: ">" }
  ]),
  `-- >`
);

// 27. "+ ++" must have space
runTest(
  "Punctuator - + ++",
  stringifyTokens([
    { type: "punctuator", value: "+" },
    { type: "punctuator", value: "++" }
  ]),
  `+ ++`
);

// 28. "- --" must have space
runTest(
  "Punctuator - - --",
  stringifyTokens([
    { type: "punctuator", value: "-" },
    { type: "punctuator", value: "--" }
  ]),
  `- --`
);

/**
 * COMPLEX IMPORT & EXPORT CHAINS
 */

// 29. Import + export together (synthetic)
runTest(
  "Complex - import then export",
  stringifyTokens([
    { type: "keyword", value: "import" },
    { type: "identifier", value: "X" },
    { type: "identifier", value: "from" },
    { type: "string", value: '"m1"' },
    { type: "keyword", value: "export" },
    { type: "identifier", value: "X" }
  ]),
  `import X from"m1"export X`
);

// 30. Re-export with alias
runTest(
  "Complex - reexport alias",
  stringifyTokens([
    { type: "keyword", value: "export" },
    { type: "punctuator", value: "{" },
    { type: "identifier", value: "x" },
    { type: "identifier", value: "as" },
    { type: "identifier", value: "y" },
    { type: "punctuator", value: "}" },
    { type: "identifier", value: "from" },
    { type: "string", value: '"mod"' }
  ]),
  `export{x as y}from"mod"`
);

// 31. Export default numeric expression
runTest(
  "Export - default numeric expression",
  stringifyTokens([
    { type: "keyword", value: "export" },
    { type: "keyword", value: "default" },
    { type: "number", value: "42" }
  ]),
  `export default 42`
);

// 32. Export default template literal
runTest(
  "Export - default template",
  stringifyTokens([
    { type: "keyword", value: "export" },
    { type: "keyword", value: "default" },
    { type: "template", value: "`x`" }
  ]),
  "export default`x`"
);

// 33. Export arrow expression with template
runTest(
  "Export - arrow with template",
  stringifyTokens([
    { type: "keyword", value: "export" },
    { type: "punctuator", value: "(" },
    { type: "punctuator", value: ")" },
    { type: "punctuator", value: "=>" },
    { type: "template", value: "`Hello`" }
  ]),
  "export()=>`Hello`"
);

// 34. Multiple imports chained
runTest(
  "Complex - multiple imports",
  stringifyTokens([
    { type: "keyword", value: "import" },
    { type: "identifier", value: "A" },
    { type: "identifier", value: "from" },
    { type: "string", value: '"a"' },
    { type: "keyword", value: "import" },
    { type: "identifier", value: "B" },
    { type: "identifier", value: "from" },
    { type: "string", value: '"b"' }
  ]),
  `import A from"a"import B from"b"`
);

// 35. Import assertion + export
runTest(
  "Complex - import assert then export",
  stringifyTokens([
    { type: "keyword", value: "import" },
    { type: "identifier", value: "cfg" },
    { type: "identifier", value: "from" },
    { type: "string", value: '"conf.json"' },
    { type: "identifier", value: "assert" },
    { type: "punctuator", value: "{" },
    { type: "identifier", value: "type" },
    { type: "punctuator", value: ":" },
    { type: "string", value: '"json"' },
    { type: "punctuator", value: "}" },
    { type: "keyword", value: "export" },
    { type: "identifier", value: "cfg" }
  ]),
  `import cfg from"conf.json"assert{type:"json"}export cfg`,
  true
);