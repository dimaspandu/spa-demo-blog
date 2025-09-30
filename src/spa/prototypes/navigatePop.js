"use strict";

import { nowrapSetTimeout } from "../utils.js";
import { onIgnitedEventContext } from "../helpers/onIgnitedEventContext.js";
import { setFlushingSpa } from "../helpers/setFlushingSpa.js";
import { setHistoryStateSpa } from "../helpers/setHistoryStateSpa.js";

/**
 * navigatePop()
 * Called when user navigates backward (popstate). Handles exit lifecycle and comeback.
 */
export function navigatePop() {
  const root = this;

  // flip function executes the actual state transition after onExit is allowed
  const flip = function() {
    // if previous reactor origin differs, we must render its container
    if (root.state.previousReactor.origin !== root.state.activeReactor.origin &&
        root.pipe[root.state.previousReactor.origin]) {
      root.pipe[root.state.previousReactor.origin].context.builder.flushTransform = function() {
        setFlushingSpa(root, root.state.previousReactor.origin);
      };

      if (!root.pipe[root.state.previousReactor.origin].context.builder.waiting) {
        root.pipe[root.state.previousReactor.origin].context.builder.flushTransform();
      }
    }

    // pop journey and update active/previous reactors
    root.state.journey.pop();

    const lastIndex = root.state.journey.length - 1;
    const lastEntry = root.state.journey[lastIndex];

    root.state.activeReactor.origin = lastEntry.origin;
    root.state.activeReactor.request = lastEntry.request;
    root.state.activeReactor.params = lastEntry.params;
    root.state.activeReactor.query = lastEntry.query;

    if (root.state.journey.length === 1) {
      root.state.previousReactor.origin = null;
      root.state.previousReactor.request = null;
      root.state.previousReactor.params = null;
      root.state.previousReactor.query = null;
    } else {
      const prev = root.state.journey[root.state.journey.length - 2];
      root.state.previousReactor.origin = prev.origin;
      root.state.previousReactor.request = prev.request;
      root.state.previousReactor.params = prev.params;
      root.state.previousReactor.query = prev.query;
    }

    // update context params & query and trigger comeback lifecycle
    const activeCtx = root.pipe[root.state.activeReactor.origin].context;
    activeCtx.params = root.state.activeReactor.params;
    activeCtx.query = root.state.activeReactor.query;

    activeCtx.builder.eventTransform = function() {
      root.notifier.meet();
      onIgnitedEventContext(activeCtx.onMeet);
      root.notifier.comeback();
      onIgnitedEventContext(activeCtx.onComeback);
    };

    if (!activeCtx.builder.waiting) {
      activeCtx.builder.eventTransform();
    }
  };

  // call current onExit.set(), if it returns false -> prevent pop
  const onExit = this.pipe[this.state.activeReactor.origin].context.onExit;
  let doExit;
  try {
    doExit = onExit.set();
  } catch (e) {
    doExit = undefined;
  }

  if (typeof doExit === "undefined" || doExit) {
    // allowed to exit
    root.notifier.exit();

    if (onExit.delay === 0) {
      flip();
    } else {
      nowrapSetTimeout(flip, onExit.delay);
    }
  } else {
    // prevented exit: push state back so user remains on same page
    setHistoryStateSpa(this, "push", this.state.activeReactor.origin, this.state.activeReactor.request);

    const ctx = root.pipe[root.state.activeReactor.origin].context;
    ctx.builder.eventTransform = function() {
      root.notifier.meet();
      onIgnitedEventContext(ctx.onMeet);
      root.notifier.arrive();
      onIgnitedEventContext(ctx.onArrive);
    };

    if (!ctx.builder.waiting) {
      ctx.builder.eventTransform();
    }
  }
}