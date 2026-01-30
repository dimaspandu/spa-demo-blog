import getExportBlockEndIndex from "../getExportBlockEndIndex.js";
import runTest from "../tester.js";

/* ============================================================================
 * Helper functions for constructing tokens
 * ==========================================================================*/
const kw = (value, line)       => ({ type: "keyword", value, line });
const id = (value, line)       => ({ type: "identifier", value, line });
const str = (value, line)      => ({ type: "string", value, line });
const num = (value, line)      => ({ type: "number", value, line });
const punc = (value, line)     => ({ type: "punctuator", value, line });

/* ============================================================================
 * 1. EXPORT VARIABLE DECLARATIONS
 * Basic export patterns involving const, let, var, and simple expressions.
 * ==========================================================================*/

// export const a = 1;
runTest(
  "1. export const a = 1;",
  getExportBlockEndIndex(
    [kw("export",1), kw("const",1), id("a",1), punc("=",1), num("1",1), punc(";",1)],
    0
  ),
  5
);

// export let b = 2;
runTest(
  "1. export let b = 2;",
  getExportBlockEndIndex(
    [kw("export",1), kw("let",1), id("b",1), punc("=",1), num("2",1), punc(";",1)],
    0
  ),
  5
);

// export var c = 3;
runTest(
  "1. export var c = 3;",
  getExportBlockEndIndex(
    [kw("export",1), kw("var",1), id("c",1), punc("=",1), num("3",1), punc(";",1)],
    0
  ),
  5
);

// export const sum = (a,b)=>a+b;
runTest(
  "1. export const sum = (a,b)=>a+b",
  getExportBlockEndIndex(
    [
      kw("export",1), kw("const",1), id("sum",1), punc("=",1),
      punc("(",1), id("a",1), punc(",",1), id("b",1), punc(")",1),
      punc("=>",1), id("a",1), punc("+",1), id("b",1), punc(";",1)
    ],
    0
  ),
  13
);

// export let noValue;
runTest(
  "1. export let noValue;",
  getExportBlockEndIndex(
    [kw("export",1), kw("let",1), id("noValue",1), punc(";",1)],
    0
  ),
  3
);

/* ============================================================================
 * 2. EXPORT STATEMENT LIST USING BRACES
 * Covers exports that reference existing local bindings.
 * ==========================================================================*/

// export { x, y };
runTest(
  "2. export { x, y };",
  getExportBlockEndIndex(
    [
      kw("export",1), punc("{",1), id("x",1), punc(",",1), id("y",1),
      punc("}",1), punc(";",1)
    ],
    0
  ),
  6
);

// export { x as xValue, y as yValue };
runTest(
  "2. export { x as xValue, y as yValue };",
  getExportBlockEndIndex(
    [
      kw("export",1), punc("{",1),
      id("x",1), kw("as",1), id("xValue",1), punc(",",1),
      id("y",1), kw("as",1), id("yValue",1),
      punc("}",1), punc(";",1)
    ],
    0
  ),
  10
);

// export { p, q, r };
runTest(
  "2. export { p, q, r };",
  getExportBlockEndIndex(
    [
      kw("export",1), punc("{",1),
      id("p",1), punc(",",1),
      id("q",1), punc(",",1),
      id("r",1),
      punc("}",1), punc(";",1)
    ],
    0
  ),
  8
);

/* ============================================================================
 * 3. EXPORT WITH ALIASING OF LOCAL DEFAULT IDENTIFIER
 * ==========================================================================*/
runTest(
  "3. export { defaultLocal as default };",
  getExportBlockEndIndex(
    [
      kw("export",1), punc("{",1),
      id("defaultLocal",1), kw("as",1), id("default",1),
      punc("}",1), punc(";",1)
    ],
    0
  ),
  6
);

/* ============================================================================
 * 4. DEFAULT EXPORT FOR DECLARATIONS (FUNCTION, CLASS)
 * ==========================================================================*/

runTest(
  "4. export default function myFunc() {}",
  getExportBlockEndIndex(
    [
      kw("export",1), kw("default",1),
      kw("function",1), id("myFunc",1),
      punc("(",1), punc(")",1),
      punc("{",1), punc("}",1)
    ],
    0
  ),
  7
);

runTest(
  "4. export default class MyClass {}",
  getExportBlockEndIndex(
    [
      kw("export",1), kw("default",1),
      kw("class",1), id("MyClass",1),
      punc("{",1), punc("}",1)
    ],
    0
  ),
  5
);

/* ============================================================================
 * 5. DEFAULT EXPORT EXPRESSIONS
 * Covers default export of function expression, class expression, objects, etc.
 * ==========================================================================*/

runTest(
  "5. export default (function(){})",
  getExportBlockEndIndex(
    [
      kw("export",1), kw("default",1),
      punc("(",1),
        kw("function",1), punc("(",1), punc(")",1),
        punc("{",1), punc("}",1),
      punc(")",1), punc(";",1)
    ],
    0
  ),
  9
);

runTest(
  "5. export default class {}",
  getExportBlockEndIndex(
    [
      kw("export",1), kw("default",1),
      kw("class",1), punc("{",1), punc("}",1), punc(";",1)
    ],
    0
  ),
  4
);

