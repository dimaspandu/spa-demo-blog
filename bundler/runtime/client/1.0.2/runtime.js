(function(GlobalConstructor, modules, entry) {
  var __modules__ = {};
  var __modulePointer__ = {};
  var __asyncModulePointer__ = {};

  // Extract host or base path from current window URL
  function getHostFromCurrentUrl() {
    var href = window.location.href;
    var clean = href.split(/[?#]/)[0];
    var parts = clean.split("/");
    var lastPart = parts[parts.length - 1];

    if (lastPart && lastPart.indexOf(".") > -1) {
      // If last part is a file, remove it
      parts.pop();
      return parts.join("/");
    } else {
      // Extract origin (protocol + host + port)
      var originMatch = clean.match(/^(https?:\/\/[^/]+)/i);
      return originMatch ? originMatch[1] : clean;
    }
  }

  // Get file extension from an id string
  function getExt(id) {
    var parts = id.split(".");
    return parts.length > 1 ? "." + parts.pop() : "";
  }

  // Ensure file path ends with .js
  function ensureJsExtension(outputFilePath) {
    var clean = outputFilePath.split(/[?#]/)[0];
    var parts = clean.split("/");
    var last = parts[parts.length - 1];

    if (last.indexOf(".") > -1) {
      last = last.replace(/\.[^.]+$/, ".js");
    } else {
      last = last + ".js";
    }
    parts[parts.length - 1] = last;
    return parts.join("/");
  }

  // The `registry` function registers modules into the global `__modules__` object
  // It checks if the module is already registered, and if not, it adds the module to `__modules__`
  function registry(modules) {
    // Iterate through each module in the 'modules' object using a traditional 'for...in' loop
    for (var key in modules) {
      // Ensure that the property is a direct property of 'modules', not inherited from its prototype
      if (modules.hasOwnProperty(key)) {
        // Check if the module with the given key is not already registered in __modules__
        if (!__modules__[key]) {
          // If not already registered, add it to __modules__ with the corresponding module value
          __modules__[key] = modules[key];
        }
      }
    }
  }

  // Load script asynchronously and return a Promise-like object
  function RequireAsynchronously(idAsAPath, namespace) {
    var actualPath = idAsAPath.replace("&", getHostFromCurrentUrl());

    var scriptLoader = document.createElement("script");
    scriptLoader.setAttribute("src", ensureJsExtension(actualPath));
    var head = document.head || document.getElementsByTagName("head")[0];
    head.appendChild(scriptLoader);

    var moduleId = namespace ? namespace : idAsAPath;

    if (typeof Promise !== "undefined") {
      // Promise-based async loading
      return new Promise(function(resolve, reject) {
        scriptLoader.onload = function() {
          resolve(__modulePointer__[moduleId].exports);
        };
        scriptLoader.onerror = function(err) {
          reject(err);
        };
      });
    } else {
      // Fallback for browsers without Promise
      this.then = function(resolve) {
        scriptLoader.onload = function() {
          resolve(__modulePointer__[moduleId].exports);
        };
        return this;
      };
      this["catch"] = function(reject) {
        scriptLoader.onerror = reject;
        return this;
      };
    }
  }

  // Main require function to load modules synchronously or asynchronously
  function require(id) {
    if (!id) return;

    var asynchronously = id.indexOf("<HTTP>") !== -1 || id.indexOf("<HTTPS>") !== -1;

    if (asynchronously) {
      // Asynchronous module loading
      var separator = null;
      if (id.indexOf("<HTTP>") !== -1) {
        separator = "/<HTTP>";
      } else if (id.indexOf("<HTTPS>") !== -1) {
        separator = "/<HTTPS>";
      }

      var isExternalUrl = /^https?:\/\//.test(id);
      var actualId = id.split(separator)[0];
      var namespace = id.split(separator)[1].substring(1);
      var moduleId = actualId + namespace;

      // Reuse existing async module if already loaded
      if (__asyncModulePointer__[moduleId]) {
        return __asyncModulePointer__[moduleId];
      }

      var requireAsynchronously = null;
      var hasANamespace = namespace.length > 0;

      if (isExternalUrl && hasANamespace) {
        requireAsynchronously = new RequireAsynchronously(actualId, namespace);
      } else {
        requireAsynchronously = new RequireAsynchronously(actualId);
      }

      __asyncModulePointer__[moduleId] = requireAsynchronously;
      return requireAsynchronously;
    }

    // Handle synchronous modules
    var ext = getExt(id);
    if (!(ext === ".js" || ext === ".mjs" || ext === ".json" || ext === ".css" || ext === ".svg" || ext === ".xml" || ext === ".html")) {
      return;
    }

    // Return already cached module if available
    if (__modulePointer__[id]) {
      return __modulePointer__[id].exports;
    }

    // Retrieve module definition
    var moduleData = __modules__[id];
    if (!moduleData) {
      throw new Error("Module not found: " + id);
    }

    var fn = moduleData[0];
    var mapping = moduleData[1];

    // Local require function for module mapping
    function localRequire(name) {
      return require(mapping[name]);
    }

    // Initialize module object
    var module = { exports: {} };
    __modulePointer__[id] = module;

    // Execute module function
    fn(localRequire, module.exports, module);
    return module.exports;
  }

  // Start registering modules
  registry(modules);

  // Start execution from entry module
  require(entry);

  GlobalConstructor.prototype["*pointers"] = function(address) {
    if (address === "&registry") {
      return registry;
    } else if (address === "&require") {
      return require;
    }
    return null;
  }; 
})(
  typeof window !== "undefined" ? Window : this,
  {
    // Entry module
    "&/entry.js": [
      function(require, exports, module) {
        var greetings = require("./greetings.js").default;
        console.log("[GREETINGS]:", greetings);
        
        require("./dynamic/colors.json/<HTTP>/").then(function(colors) {
          console.log("[DYNAMIC/COLORS]:", colors.default);
        });

        require("./dynamic/styles.css/<HTTP>/").then(function(styles) {
          console.log("[DYNAMIC/STYLES]:", styles.default);
        });
      },
      {
        "./greetings.js": "&/greetings.js",
        "./dynamic/colors.json/<HTTP>/": "&/dynamic/colors.json/<HTTP>/",
        "./dynamic/styles.css/<HTTP>/":"&/dynamic/styles.css/<HTTP>"
      }
    ],
    // Greetings module
    "&/greetings.js": [
      function(require, exports, module) {
        exports["default"] = "Hello, World!";
      },
      {}
    ]
  },
  "&/entry.js"
);
