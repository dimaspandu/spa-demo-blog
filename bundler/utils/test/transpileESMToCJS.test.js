import {
  normalize,
  transpileESMToCJS
} from "../index.js";

/**
 * Run a single test case
 * @param {string} name - test case name
 * @param {string} esmCode - ESM code string
 * @param {string} expectedCJS - Expected CommonJS output
 */
function runTest(name, esmCode, expectedCJS) {
  const cjsCode = normalize(transpileESMToCJS(esmCode));
  const expected = normalize(expectedCJS);

  const pass = cjsCode.trimEnd() === expected.trimEnd();

  console.log(`\n--- Test: ${name} ---`);
  console.log(pass ? "PASS" : "FAIL");
  if (!pass) {
    console.log("\n--- Output ---\n", JSON.stringify(cjsCode.trimEnd()));
    console.log("\n--- Expected ---\n", JSON.stringify(expected.trimEnd()));
  }
}

// --- Test 1: Default + Named Imports/Exports ---
runTest(
  "Default + Named Imports/Exports",
  `
import foo, { a1, a2 } from "./bar.js";
import { x, y } from "./baz.js";

export function baz() {}
export default function qux() {}
export const val = 123;
  `,
  `
const foo = require("./bar.js").default;
const a1 = require("./bar.js").a1;
const a2 = require("./bar.js").a2;
const x = require("./baz.js").x;
const y = require("./baz.js").y;

function baz() {}
function qux() {}
const val = 123;

exports.baz = baz;
exports.default = qux;
exports.val = val;
  `
);

// --- Test 2: Re-export simple ---
runTest(
  "Re-export Simple",
  `
export { lock } from "./lock.js";
  `,
  `
exports.lock = require("./lock.js").lock;
  `
);

// --- Test 3: Re-export with alias ---
runTest(
  "Re-export With Alias",
  `
export { original as alias } from "./mod.js";
  `,
  `
exports.alias = require("./mod.js").original;
  `
);

// --- Test 4: Import named with alias ---
runTest(
  "Import Named With Alias",
  `
import { orig1 as a1, orig2 as a2 } from "./other.js";
console.log(a1, a2);
  `,
  `
const a1 = require("./other.js").orig1;
const a2 = require("./other.js").orig2;
console.log(a1, a2);
  `
);

// --- Test 5: Re-export multiple ---
runTest(
  "Re-export Multiple",
  `
export { a, b as beta, c } from "./module.js";
  `,
  `
exports.a = require("./module.js").a;
exports.beta = require("./module.js").b;
exports.c = require("./module.js").c;
  `
);

// --- Test 6: Named exports list-style ---
runTest(
  "Named Exports List-Style",
  `
function foo() {}
const baz = () => {};
const bar = { value: 1 };

export { foo, baz, bar };
  `,
  `
function foo() {}
const baz = () => {};
const bar = { value: 1 };

exports.foo = foo;
exports.baz = baz;
exports.bar = bar;
  `
);

// --- Test 7: Named exports list-style with alias ---
runTest(
  "Named Exports List-Style With Alias",
  `
function foo() {}
const baz = () => {};
const bar = { value: 1 };

export { foo as f, baz as b, bar as obj };
  `,
  `
function foo() {}
const baz = () => {};
const bar = { value: 1 };

exports.f = foo;
exports.b = baz;
exports.obj = bar;
  `
);

// --- Test 8: Default + Named Exports List-Style ---
runTest(
  "Default + Named Exports List-Style",
  `
function foo() {}
const baz = () => {};
const bar = { value: 1 };

export default function main() {}
export { foo, baz, bar };
  `,
  `
function foo() {}
const baz = () => {};
const bar = { value: 1 };

function main() {}
exports.default = main;
exports.foo = foo;
exports.baz = baz;
exports.bar = bar;
  `
);

// --- Test 9: Side-effect only imports ---
runTest(
  "Side-effect only imports",
  `
import "./global.js";
import "./styles.css";
  `,
  `
require("./global.js");
require("./styles.css");
  `
);

// --- Test 10: Import default only ---
runTest(
  "Import Default Only",
  `
  import rpc from "./rpc.js";
  `,
  `
  const rpc = require("./rpc.js").default;
  `
);

// --- Test 11: Import named only ---
runTest(
  "Import Named Only",
  `
  import { http } from "./rpc.js";
  `,
  `
  const http = require("./rpc.js").http;
  `
);

// --- Test 12: Import named with alias (simple) ---
runTest(
  "Import Named With Alias (Simple)",
  `
  import { http as rpc } from "./rpc.js";
  `,
  `
  const rpc = require("./rpc.js").http;
  `
);

