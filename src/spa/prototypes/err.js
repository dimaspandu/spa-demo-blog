"use strict";

/**
 * err(builder, catcher)
 * Register wildcard error reactor ("*").
 */
export function err(builder, catcher) {
  this.pipe["*"] = { context: null, builder: builder, catcher: catcher };
  return this;
};