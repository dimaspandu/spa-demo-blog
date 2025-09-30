"use strict";

/**
 * navigator(pathInput, resolve, reject)
 * Resolve a user-request path into originPath, params, query.
 * Calls resolve(originPath, params, query) or reject().
 */
export function navigator(pathInput, resolve, reject) {
  // --- check cache first
  const cached = this.pipeCache[pathInput];
  if (cached) {
    resolve(cached.originPath, cached.params, cached.query);
    return;
  }

  let path = pathInput;
  const params = {};
  const query = {};

  // --- parse query string if any
  const qIndex = pathInput.indexOf("?");
  if (qIndex !== -1) {
    const queryString = pathInput.slice(qIndex + 1).split("&");
    for (let i = 0; i < queryString.length; i++) {
      const pair = queryString[i].split("=");
      const key = pair[0];
      if (key) {
        query[key] = (pair[1] === undefined) ? "" : pair[1];
      }
    }
    path = pathInput.slice(0, qIndex);
  }

  // --- direct match
  if (this.pipe[path]) {
    resolve(path, params, query);
    this.pipeCache[pathInput] = { originPath: path, params: params, query: query };
    return;
  }

  // --- parametric match
  for (const route in this.pipe) {
    if (!this.pipe.hasOwnProperty(route)) {
      continue;
    }
    const def = this.pipe[route];
    if (def.regex) {
      const match = path.match(def.regex);
      if (match) {
        for (let j = 0; j < def.keys.length; j++) {
          params[def.keys[j]] = match[j + 1];
        }
        resolve(route, params, query);
        this.pipeCache[pathInput] = { originPath: route, params: params, query: query };
        return;
      }
    }
  }

  // --- no match found
  reject();
  this.pipeCache[pathInput] = { originPath: "*", params: params, query: query };
}