// --- Test 13: Export default function ---
runTest(
  "Export Default Function",
  `
  function getSecretMessage() {};
  export default getSecretMessage;
  `,
  `
  function getSecretMessage() {};
  exports.default = getSecretMessage;
  `
);

// --- Test 14: Dynamic Import ---
runTest(
  "Dynamic Import",
  `
  async function load() {
    const mod = await import("./remote.js");
    return mod.http();
  }
  `,
  `
  async function load() {
    const mod = await require("./remote.js").http();
    return mod.http();
  }
  `
);

// --- Test 15: Dynamic Import (Simple) ---
runTest(
  "Dynamic Import (Simple)",
  `
  import("./remote.js")
  `,
  `
  require("./remote.js").http()
  `
);

// --- Test 15.1: Dynamic Import with .then() ---
runTest(
  "Dynamic Import with .then()",
  `
  import("./remote.js").then()
  `,
  `
  require("./remote.js").http().then()
  `
);

// --- Test 16: Dynamic Import with .http() ---
runTest(
  "Dynamic Import with .http()",
  `
  import("./remote.js").http()
  `,
  `
  require("./remote.js").http()
  `
);

// --- Test 17: Dynamic Import with .http(namespace) ---
runTest(
  "Dynamic Import with .http(namespace)",
  `
  import("./remote.js").http("&/namespace")
  `,
  `
  require("./remote.js").http("&/namespace")
  `
);

// --- Test 17.1: Dynamic Import with .http(namespace) ---
runTest(
  "Dynamic Import with .http(namespace): contd",
  `
  import("http://localhost:4001/resources/rpc.js").http("&/products-service/resources/rpc.js").then()
  `,
  `
  require("http://localhost:4001/resources/rpc.js").http("&/products-service/resources/rpc.js").then()
  `
);

// --- Test 17.2: Dynamic Import with .namespace(namespace) ---
runTest(
  "Dynamic Import with .http(namespace): contd",
  `
  import("http://localhost:4001/resources/rpc.js").namespace("&/products-service/resources/rpc.js").then()
  `,
  `
  require("http://localhost:4001/resources/rpc.js").http("&/products-service/resources/rpc.js").then()
  `
);

// --- Test 18: Dynamic Import with .https() ---
runTest(
  "Dynamic Import with .https()",
  `
  import("./remote.js").https()
  `,
  `
  require("./remote.js").https()
  `
);

// --- Test 19: Dynamic Import with .https(namespace) ---
runTest(
  "Dynamic Import with .https(namespace)",
  `
  import("./remote.js").https("&/namespace")
  `,
  `
  require("./remote.js").https("&/namespace")
  `
);

// --- Test 20: Export Default Anything ---
runTest(
  "Export Default Anything",
  `
  export default greetings = {
    message: "Hello World!"
  };

  export default greetings;

  export default {
    message: "Hello World!"
  };

  export default [1, 2, 3];
  `,
  `
  const greetings = {
    message: "Hello World!"
  };
  exports.default = greetings;

  exports.default = greetings;

  exports.default = {
    message: "Hello World!"
  };

  exports.default = [1, 2, 3];
  `
);

// --- Test 21: Export Default Anything: Cont'd ---
runTest(
  "Export Default Anything: Cont'd",
  `
  export default function() {
    return "anon fn";
  }

  export default class {
    sayHi() { return "hi"; }
  }
  `,
  `
  exports.default = function() {
    return "anon fn";
  };

  exports.default = class {
    sayHi() { return "hi"; }
  };
  `
);

// --- Test 22: Import JSON with import attributes ---
runTest(
  "Import JSON with import attributes",
  `
  import colors from "./colors.json" with { type: "json" };
  `,
  `
  const colors = require("./colors.json").default;
  `
);

// --- Test 23: Import CSS with import attributes ---
runTest(
  "Import CSS with import attributes",
  `
  import sheet from "./styles.css" with { type: "css" };
  `,
  `
  const sheet = require("./styles.css").default;
  `
);

// --- Test 24: Dynamic Import JSON with import attributes ---
runTest(
  "Dynamic Import JSON with import attributes",
  `
  import("./dynamic/colors.json", {
    with: { type: "json" }
  });
  `,
  `
  require("./dynamic/colors.json").http();
  `
);

// --- Test 25: Dynamic Import CSS with import attributes ---
runTest(
  "Dynamic Import CSS with import attributes",
  `
  import("./dynamic/styles.css", {
    with: { type: "css" }
  });
  `,
  `
  require("./dynamic/styles.css").http();
  `
);

