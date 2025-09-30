"use strict";

/**
 * requestPath()
 * returns the part after dividerPath if present, otherwise full href.
 */
export function requestPath() {
  const href = window.location.href;
  const parts = href.split(this.options.dividerPath);
  return typeof parts[1] !== "undefined" ? parts[1] : parts[0];
}