import getObjectLiteralsEndIndex from "../getObjectLiteralsEndIndex.js";
import runTest from "../tester.js";

// Helper token builders
const p = (v) => ({ type: "punctuator", value: v });
const id = (v) => ({ type: "identifier", value: v });
const str = (v) => ({ type: "string", value: v });
const num = (v) => ({ type: "number", value: v });

// -------------------------------------------------------
// 1. Simple object: { a: 1 }
// -------------------------------------------------------
runTest(
  "Simple object literal",
  (function () {
    const tokens = [
      p("{"), id("a"), p(":"), num("1"), p("}")
    ];
    return getObjectLiteralsEndIndex(tokens, 0);
  })(),
  4
);

// -------------------------------------------------------
// 2. Nested object: { a: { b: 2 }, c: 3 }
// -------------------------------------------------------
runTest(
  "Nested object literal",
  (function () {
    const tokens = [
      p("{"),
      id("a"), p(":"), p("{"), id("b"), p(":"), num("2"), p("}"),
      p(","), id("c"), p(":"), num("3"),
      p("}")
    ];
    return getObjectLiteralsEndIndex(tokens, 0);
  })(),
  12
);

// -------------------------------------------------------
// 3. Object with array: { a: [1, { b: 2 }] }
// -------------------------------------------------------
runTest(
  "Object with nested array containing object",
  (function () {
    const tokens = [
      p("{"),
      id("a"), p(":"), p("["), num("1"), p(","), p("{"),
      id("b"), p(":"), num("2"), p("}"), p("]"),
      p("}")
    ];
    return getObjectLiteralsEndIndex(tokens, 0);
  })(),
  12
);

// -------------------------------------------------------
// 4. Arrow function returning object: () => ({ nested: true })
// -------------------------------------------------------
runTest(
  "Arrow function returning object literal",
  (function () {
    const tokens = [
      p("("), p(")"), p("=>"),
      p("("), p("{"), id("nested"), p(":"), id("true"), p("}"), p(")")
    ];
    const start = 4; // position of "{"
    return getObjectLiteralsEndIndex(tokens, start);
  })(),
  8
);

// -------------------------------------------------------
// 5. Deeply nested: { a: { b: { c: { d: 5 } } } }
// -------------------------------------------------------
runTest(
  "Deeply nested object",
  (function () {
    const tokens = [
      p("{"), id("a"), p(":"), p("{"), id("b"), p(":"), p("{"),
      id("c"), p(":"), p("{"), id("d"), p(":"), num("5"),
      p("}"), p("}"), p("}"), p("}")
    ];
    return getObjectLiteralsEndIndex(tokens, 0);
  })(),
  16
);

// -------------------------------------------------------
// 6. StartIndex does NOT point to "{"
// -------------------------------------------------------
runTest(
  "Error scenario: startIndex does not point to '{'",
  (function () {
    const tokens = [id("x"), p("{"), p("}")];
    return getObjectLiteralsEndIndex(tokens, 0); // startIndex=0 → not "{"
  })(),
  null
);

// -------------------------------------------------------
// 7. Missing closing brace
// -------------------------------------------------------
runTest(
  "Missing closing brace",
  (function () {
    const tokens = [p("{"), id("a"), p(":"), num("1")];
    return getObjectLiteralsEndIndex(tokens, 0);
  })(),
  null
);

// -------------------------------------------------------
// 8. Missing inner closing brace: { a: { b: 2 }
// -------------------------------------------------------
runTest(
  "Missing nested closing brace",
  (function () {
    const tokens = [
      p("{"), id("a"), p(":"), p("{"),
      id("b"), p(":"), num("2"),
      p("}")
      // missing final outer "}"
    ];
    return getObjectLiteralsEndIndex(tokens, 0);
  })(),
  null,
  true
);
