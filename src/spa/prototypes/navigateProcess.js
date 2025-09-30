"use strict";

import { setHistoryStateSpa } from "../helpers/setHistoryStateSpa.js";
import { setNavigationSpa } from "../helpers/setNavigationSpa.js";

/**
 * navigateProcess(path, method)
 * Main driver: if cached, use cache; otherwise resolve via navigator.
 */
export function navigateProcess(path, method) {
  const root = this;

  if (typeof this.pipeCache[path] !== "undefined") {
    const cp = this.pipeCache[path];
    setHistoryStateSpa(root, method, cp.originPath, path);
    setNavigationSpa(root, method, cp.originPath, path, cp.params, cp.query);
  } else {
    this.navigator(
      path,
      function(originPath, params, query) {
        setHistoryStateSpa(root, method, originPath, path);
        setNavigationSpa(root, method, originPath, path, params, query);
      },
      function() {
        setHistoryStateSpa(root, method, "*", path);
        setNavigationSpa(root, method, "*", path, {}, {});
      }
    );
  }
}