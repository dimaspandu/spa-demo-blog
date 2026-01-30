import stringifyHTMLTokens from "../main.js";
import runTest from "../../../../utils/tester.js";

/**
 * BASIC HTML
 */

runTest(
  "HTML - simple element",
  stringifyHTMLTokens([
    { type: "tagOpen", value: "<div>" },
    { type: "text", value: "Hello" },
    { type: "tagClose", value: "</div>" }
  ]),
  "<div>Hello</div>"
);

/**
 * SELF-CLOSING / VOID ELEMENTS
 */

runTest(
  "SVG - self closing",
  stringifyHTMLTokens([
    { type: "tagOpen", value: "<circle cx=\"5\" cy=\"5\" r=\"5\" />" }
  ]),
  `<circle cx="5" cy="5" r="5" />`
);

/**
 * WHITESPACE PRESERVATION
 */

runTest(
  "HTML - whitespace preserved",
  stringifyHTMLTokens([
    { type: "tagOpen", value: "<p>" },
    { type: "whitespace", value: " " },
    { type: "text", value: "Hello" },
    { type: "whitespace", value: " " },
    { type: "tagClose", value: "</p>" }
  ]),
  "<p> Hello </p>"
);

/**
 * MULTI-NODE SEQUENCE
 */

runTest(
  "HTML - multiple sibling elements",
  stringifyHTMLTokens([
    { type: "tagOpen", value: "<span>" },
    { type: "text", value: "A" },
    { type: "tagClose", value: "</span>" },
    { type: "tagOpen", value: "<span>" },
    { type: "text", value: "B" },
    { type: "tagClose", value: "</span>" }
  ]),
  "<span>A</span><span>B</span>"
);

/**
 * EDGE CASES
 */

runTest(
  "Empty token array",
  stringifyHTMLTokens([]),
  ""
);

runTest(
  "Invalid input",
  stringifyHTMLTokens(null),
  "",
  true
);
