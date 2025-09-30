"use strict";

/**
 * Utility: monitor waiting state with a timeout
 * If waiting is not cleared within timeoutMs, it will be forced to false
 * and eventTransform will be executed
 */
export function watchWaiting(builder, timeoutMs, intervalMs) {
  if (typeof timeoutMs === "undefined") timeoutMs = 5000;
  if (typeof intervalMs === "undefined") intervalMs = 200;

  var elapsed = 0;
  var timer = setInterval(function() {
    elapsed += intervalMs;
    if (!builder.waiting) {
      // stop watching once waiting is cleared
      clearInterval(timer);
      return;
    }
    if (elapsed >= timeoutMs) {
      // force disable waiting
      builder.waiting = false;
      if (typeof builder.eventTransform === "function") {
        builder.eventTransform();
      }
      clearInterval(timer);
    }
  }, intervalMs);
}
