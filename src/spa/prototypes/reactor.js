"use strict";

/**
 * reactor(path, builder, catcher)
 * Register a reactor (route).
 * 'path' can be string or array of strings.
 * builder(ctx) should populate ctx.container, ctx.builder.future(...), ctx.onMeet, etc.
 */
export function reactor(path, builder, catcher) {
  const self = this;

  function compilePattern(route) {
    if (route.indexOf("{") === -1) {
      return null;
    }

    const keys = [];
    const regexString = route
      .split("/")
      .map(function(seg) {
        if (seg.charAt(0) === "{" && seg.charAt(seg.length - 1) === "}") {
          keys.push(seg.slice(1, -1));
          return "([^/]+)";
        }
        return seg;
      })
      .join("/");

    return { regex: new RegExp("^" + regexString + "$"), keys: keys };
  }

  function registerSingle(p) {
    const compiled = compilePattern(p);
    self.pipe[p] = {
      context: null,
      builder: builder,
      catcher: catcher,
      regex: compiled ? compiled.regex : null,
      keys: compiled ? compiled.keys : []
    };
  }

  if (Object.prototype.toString.call(path) === "[object Array]") {
    for (let i = 0; i < path.length; i++) {
      registerSingle(path[i]);
    }
  } else {
    registerSingle(path);
  }

  return this;
}
