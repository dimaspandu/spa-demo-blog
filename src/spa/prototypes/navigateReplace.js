"use strict";

/**
 * navigateReplace(path)
 * Public API to replace current route.
 */
export function navigateReplace(path) {
  this.notifier.transition();

  if (!this.state.navigateBlocker.works) {
    this.navigateProcess(path, "replace");
  } else {
    const root = this;

    // check every 30ms (instead of 0ms for performance safety)
    const waiting = setInterval(function() {
      if (!root.state.navigateBlocker.works) {
        clearInterval(waiting);
        root.navigateProcess(path, "replace");
      }
    }, 30);

    // safety guard: stop waiting after 1 second
    setTimeout(function() {
      clearInterval(waiting);
    }, 1000);
  }
}
