import getArrayLiteralsEndIndex from "../getArrayLiteralsEndIndex.js";
import runTest from "../tester.js";

// -------------------------------------------------------
// 1. Simple flat array
// -------------------------------------------------------
runTest(
  "Simple Flat Array",
  getArrayLiteralsEndIndex(
    [
      { type: "punctuator", value: "[" }, // 0
      { type: "numeric", value: "1" },    // 1
      { type: "punctuator", value: "," }, // 2
      { type: "numeric", value: "2" },    // 3
      { type: "punctuator", value: "]" }  // 4
    ],
    0
  ),
  4
);

// -------------------------------------------------------
// 2. Nested array: [1, [2, 3]]
// -------------------------------------------------------
runTest(
  "Nested Array",
  getArrayLiteralsEndIndex(
    [
      { type: "punctuator", value: "[" }, // 0
      { type: "numeric", value: "1" },    // 1
      { type: "punctuator", value: "," }, // 2
      { type: "punctuator", value: "[" }, // 3
      { type: "numeric", value: "2" },    // 4
      { type: "punctuator", value: "," }, // 5
      { type: "numeric", value: "3" },    // 6
      { type: "punctuator", value: "]" }, // 7
      { type: "punctuator", value: "]" }  // 8
    ],
    0
  ),
  8
);

// -------------------------------------------------------
// 3. Array with object inside: [ { a: 1 }, 2 ]
// -------------------------------------------------------
runTest(
  "Array With Object",
  getArrayLiteralsEndIndex(
    [
      { type: "punctuator", value: "[" }, // 0
      { type: "punctuator", value: "{" }, // 1
      { type: "identifier", value: "a" }, // 2
      { type: "punctuator", value: ":" }, // 3
      { type: "numeric", value: "1" },    // 4
      { type: "punctuator", value: "}" }, // 5
      { type: "punctuator", value: "," }, // 6
      { type: "numeric", value: "2" },    // 7
      { type: "punctuator", value: "]" }  // 8
    ],
    0
  ),
  8
);

// -------------------------------------------------------
// 4. Deeply nested arrays
// -------------------------------------------------------
runTest(
  "Deeply Nested Arrays",
  getArrayLiteralsEndIndex(
    [
      { type: "punctuator", value: "[" }, // 0
      { type: "punctuator", value: "[" }, // 1
      { type: "punctuator", value: "[" }, // 2
      { type: "identifier", value: "a" }, // 3
      { type: "punctuator", value: "]" }, // 4
      { type: "punctuator", value: "]" }, // 5
      { type: "punctuator", value: "]" }  // 6
    ],
    0
  ),
  6
);

// -------------------------------------------------------
// 5. Embedded array in larger token list
// -------------------------------------------------------
runTest(
  "Embedded Array",
  getArrayLiteralsEndIndex(
    [
      { type: "identifier", value: "x" },  // 0
      { type: "punctuator", value: "=" },  // 1
      { type: "punctuator", value: "[" },  // 2 <--- startIndex
      { type: "numeric", value: "1" },     // 3
      { type: "punctuator", value: "," },  // 4
      { type: "numeric", value: "2" },     // 5
      { type: "punctuator", value: "]" },  // 6
      { type: "punctuator", value: ";" }   // 7
    ],
    2
  ),
  6
);

// -------------------------------------------------------
// 6. Empty array: []
// -------------------------------------------------------
runTest(
  "Empty Array",
  getArrayLiteralsEndIndex(
    [
      { type: "punctuator", value: "[" },
      { type: "punctuator", value: "]" }
    ],
    0
  ),
  1
);

// -------------------------------------------------------
// 7. Array with trailing comma: [a,]
// -------------------------------------------------------
runTest(
  "Trailing Comma",
  getArrayLiteralsEndIndex(
    [
      { type: "punctuator", value: "[" }, // 0
      { type: "identifier", value: "a" }, // 1
      { type: "punctuator", value: "," }, // 2
      { type: "punctuator", value: "]" }  // 3
    ],
    0
  ),
  3
);

// -------------------------------------------------------
// 8. Invalid: missing closing bracket
// -------------------------------------------------------
runTest(
  "Missing Closing Bracket",
  getArrayLiteralsEndIndex(
    [
      { type: "punctuator", value: "[" },
      { type: "identifier", value: "a" },
      { type: "punctuator", value: "," },
      { type: "punctuator", value: "[" },
      { type: "identifier", value: "b" }
      // no closing brackets
    ],
    0
  ),
  null,
  true
);
