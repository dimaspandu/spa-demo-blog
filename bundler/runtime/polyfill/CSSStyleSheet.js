// Polyfill for CSSStyleSheet with replaceSync and replace
(function (global) {
  if (typeof global.CSSStyleSheet === "function" && "replaceSync" in global.CSSStyleSheet.prototype) {
    return;
  }

  function CSSStyleSheet() {
    this._styleEl = document.createElement("style");
    this._styleEl.setAttribute("data-polyfilled", "true");
    document.getElementsByTagName("head")[0].appendChild(this._styleEl);
  }

  CSSStyleSheet.prototype.replaceSync = function (cssText) {
    this._styleEl.styleSheet
      ? (this._styleEl.styleSheet.cssText = cssText || "")
      : (this._styleEl.textContent = cssText || "");
    return this;
  };

  CSSStyleSheet.prototype.replace = function (cssText) {
    var self = this;
    return new Promise(function (resolve) {
      self.replaceSync(cssText);
      resolve(self);
    });
  };

  function defineAdoptedStyleSheets(doc) {
    if (doc.hasOwnProperty("adoptedStyleSheets")) return;
    var adopted = [];
    try {
      Object.defineProperty(doc, "adoptedStyleSheets", {
        get: function () {
          return adopted;
        },
        set: function (sheets) {
          for (var i = 0; i < adopted.length; i++) {
            var old = adopted[i];
            if (old && old._styleEl && old._styleEl.parentNode) {
              old._styleEl.parentNode.removeChild(old._styleEl);
            }
          }
          adopted = sheets || [];
          for (var j = 0; j < adopted.length; j++) {
            if (adopted[j] && adopted[j]._styleEl) {
              document.getElementsByTagName("head")[0].appendChild(adopted[j]._styleEl);
            }
          }
        }
      });
    } catch (e) {
      doc.adoptedStyleSheets = adopted;
    }
  }

  defineAdoptedStyleSheets(document);
  global.CSSStyleSheet = CSSStyleSheet;
})(typeof window !== "undefined" ? window : this);

// Create a new empty stylesheet
const sheet = new CSSStyleSheet();

// Add CSS rules using replace or replaceSync
sheet.replaceSync(`
  .custom {
    color: red;
    font-weight: bold;
  }
`);

// Apply it to the document
document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
