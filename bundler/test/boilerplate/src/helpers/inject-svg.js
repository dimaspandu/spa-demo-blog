/**
 * Injects an inline SVG string into the DOM at the given selector.
 * This replaces the innerHTML of the selected element with the SVG markup.
 *
 * @param {string} svg - The raw SVG markup as a string
 * @param {string} selector - A CSS selector for the target element
 * @returns {Element|null} The target element (or null if not found)
 *
 * Usage:
 *   import injectSVG from "./helpers/inject-svg.js";
 *   injectSVG("<svg>...</svg>", "#logo");
 */
export default function injectSVG(svg, selector) {
  const el = selector.nodeType ? selector : document.querySelector(selector);
  if (el) {
    el.innerHTML = svg;
  }
  return el;
}