import getShallowDestructureEndIndex from "../getShallowDestructureEndIndex.js";
import runTest from "../tester.js";

// -------------------------------------------------------
// 1. Simple flat pattern
// -------------------------------------------------------
runTest(
  "Simple Flat",
  getShallowDestructureEndIndex(
    [
      { type: "punctuator", value: "{" },
      { type: "identifier", value: "a" },
      { type: "punctuator", value: "," },
      { type: "identifier", value: "b" },
      { type: "punctuator", value: "}" }
    ],
    0
  ),
  4
);

// -------------------------------------------------------
// 2. Nested one level: { a: { b } }
// -------------------------------------------------------
runTest(
  "Nested Object",
  getShallowDestructureEndIndex(
    [
      { type: "punctuator", value: "{" },     // 0
      { type: "identifier", value: "a" },     // 1
      { type: "punctuator", value: ":" },     // 2
      { type: "punctuator", value: "{" },     // 3
      { type: "identifier", value: "b" },     // 4
      { type: "punctuator", value: "}" },     // 5
      { type: "punctuator", value: "}" }      // 6
    ],
    0
  ),
  6
);

// -------------------------------------------------------
// 3. Deeply nested: { a: { b: { c: { d } } } }
// -------------------------------------------------------
runTest(
  "Deeply Nested",
  getShallowDestructureEndIndex(
    [
      { type: "punctuator", value: "{" },     // 0
      { type: "identifier", value: "a" },     // 1
      { type: "punctuator", value: ":" },     // 2
      { type: "punctuator", value: "{" },     // 3
      { type: "identifier", value: "b" },     // 4
      { type: "punctuator", value: ":" },     // 5
      { type: "punctuator", value: "{" },     // 6
      { type: "identifier", value: "c" },     // 7
      { type: "punctuator", value: ":" },     // 8
      { type: "punctuator", value: "{" },     // 9
      { type: "identifier", value: "d" },     // 10
      { type: "punctuator", value: "}" },     // 11
      { type: "punctuator", value: "}" },     // 12
      { type: "punctuator", value: "}" },     // 13
      { type: "punctuator", value: "}" }      // 14
    ],
    0
  ),
  14
);

// -------------------------------------------------------
// 4. Pattern inside a larger token list
// -------------------------------------------------------
runTest(
  "Embedded Pattern",
  getShallowDestructureEndIndex(
    [
      { type: "keyword", value: "const" },    // 0
      { type: "identifier", value: "x" },     // 1
      { type: "punctuator", value: "=" },     // 2
      { type: "punctuator", value: "{" },     // 3  <--- startIndex
      { type: "identifier", value: "a" },     // 4
      { type: "punctuator", value: ":" },     // 5
      { type: "punctuator", value: "{" },     // 6
      { type: "identifier", value: "b" },     // 7
      { type: "punctuator", value: "}" },     // 8
      { type: "punctuator", value: "}" },     // 9
      { type: "punctuator", value: ";" }      // 10
    ],
    3
  ),
  9
);

// -------------------------------------------------------
// 5. Empty: {}
// -------------------------------------------------------
runTest(
  "Empty Destructure",
  getShallowDestructureEndIndex(
    [
      { type: "punctuator", value: "{" },
      { type: "punctuator", value: "}" }
    ],
    0
  ),
  1
);

// -------------------------------------------------------
// 6. With spread: { a, ...rest }
// -------------------------------------------------------
runTest(
  "With Spread",
  getShallowDestructureEndIndex(
    [
      { type: "punctuator", value: "{" },     // 0
      { type: "identifier", value: "a" },     // 1
      { type: "punctuator", value: "," },     // 2
      { type: "punctuator", value: "." },     // 3
      { type: "punctuator", value: "." },     // 4
      { type: "punctuator", value: "." },     // 5
      { type: "identifier", value: "rest" },  // 6
      { type: "punctuator", value: "}" }      // 7
    ],
    0
  ),
  7
);

// -------------------------------------------------------
// 7. Invalid: no closing brace => return null
// -------------------------------------------------------
runTest(
  "Missing Closing Brace",
  getShallowDestructureEndIndex(
    [
      { type: "punctuator", value: "{" },
      { type: "identifier", value: "a" },
      { type: "punctuator", value: ":" },
      { type: "punctuator", value: "{" },
      { type: "identifier", value: "b" }
      // no closing braces
    ],
    0
  ),
  null
);

// -------------------------------------------------------
// 8. Start index not at "{": should still work (depth=0 -> 1)
// -------------------------------------------------------
runTest(
  "Start Not At Brace",
  getShallowDestructureEndIndex(
    [
      { type: "identifier", value: "x" },     // 0
      { type: "punctuator", value: "=" },     // 1
      { type: "punctuator", value: "{" },     // 2 <--- startIndex
      { type: "identifier", value: "a" },     // 3
      { type: "punctuator", value: "}" },     // 4
      { type: "punctuator", value: ";" }      // 5
    ],
    2
  ),
  4,
  true
);