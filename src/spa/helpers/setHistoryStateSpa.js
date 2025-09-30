"use strict";

/**
 * setHistoryStateSpa
 * Push/replace history state in a consistent manner for hashtag or non-hashtag mode.
 * Logic:
 * 1. Always check cache for query string of the requested path.
 * 2. If not found, and the request is the same route as the active reactor,
 *    reuse activeReactor.query (so query does not get lost on refresh).
 * 3. Otherwise, no query is attached.
 */
export function setHistoryStateSpa(spa, method, originPath, requestPath) {
  // Resolve base path depending on hashtag mode
  const basePath = spa.options.hashtag
    ? window.location.pathname + spa.options.dividerPath
    : spa.options.baseUrl + "";

  // Retrieve query: prefer cache, fallback to activeReactor (same route only)
  let query = {};
  if (typeof spa.pipeCache[requestPath] !== "undefined") {
    query = spa.pipeCache[requestPath].query || {};
  } else if (
    originPath === spa.state.activeReactor.origin &&
    requestPath === spa.state.activeReactor.request &&
    spa.state.activeReactor.query
  ) {
    query = spa.state.activeReactor.query;
  }

  // Build query string from key-value pairs
  let qs = "";
  for (const key in query) {
    if (query.hasOwnProperty(key)) {
      qs += (qs.length === 0 ? "?" : "&") +
        encodeURIComponent(key) + "=" + encodeURIComponent(query[key]);
    }
  }

  // Decide which path to use in the final URL:
  // - If query string exists and requestPath already contains it,
  //   fall back to originPath to avoid duplication.
  // - Otherwise, use requestPath directly.
  const req = (function () {
    if (qs.length > 0 && requestPath !== originPath) {
      return originPath;
    }
    return requestPath;
  }());

  // Compose final URL
  const url = basePath + req + qs;
  const stateObj = { origin: originPath, request: requestPath };

  // Apply history state change
  if (method === "replace" &&
      window.history &&
      typeof window.history.replaceState === "function") {
    window.history.replaceState(stateObj, null, url);
  } else if (window.history &&
             typeof window.history.pushState === "function") {
    window.history.pushState(stateObj, null, url);
  } else {
    // Fallback for very old browsers
    try {
      window.location.href = url;
    } catch (e) {
      /* ignore */
    }
  }
}
