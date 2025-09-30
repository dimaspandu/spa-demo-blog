"use strict";

import { onIgnitedEventContext } from "./onIgnitedEventContext.js";
import { setFlushingSpa } from "./setFlushingSpa.js";
import { setHistoryStateSpa } from "./setHistoryStateSpa.js";

// -----------------------------------
// Initialization for first tap
// -----------------------------------
/**
 * initNavigationSpa
 * Called when SPA first starts (tap) to initialize the first reactor.
 */
export function initNavigationSpa(spa, context, originPath, params, query) {
  // populate context
  context.params = params || {};
  context.query = query || {};

  // attach context and call user-provided builder
  spa.pipe[originPath].context = context;
  spa.pipe[originPath].builder(context);

  // set first and active reactor states
  spa.state.firstReactor.origin = originPath;
  spa.state.firstReactor.request = spa.originPath();
  spa.state.firstReactor.params = context.params;
  spa.state.firstReactor.query = context.query;

  spa.state.activeReactor.origin = originPath;
  spa.state.activeReactor.request = spa.originPath();
  spa.state.activeReactor.params = context.params;
  spa.state.activeReactor.query = context.query;

  // push journey entry
  spa.state.journey.push({
    origin: originPath,
    request: spa.originPath(),
    method: "push",
    params: context.params,
    query: context.query
  });

  // prepare flush transform to render container
  spa.pipe[originPath].context.builder.flushTransform = function() {
    setFlushingSpa(spa, originPath);
  };

  // update history using replace so initial load doesn't create extra entry
  setHistoryStateSpa(spa, "replace", originPath, spa.originPath());

  // if builder not waiting (no async future), flush immediately
  if (!spa.pipe[originPath].context.builder.waiting) {
    spa.pipe[originPath].context.builder.flushTransform();
  }

  // set event transform to trigger lifecycle events
  spa.pipe[originPath].context.builder.eventTransform = function() {
    // notify meet -> run onMeet -> notify arrive -> run onArrive
    spa.notifier.meet();
    onIgnitedEventContext(spa.pipe[originPath].context.onMeet);
    spa.notifier.arrive();
    onIgnitedEventContext(spa.pipe[originPath].context.onArrive);
  };

  if (!spa.pipe[originPath].context.builder.waiting) {
    spa.pipe[originPath].context.builder.eventTransform();
  }
}