runTest(
  "5. export default { foo:1 }",
  getExportBlockEndIndex(
    [
      kw("export",1), kw("default",1),
      punc("{",1), id("foo",1), punc(":",1), num("1",1), punc("}",1)
    ],
    0
  ),
  6
);

/* ============================================================================
 * 6. EXPORT FUNCTION / ASYNC FUNCTION / GENERATOR
 * ==========================================================================*/

runTest(
  "6. export function greet(){}",
  getExportBlockEndIndex(
    [
      kw("export",1), kw("function",1), id("greet",1),
      punc("(",1), punc(")",1),
      punc("{",1), punc("}",1)
    ],
    0
  ),
  6
);

runTest(
  "6. export async function fetchData(){}",
  getExportBlockEndIndex(
    [
      kw("export",1), kw("async",1), kw("function",1), id("fetchData",1),
      punc("(",1), punc(")",1),
      punc("{",1), punc("}",1)
    ],
    0
  ),
  7
);

/* ============================================================================
 * 7. RE-EXPORTS (Export-from Patterns)
 * ==========================================================================*/

runTest(
  "7. export * from 'mod'",
  getExportBlockEndIndex(
    [
      kw("export",1), punc("*",1),
      kw("from",1), str('"mod"',1), punc(";",1)
    ],
    0
  ),
  4
);

runTest(
  "7. export { foo, bar } from 'x'",
  getExportBlockEndIndex(
    [
      kw("export",1), punc("{",1),
      id("foo",1), punc(",",1), id("bar",1),
      punc("}",1),
      kw("from",1), str('"x"',1), punc(";",1)
    ],
    0
  ),
  8
);

runTest(
  "7. export { baz as myBaz } from 'x'",
  getExportBlockEndIndex(
    [
      kw("export",1), punc("{",1),
      id("baz",1), kw("as",1), id("myBaz",1),
      punc("}",1),
      kw("from",1), str('"x"',1), punc(";",1)
    ],
    0
  ),
  8
);

/* ============================================================================
 * 8. EXPORT * AS NAMESPACE
 * ==========================================================================*/

runTest(
  "8. export * as utils from 'x'",
  getExportBlockEndIndex(
    [
      kw("export",1), punc("*",1), kw("as",1), id("utils",1),
      kw("from",1), str('"x"',1), punc(";",1)
    ],
    0
  ),
  6
);

/* ============================================================================
 * 9. EXPORT USING NAMESPACE BINDINGS
 * Example: export { lib.foo, lib.bar }
 * ==========================================================================*/

runTest(
  "9. export { lib.foo, lib.bar }",
  getExportBlockEndIndex(
    [
      kw("export",1), punc("{",1),
      id("lib",1), punc(".",1), id("foo",1), punc(",",1),
      id("lib",1), punc(".",1), id("bar",1),
      punc("}",1), punc(";",1)
    ],
    0
  ),
  10
);

/* ============================================================================
 * 10. EXPORT LOCAL DEFAULT ALIAS
 * ==========================================================================*/

runTest(
  "10. export { comp as default }",
  getExportBlockEndIndex(
    [
      kw("export",1), punc("{",1),
      id("comp",1), kw("as",1), id("default",1),
      punc("}",1), punc(";",1)
    ],
    0
  ),
  6
);

/* ============================================================================
 * 11. EXPORT WITH COMPLEX OR NESTED BINDINGS
 * ==========================================================================*/

runTest(
  "11. export { config as appConfig }",
  getExportBlockEndIndex(
    [
      kw("export",1), punc("{",1),
      id("config",1), kw("as",1), id("appConfig",1),
      punc("}",1), punc(";",1)
    ],
    0
  ),
  6
);

/* ============================================================================
 * 12. EXPORT WITH COMMENTS (Comments removed by tokenizer)
 * ==========================================================================*/

runTest(
  "12. export const commented = 100",
  getExportBlockEndIndex(
    [
      kw("export",1), kw("const",1), id("commented",1),
      punc("=",1), num("100",1), punc(";",1)
    ],
    0
  ),
  5
);

/* ============================================================================
 * 13. EXPORT AFTER LEADING SEMICOLON (ASI edge case)
 * ==========================================================================*/

runTest(
  "13. ;export const startingSemicolon = true",
  getExportBlockEndIndex(
    [
      punc(";",1),
      kw("export",1), kw("const",1),
      id("startingSemicolon",1),
      punc("=",1), id("true",1), punc(";",1)
    ],
    1
  ),
  6
);

/* ============================================================================
 * 14. EXPORT WITHOUT TERMINATING SEMICOLON
 * The export should stop before the next statement.
 * ==========================================================================*/

runTest(
  "14. export const endNoSemicolon = 'END'",
  getExportBlockEndIndex(
    [
      kw("export",158), kw("const",158),
      id("endNoSemicolon",158),
      punc("=",158), str('"END"',158),

      // Next statement; export must end before this
      kw("const",165), id("dynamicPath",165),
      punc("=",165), str('"./dynamic.js"',165), punc(";",165)
    ],
    0
  ),
  4
);

/* ============================================================================
 * 15. EXPORT FROM DYNAMIC IDENTIFIER (valid for tokenizer)
 * ==========================================================================*/

runTest(
  "15. export * from dynamicPath",
  getExportBlockEndIndex(
    [kw("export",1), punc("*",1), kw("from",1), id("dynamicPath",1), punc(";",1)],
    0
  ),
  4,
  true
);
