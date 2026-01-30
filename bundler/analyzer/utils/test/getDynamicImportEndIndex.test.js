import getDynamicImportEndIndex from "../getDynamicImportEndIndex.js";
import runTest from "../tester.js";

// Helper: quickly create tokens
const id = v => ({ type: "identifier", value: v });
const kw = v => ({ type: "keyword", value: v });
const p = v => ({ type: "punctuator", value: v });
const str = v => ({ type: "string", value: v });
const tmpl = v => ({ type: "template", value: v });

// -------------------------------------------------------
// 1. Simple: import("x")
// -------------------------------------------------------
runTest(
  "Simple dynamic import",
  getDynamicImportEndIndex(
    [
      kw("import"), // 0
      p("("),       // 1
      str("x"),     // 2
      p(")")        // 3
    ],
    0
  ),
  3
);

// -------------------------------------------------------
// 2. Template literal: import(`./file-${x}.js`)
// -------------------------------------------------------
runTest(
  "Template literal argument",
  getDynamicImportEndIndex(
    [
      kw("import"), // 0
      p("("),       // 1
      tmpl("`./file-${x}.js`"), // simplified single token
      p(")")        // 3
    ],
    0
  ),
  3
);

// -------------------------------------------------------
// 3. Nested object argument: import("x", { a: { b: 1 } })
// -------------------------------------------------------
runTest(
  "Object argument (nested)",
  getDynamicImportEndIndex(
    [
      kw("import"),   // 0
      p("("),         // 1
      str("x"),       // 2
      p(","),         // 3
      p("{"),         // 4
      id("a"),        // 5
      p(":"),         // 6
      p("{"),         // 7
      id("b"),        // 8
      p(":"),         // 9
      id("1"),        // 10
      p("}"),         // 11
      p("}"),         // 12
      p(")")          // 13
    ],
    0
  ),
  13
);

// -------------------------------------------------------
// 4. Multiple args: import("x", { a: 1 })
// -------------------------------------------------------
runTest(
  "Two args",
  getDynamicImportEndIndex(
    [
      kw("import"),
      p("("),
      str("x"),
      p(","),
      p("{"), id("a"), p(":"), id("1"), p("}"),
      p(")")
    ],
    0
  ),
  9
);

// -------------------------------------------------------
// 5. Chained then: import("x").then(cb)
// -------------------------------------------------------
runTest(
  "Chained .then()",
  getDynamicImportEndIndex(
    [
      kw("import"), p("("), str("x"), p(")"),
      p("."), id("then"), p("("), id("cb"), p(")")
    ],
    0
  ),
  8
);

// -------------------------------------------------------
// 6. Chained then + catch: import("x").then(cb).catch(err)
// -------------------------------------------------------
runTest(
  "Chained .then().catch()",
  getDynamicImportEndIndex(
    [
      kw("import"), p("("), str("x"), p(")"),
      p("."), id("then"),  p("("), id("cb"),  p(")"),
      p("."), id("catch"), p("("), id("err"), p(")")
    ],
    0
  ),
  13
);

// -------------------------------------------------------
// 6b. Chained then + catch (catch is keyword)
// -------------------------------------------------------
runTest(
  "Chained .then().catch() where catch is keyword",
  getDynamicImportEndIndex(
    [
      kw("import"), p("("), str("x"), p(")"),
      p("."), id("then"),  p("("), id("cb"),  p(")"),
      p("."), kw("catch"), p("("), id("err"), p(")")
    ],
    0
  ),
  13
);

// -------------------------------------------------------
// 7. Long chain: import("x").then(a).catch(b).finally(c)
// -------------------------------------------------------
runTest(
  "Long chain",
  getDynamicImportEndIndex(
    [
      kw("import"), p("("), str("x"), p(")"),
      p("."), id("then"),    p("("), id("a"), p(")"),
      p("."), id("catch"),   p("("), id("b"), p(")"),
      p("."), id("finally"), p("("), id("c"), p(")")
    ],
    0
  ),
  18
);

// -------------------------------------------------------
// 8. With semicolon at the end
// -------------------------------------------------------
runTest(
  "Ends with semicolon",
  getDynamicImportEndIndex(
    [
      kw("import"), p("("), str("x"), p(")"),
      p("."), id("then"), p("("), id("cb"), p(")"),
      p(";")
    ],
    0
  ),
  9
);

// -------------------------------------------------------
// 9. Embedded in larger code
// -------------------------------------------------------
runTest(
  "Inside other tokens",
  getDynamicImportEndIndex(
    [
      kw("const"), id("mod"), p("="),
      kw("import"), p("("), str("a"), p(")"),
      p("."), id("then"), p("("), id("cb"), p(")"),
      p(";")
    ],
    3
  ),
  12
);

// -------------------------------------------------------
// 10. Error: start not import
// -------------------------------------------------------
runTest(
  "Error: start index not import",
  (function() {
    try {
      return getDynamicImportEndIndex(
        [id("x"), p("("), str("a"), p(")")],
        0
      );
    } catch (e) {
      return e.message;
    }
  })(),
  "Start index must point to 'import'"
);

// -------------------------------------------------------
// 11. Error: import without '(' → static import
// -------------------------------------------------------
runTest(
  "Error: static import form",
  (function() {
    try {
      return getDynamicImportEndIndex(
        [kw("import"), id("x"), kw("from"), str("y")],
        0
      );
    } catch (e) {
      return e.message;
    }
  })(),
  "This 'import' is not a dynamic import expression"
);

// -------------------------------------------------------
// 12. Error: unmatched parenthesis
// -------------------------------------------------------
runTest(
  "Error: unmatched parentheses",
  (function() {
    try {
      return getDynamicImportEndIndex(
        [kw("import"), p("("), str("x")], // no closing ')'
        0
      );
    } catch (e) {
      return e.message;
    }
  })(),
  "Unmatched ( / )",
  true
);
