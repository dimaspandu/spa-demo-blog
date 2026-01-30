import htmlTokenizer from "../main.js";
import runTest from "../../../../utils/tester.js";

runTest(
  "HTML: simple tag with text",
  htmlTokenizer(`<div>Hello</div>`).map(t => ({
    type: t.type,
    value: t.value
  })),
  [
    { type: "tag_open", value: "<" },
    { type: "tag_name", value: "div" },
    { type: "tag_end", value: ">" },
    { type: "text", value: "Hello" },
    { type: "tag_open", value: "<" },
    { type: "tag_close", value: "/" },
    { type: "tag_name", value: "div" },
    { type: "tag_end", value: ">" }
  ]
);

runTest(
  "HTML: tag with attributes",
  htmlTokenizer(`<div class="a" id='b'></div>`).map(t => ({
    type: t.type,
    value: t.value
  })),
  [
    { type: "tag_open", value: "<" },
    { type: "tag_name", value: "div" },
    { type: "whitespace", value: " " },
    { type: "attr_name", value: "class" },
    { type: "attr_equal", value: "=" },
    { type: "attr_value", value: "\"a\"" },
    { type: "whitespace", value: " " },
    { type: "attr_name", value: "id" },
    { type: "attr_equal", value: "=" },
    { type: "attr_value", value: "'b'" },
    { type: "tag_end", value: ">" },
    { type: "tag_open", value: "<" },
    { type: "tag_close", value: "/" },
    { type: "tag_name", value: "div" },
    { type: "tag_end", value: ">" }
  ]
);

runTest(
  "HTML: self closing tag",
  htmlTokenizer(`<img src="x.png" />`).map(t => ({
    type: t.type,
    value: t.value
  })),
  [
    { type: "tag_open", value: "<" },
    { type: "tag_name", value: "img" },
    { type: "whitespace", value: " " },
    { type: "attr_name", value: "src" },
    { type: "attr_equal", value: "=" },
    { type: "attr_value", value: "\"x.png\"" },
    { type: "whitespace", value: " " },
    { type: "tag_self_close", value: "/>" }
  ]
);

runTest(
  "HTML: comment",
  htmlTokenizer(`<!-- hello -->`).map(t => ({
    type: t.type,
    value: t.value
  })),
  [
    { type: "comment", value: "<!-- hello -->" }
  ]
);

runTest(
  "HTML: whitespace and newline",
  htmlTokenizer(`<div>\n  Hello\n</div>`).map(t => ({
    type: t.type,
    value: t.value
  })),
  [
    { type: "tag_open", value: "<" },
    { type: "tag_name", value: "div" },
    { type: "tag_end", value: ">" },
    { type: "newline", value: "\n" },
    { type: "whitespace", value: "  " },
    { type: "text", value: "Hello" },
    { type: "newline", value: "\n" },
    { type: "tag_open", value: "<" },
    { type: "tag_close", value: "/" },
    { type: "tag_name", value: "div" },
    { type: "tag_end", value: ">" }
  ]
);

runTest(
  "HTML: SVG content",
  htmlTokenizer(`<svg viewBox="0 0 10 10"><circle cx="5" cy="5"/></svg>`).map(t => ({
    type: t.type,
    value: t.value
  })),
  [
    { type: "tag_open", value: "<" },
    { type: "tag_name", value: "svg" },
    { type: "whitespace", value: " " },
    { type: "attr_name", value: "viewBox" },
    { type: "attr_equal", value: "=" },
    { type: "attr_value", value: "\"0 0 10 10\"" },
    { type: "tag_end", value: ">" },

    { type: "tag_open", value: "<" },
    { type: "tag_name", value: "circle" },
    { type: "whitespace", value: " " },
    { type: "attr_name", value: "cx" },
    { type: "attr_equal", value: "=" },
    { type: "attr_value", value: "\"5\"" },
    { type: "whitespace", value: " " },
    { type: "attr_name", value: "cy" },
    { type: "attr_equal", value: "=" },
    { type: "attr_value", value: "\"5\"" },
    { type: "tag_self_close", value: "/>" },

    { type: "tag_open", value: "<" },
    { type: "tag_close", value: "/" },
    { type: "tag_name", value: "svg" },
    { type: "tag_end", value: ">" }
  ],
  true
);
