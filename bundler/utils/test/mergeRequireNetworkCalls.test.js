import {
  normalize,
  mergeRequireNetworkCalls
} from "../index.js";

// -------------------------
// Example Tests
// -------------------------
function runTest(name, codeInput, expectedOutput) {
  const result = mergeRequireNetworkCalls(codeInput);
  const pass = normalize(result) === normalize(expectedOutput);
  console.log(`\n--- Test: ${name} ---`);
  console.log(pass ? "PASS" : "FAIL");
  if (!pass) {
    console.log("\n--- Output ---\n", JSON.stringify(result));
    console.log("\n--- Expected ---\n", JSON.stringify(expectedOutput));
  }
}

// Tests
runTest(
  "Simple http no args",
  `const x = require("./remote.js").http();`,
  `const x = require("./remote.js/<HTTP>/");`
);

runTest(
  "http with string arg",
  `const mod = require("./remote.js").http("&/namespace");`,
  `const mod = require("./remote.js/<HTTP>/&/namespace");`
);

runTest(
  "http with string arg: contd",
  `require("http://localhost:4001/resources/rpc.js").http("&/products-service/resources/rpc.js").then()`,
  `require("http://localhost:4001/resources/rpc.js/<HTTP>/&/products-service/resources/rpc.js").then()`
);

runTest(
  "https with string arg",
  `require("./remote.js").https("extra");`,
  `require("./remote.js/<HTTPS>/extra");` // will merge string literal correctly
);

runTest(
  "require with variable",
  `require(varName).http("arg")`,
  `require(varName + "/<HTTP>/" + "arg")` // fallback to + for variables
);