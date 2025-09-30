/**
 * Injects a CSS string into the document by creating
 * a <style> element and appending it to <head>.
 *
 * @param {string} css - The raw CSS content as a string
 * @returns {HTMLStyleElement} The created <style> element
 *
 * Usage:
 *   import injectStyle from "./helpers/inject-style.js";
 *   injectStyle("body { background: red; }");
 */
export default function injectStyle(css) {
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);
  return style;
}