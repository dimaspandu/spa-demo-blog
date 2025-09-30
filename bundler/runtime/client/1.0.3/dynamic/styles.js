(function(global, modules, entry) {
  global["*pointers"]("&registry")(modules);
  global["*pointers"]("&require")(entry);
})(
  typeof window !== "undefined" ? window : this,
  {
    "&/dynamic/styles.css": [
      function(require, exports, module) {
        var raw = (`
          :root {
            --accent: #2563eb;
          }

          body {
            font-family: sans-serif;
            background: #f6f7fb;
            padding: 20px;
          }

          h1 {
            color: var(--accent);
          }

          p.styled {
            color: #10b981;
            font-weight: bold;
          }
        `);

        if (typeof CSSStyleSheet === "undefined") {
          exports.default = raw;
        } else {
          var sheet = new CSSStyleSheet();
          sheet.replaceSync(raw);
          exports.default = sheet;
        }
      },
      {}
    ]
  },
  "&/dynamic/styles.css"
);
