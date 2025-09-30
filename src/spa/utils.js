"use strict";

/**
 * safeTrimRightSlash
 * Remove trailing slash from a string if exists.
 * @param {string} s
 * @return {string}
 */
export function safeTrimRightSlash(s) {
  if (typeof s !== "string") { return s; }
  if (s.length > 0 && s.charAt(s.length - 1) === "/") {
    return s.slice(0, -1);
  }
  return s;
}

/**
 * isFunction
 * @param {*} v
 * @return {boolean}
 */
export function isFunction(v) {
  return typeof v === "function";
}

/**
 * nowrapSetTimeout
 * setTimeout wrapper that calls function preserving the global context (older browsers).
 */
export function nowrapSetTimeout(fn, delay) {
  // ensure fn is function
  if (!isFunction(fn)) { return; }
  return setTimeout(fn, delay);
}
