"use strict";

import { Context } from "./context.js";
import { onIgnitedEventContext } from "./onIgnitedEventContext.js";
import { setFlushingSpa } from "./setFlushingSpa.js";
import { watchWaiting } from "./watchWaiting.js";

/**
 * setNavigationSpa
 * Centralized navigation handling for push/replace requests.
 */
export function setNavigationSpa(spa, method, originPath, requestPath, params, query) {
  // if error wildcard and not registered -> log and return
  if (originPath === "*" && typeof spa.pipe["*"] === "undefined") {
    if (window && window.console && window.console.error) {
      window.console.error("Handler not found, there is no {spa.err(callback)} pipe cause Spa in hurry.");
    }
    return 0;
  }

  const pipe = spa.pipe[originPath];

  // ensure context is created
  if (pipe.context === null) {
    const context = new Context();
    context.params = params || {};
    context.query = query || {};
    pipe.context = context;
    pipe.builder(context);
  } else {
    pipe.context.params = params || {};
    pipe.context.query = query || {};
  }

  // If origin changed (navigating to different reactor), set flush
  if (originPath !== spa.state.activeReactor.origin) {
    pipe.context.builder.flushTransform = function() {
      setFlushingSpa(spa, originPath);
    };

    if (!pipe.context.builder.waiting) {
      pipe.context.builder.flushTransform();
    }
  }

  // Save previous reactor unless replacing
  if (method !== "replace") {
    spa.state.previousReactor.origin = spa.state.activeReactor.origin;
    spa.state.previousReactor.request = spa.state.activeReactor.request;
    spa.state.previousReactor.params = spa.state.activeReactor.params;
    spa.state.previousReactor.query = spa.state.activeReactor.query;
  }

  // update active reactor info
  spa.state.activeReactor.origin = originPath;
  spa.state.activeReactor.request = requestPath;
  spa.state.activeReactor.params = params || {};
  spa.state.activeReactor.query = query || {};

  // Update journey stack
  if (method === "replace") {
    const journeyLastIndex = spa.state.journey.length - 1;
    if (journeyLastIndex >= 0) {
      spa.state.journey[journeyLastIndex].origin = originPath;
      spa.state.journey[journeyLastIndex].request = requestPath;
      spa.state.journey[journeyLastIndex].method = method;
      spa.state.journey[journeyLastIndex].params = params || {};
      spa.state.journey[journeyLastIndex].query = query || {};
    } else {
      // fallback to pushing a new entry
      spa.state.journey.push({
        origin: originPath,
        request: requestPath,
        method: method,
        params: params || {},
        query: query || {}
      });
    }
  } else {
    spa.state.journey.push({
      origin: originPath,
      request: requestPath,
      method: method,
      params: params || {},
      query: query || {}
    });
  }

  // prepare event transform (meet/arrive handlers)
  pipe.context.builder.eventTransform = function() {
    spa.notifier.meet();
    onIgnitedEventContext(pipe.context.onMeet);
    spa.notifier.arrive();
    onIgnitedEventContext(pipe.context.onArrive);

    // If container not provided and origin is not wildcard, use catcher or fallback content
    if (originPath !== "*" && pipe.context.container === null) {
      if (typeof pipe.catcher === "undefined") {
        try {
          spa.options.hostdom.innerHTML =
            "<div style=\"height: 100vh; padding: 20px; width: 100%;\">" +
              "<h1 style=\"font-size: 5rem; line-height: 1;\">Blank Screen</h1>" +
              "<p style=\"color: #585858; font-size: 2rem; margin-top: 8px;\">No reactor catcher.</p>" +
              "<span style=\"color: #11a3c4; display: block; font-size: 2rem; font-weight: bold; margin-top: 8px; text-decoration: underline;\" onclick=\"window.history.back();\">BACK</span>" +
            "</div>";
        } catch (e) {
          // ignore DOM errors
        }
      } else {
        pipe.catcher(pipe.context);
        setFlushingSpa(spa, originPath);
      }
    }
  };

  if (!pipe.context.builder.waiting) {
    // execute immediately if not waiting
    pipe.context.builder.eventTransform();
  } else {
    // watch waiting state with a timeout (default 8000ms, can be overridden in options)
    watchWaiting(pipe.context.builder, spa.options.waitingTimeout || 8000);
  }
}