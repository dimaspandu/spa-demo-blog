"use strict";

/**
 * navigatePush(path)
 * Public API to push a new route.
 */
export function navigatePush(path) {
  this.notifier.transition();

  if (!this.state.navigateBlocker.works) {
    this.navigateProcess(path, "push");
  } else {
    const root = this;

    // check every 30ms (instead of 0ms for performance safety)
    const waiting = setInterval(function() {
      if (!root.state.navigateBlocker.works) {
        clearInterval(waiting);
        root.navigateProcess(path, "push");
      }
    }, 30);

    // safety guard: stop waiting after 1 second
    setTimeout(function() {
      clearInterval(waiting);
    }, 1000);
  }
}
