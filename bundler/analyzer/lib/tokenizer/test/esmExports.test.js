import tokenizer from "../main.js";
import runTest from "../../../utils/tester.js";

runTest(
  "Export named",
  tokenizer(`export { a, b, c };`).map(t => ({
    type: t.type,
    value: t.value
  })),
  [
    { type: 'keyword', value: 'export' },
    { type: 'whitespace', value: ' ' },
    { type: 'punctuator', value: '{' },
    { type: 'whitespace', value: ' ' },
    { type: 'identifier', value: 'a' },
    { type: 'punctuator', value: ',' },
    { type: 'whitespace', value: ' ' },
    { type: 'identifier', value: 'b' },
    { type: 'punctuator', value: ',' },
    { type: 'whitespace', value: ' ' },
    { type: 'identifier', value: 'c' },
    { type: 'whitespace', value: ' ' },
    { type: 'punctuator', value: '}' },
    { type: 'punctuator', value: ';' }
  ]
);

runTest(
  "Export alias",
  tokenizer(`export { a as x, b as y };`).map(t => ({
    type: t.type,
    value: t.value
  })),
  [
    { type: 'keyword', value: 'export' },
    { type: 'whitespace', value: ' ' },
    { type: 'punctuator', value: '{' },
    { type: 'whitespace', value: ' ' },

    { type: 'identifier', value: 'a' },
    { type: 'whitespace', value: ' ' },
    { type: 'identifier', value: 'as' },
    { type: 'whitespace', value: ' ' },
    { type: 'identifier', value: 'x' },
    { type: 'punctuator', value: ',' },
    { type: 'whitespace', value: ' ' },

    { type: 'identifier', value: 'b' },
    { type: 'whitespace', value: ' ' },
    { type: 'identifier', value: 'as' },
    { type: 'whitespace', value: ' ' },
    { type: 'identifier', value: 'y' },
    { type: 'whitespace', value: ' ' },

    { type: 'punctuator', value: '}' },
    { type: 'punctuator', value: ';' }
  ]
);

runTest(
  "Export default function",
  tokenizer(`export default function () {};`).map(t => ({
    type: t.type,
    value: t.value
  })),
  [
    { type: 'keyword', value: 'export' },
    { type: 'whitespace', value: ' ' },
    { type: 'keyword', value: 'default' },
    { type: 'whitespace', value: ' ' },
    { type: 'keyword', value: 'function' },
    { type: 'whitespace', value: ' ' },
    { type: 'punctuator', value: '(' },
    { type: 'punctuator', value: ')' },
    { type: 'whitespace', value: ' ' },
    { type: 'punctuator', value: '{' },
    { type: 'punctuator', value: '}' },
    { type: 'punctuator', value: ';' }
  ]
);

runTest(
  "Export default expression",
  tokenizer(`export default 123;`).map(t => ({
    type: t.type,
    value: t.value
  })),
  [
    { type: 'keyword', value: 'export' },
    { type: 'whitespace', value: ' ' },
    { type: 'keyword', value: 'default' },
    { type: 'whitespace', value: ' ' },
    { type: 'number', value: '123' },
    { type: 'punctuator', value: ';' }
  ]
);

runTest(
  "Export named from module",
  tokenizer(`export { a, b } from "lib";`).map(t => ({
    type: t.type,
    value: t.value
  })),
  [
    { type: 'keyword', value: 'export' },
    { type: 'whitespace', value: ' ' },
    { type: 'punctuator', value: '{' },
    { type: 'whitespace', value: ' ' },
    { type: 'identifier', value: 'a' },
    { type: 'punctuator', value: ',' },
    { type: 'whitespace', value: ' ' },
    { type: 'identifier', value: 'b' },
    { type: 'whitespace', value: ' ' },
    { type: 'punctuator', value: '}' },
    { type: 'whitespace', value: ' ' },
    { type: 'identifier', value: 'from' },
    { type: 'whitespace', value: ' ' },
    { type: 'string', value: '"lib"' },
    { type: 'punctuator', value: ';' }
  ],
  true
);


