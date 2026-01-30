import minifyJSON from "../main.js";
import runTest from "../../../../utils/tester.js";

/**
 * BASIC OBJECTS
 */

runTest(
  "Minify JSON - simple object",
  minifyJSON(`{ "a": 1, "b": 2 }`),
  '{"a":1,"b":2}'
);

runTest(
  "Minify JSON - nested object",
  minifyJSON(`
    {
      "user": {
        "id": 1,
        "name": "Dimas"
      }
    }
  `),
  '{"user":{"id":1,"name":"Dimas"}}'
);

/**
 * ARRAYS
 */

runTest(
  "Minify JSON - array",
  minifyJSON(`[ 1, 2, 3 ]`),
  "[1,2,3]"
);

runTest(
  "Minify JSON - nested array",
  minifyJSON(`
    [
      { "x": 1 },
      { "y": 2 }
    ]
  `),
  '[{"x":1},{"y":2}]'
);

/**
 * WHITESPACE & NEWLINES
 */

runTest(
  "Minify JSON - remove whitespace",
  minifyJSON(`  {    "a"   :    1   }   `),
  '{"a":1}'
);

runTest(
  "Minify JSON - remove newlines",
  minifyJSON(`
    {
      "a": 1,
      "b": 2
    }
  `),
  '{"a":1,"b":2}'
);

/**
 * STRINGS
 */

runTest(
  "Minify JSON - preserve string whitespace",
  minifyJSON(`{ "msg": "hello     world" }`),
  '{"msg":"hello     world"}'
);

runTest(
  "Minify JSON - escaped characters",
  minifyJSON(`{ "path": "C:\\\\Users\\\\Test" }`),
  '{"path":"C:\\\\Users\\\\Test"}'
);

runTest(
  "Minify JSON - unicode string",
  minifyJSON(`{ "emoji": "🔥  🚀" }`),
  '{"emoji":"🔥  🚀"}'
);

/**
 * PRIMITIVES
 */

runTest(
  "Minify JSON - boolean & null",
  minifyJSON(`
    {
      "ok": true,
      "value": null
    }
  `),
  '{"ok":true,"value":null}',
  true
);
