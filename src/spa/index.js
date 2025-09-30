/**
 * @license JS+ (SPA) v2.0.2 (ESM portable)
 * jsplus/spa/2.0.2/src/index.js
 *
 * Rewritten to be ESM-portable.
 *
 * Copyright (c) dimaspandu
 * Licensed under MIT
 */

"use strict";

import {
  addNotifier,
  err,
  navigateClear,
  navigatePop,
  navigateProcess,
  navigatePush,
  navigateReplace,
  navigator,
  originPath,
  reactor,
  requestPath,
  tap
} from "./prototypes/index.js";
import { Spa } from "./spa.js";

/**
 * requestPath()
 * returns the part after dividerPath if present, otherwise full href.
 */
Spa.prototype.requestPath = requestPath;

/**
 * originPath()
 * returns request path without query string. If path equals full href length, returns "/"
 */
Spa.prototype.originPath = originPath;

// pipes and caches
Spa.prototype.pipe = {};
Spa.prototype.pipeCache = {};

// state object (sealed)
Spa.prototype.state = Object.seal({
  firstReactor: Object.seal({ origin: null, request: null, params: {}, query: {} }),
  previousReactor: Object.seal({ origin: null, request: null, params: {}, query: {} }),
  activeReactor: Object.seal({ origin: null, request: null, params: {}, query: {} }),
  journey: [],
  navigateBlocker: { queue: 0, works: false }
});

// notifier hooks (no-op by default)
Spa.prototype.notifier = Object.seal({
  transition: function() {},
  meet: function() {},
  arrive: function() {},
  exit: function() {},
  comeback: function() {}
});

/**
 * reactor(path, builder, catcher)
 * Register a reactor (route). 'path' can be string or array of strings.
 * builder(ctx) should populate ctx.container, ctx.builder.future(...), ctx.onMeet, etc.
 */
Spa.prototype.reactor = reactor;

/**
 * err(builder, catcher)
 * Register wildcard error reactor ("*").
 */
Spa.prototype.err = err;

/**
 * navigator(pathInput, resolve, reject)
 * Resolve a user-request path into originPath, params, query. Calls resolve(originPath, params, query) or reject().
 */
Spa.prototype.navigator = navigator;

/**
 * navigateProcess(path, method)
 * Main driver: if cached, use cache; otherwise resolve via navigator.
 */
Spa.prototype.navigateProcess = navigateProcess;

/**
 * navigatePush(path)
 * Public API to push a new route.
 */
Spa.prototype.navigatePush = navigatePush;

/**
 * navigateReplace(path)
 * Public API to replace current route.
 */
Spa.prototype.navigateReplace = navigateReplace;

/**
 * navigateClear()
 * Clear browser history entries created by SPA and reset journey stack to current active.
 * This uses history.back() repeatedly. Works best in modern browsers but falls back safely.
 */
Spa.prototype.navigateClear = navigateClear;

/**
 * navigatePop()
 * Called when user navigates backward (popstate). Handles exit lifecycle and comeback.
 */
Spa.prototype.navigatePop = navigatePop;

/**
 * addNotifier(instructions, callback)
 * Attach notifier callbacks for lifecycle events:
 * "transition", "meet", "arrive", "exit", "comeback"
 */
Spa.prototype.addNotifier = addNotifier;

/**
 * tap()
 * Boot the SPA: resolve current path, initialize first reactor and attach onpopstate handler.
 */
Spa.prototype.tap = tap;

export default Spa;