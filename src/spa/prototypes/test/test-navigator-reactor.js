"use strict";

// Import functions from your implementation
import { reactor } from "../reactor.js";
import { navigator } from "../navigator.js";

// --- Dummy SPA object to act as "this"
const app = {
  pipe: {},
  pipeCache: {}
};

// Bind functions so that "this" refers to app
const reactorBound = reactor.bind(app);
const navigatorBound = navigator.bind(app);

// --- Register some routes
reactorBound("/home", function() {}, null);
reactorBound("/about", function() {}, null);
reactorBound("/search/{q}", function() {}, null);
reactorBound(["/multi/{x}/path/{y}", "/contact"], function() {}, null);

// --- Test helper
function testNavigator(input, expectedPath, expectedParams, expectedQuery) {
  navigatorBound(
    input,
    function(origin, params, query) {
      console.log("[PASS]", input, "→", origin, params, query);

      // Assert path match
      console.assert(origin === expectedPath, "Expected path: " + expectedPath);

      // Assert params match
      console.assert(
        JSON.stringify(params) === JSON.stringify(expectedParams),
        "Expected params: " + JSON.stringify(expectedParams)
      );

      // Assert query match
      console.assert(
        JSON.stringify(query) === JSON.stringify(expectedQuery),
        "Expected query: " + JSON.stringify(expectedQuery)
      );
    },
    function() {
      console.error("[FAIL]", input, "→ reject()");
    }
  );
}

// --- Run test cases
testNavigator("/home", "/home", {}, {});
testNavigator("/about", "/about", {}, {});
testNavigator("/search/hello", "/search/{q}", { q: "hello" }, {});
testNavigator("/search/keyword?lang=id", "/search/{q}", { q: "keyword" }, { lang: "id" });
testNavigator("/multi/123/path/456", "/multi/{x}/path/{y}", { x: "123", y: "456" }, {});
testNavigator("/contact", "/contact", {}, {});
testNavigator("/unknown", "*", {}, {}); // should reject → fallback "*"
