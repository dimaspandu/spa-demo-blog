"use strict";

/**
 * originPath()
 * returns request path without query string. If path equals full href length, returns "/"
 */
export function originPath() {
  const req = this.requestPath();
  let origin = req.indexOf("?") === -1 ? req : req.split("?")[0];
  if (origin.length === window.location.href.length) {
    origin = "/";
  }
  return origin;
}