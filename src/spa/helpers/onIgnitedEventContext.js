"use strict";

import { nowrapSetTimeout } from "../utils.js";

/**
 * onIgnitedEventContext
 * Execute lifecycle event's setter with delay behavior.
 * The event object must have properties: delay (number) and set (function).
 */
export function onIgnitedEventContext(onEvent) {
  try {
    if (!onEvent) { return; }
    if (onEvent.delay === 0) {
      // immediate
      onEvent.set();
    } else {
      // delayed
      nowrapSetTimeout(onEvent.set, onEvent.delay);
    }
  } catch (e) {
    // swallow to avoid breaking navigation flow
    /* eslint-disable no-console */
    if (window && window.console && window.console.error) {
      window.console.error("onIgnitedEventContext error:", e && e.message ? e.message : e);
    }
    /* eslint-enable no-console */
  }
}
