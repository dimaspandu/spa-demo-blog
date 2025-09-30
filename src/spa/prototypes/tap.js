"use strict";

import { Context } from "../helpers/context.js";
import { initNavigationSpa } from "../helpers/initNavigationSpa.js";
import { isFunction } from "../utils.js";
import { setNavigationSpa } from "../helpers/setNavigationSpa.js";

/**
 * tap()
 * Boot the SPA: resolve current path, initialize first reactor and attach onpopstate handler.
 */
export function tap() {
  try {
    const root = this;
    const context = new Context();

    // resolve current location into a reactor and initialize
    this.navigator(
      (this.requestPath().indexOf("?") === -1) ? this.originPath() : this.requestPath(),
      function(originPath, params, query) {
        initNavigationSpa(root, context, originPath, params, query);
      },
      function() {
        // if wildcard error route exists, initialize it
        if (typeof root.pipe["*"] !== "undefined") {
          initNavigationSpa(root, context, "*", {}, {});
          return 1;
        } else {
          if (window && window.console && window.console.error) {
            window.console.error("Handler not found, there is no {spa.err(callback)} pipe cause Spa in hurry.");
          }
          return 0;
        }
      }
    );

    // attach popstate handler (back/forward button)
    window.onpopstate = function(event) {
      try {
        // prevent default behavior where possible
        if (event && event.preventDefault) {
          try { event.preventDefault(); } catch (e) { /* ignore */ }
        }

        root.notifier.transition();

        // if navigateBlocker engaged, decrement queue and maybe disable works
        if (root.state.navigateBlocker.works) {
          root.state.navigateBlocker.queue--;
          if (root.state.navigateBlocker.queue === 1) {
            root.state.navigateBlocker.works = false;
          }
        }

        // check if active reactor has endReactor set
        let endReactor = false;
        try {
          const rawEndReactor = root.pipe[root.state.activeReactor.origin].context.endReactor;

          // If it's a function, call it to get the returned value
          const currentEndReactor = isFunction(rawEndReactor)
            ? rawEndReactor()
            : rawEndReactor;

          // If explicitly false → skip
          // If set to any other truthy value (true, object, etc.) → force end
          endReactor = (currentEndReactor !== null && currentEndReactor !== undefined && currentEndReactor !== false);
        } catch (e) {
          endReactor = false;
        }

        if (endReactor) {
          // force go back one more entry
          try { window.history.go(-1); } catch (e) { /* ignore */ }
        } else {
          // normal pop handling: if popped to previous reactor origin => navigatePop
          if (event && event.state && event.state.origin === root.state.previousReactor.origin) {
            root.navigatePop();
          } else {
            // else treat as a push to the state in event (for forward/back pushes)
            if (!root.state.navigateBlocker.works && event && event.state && event.state.origin) {
              // if pipe for origin exists use its context values where possible
              let ctxParams = {};
              let ctxQuery = {};
              try {
                const pctx = root.pipe[event.state.origin].context;
                ctxParams = pctx === null ? {} : (pctx.params || {});
                ctxQuery = pctx === null ? {} : (pctx.query || {});
              } catch (e) {
                ctxParams = {};
                ctxQuery = {};
              }

              setNavigationSpa(
                root,
                "push",
                event.state.origin,
                event.state.request,
                ctxParams,
                ctxQuery
              );
            }
          }
        }
      } catch (e) {
        if (window && window.console && window.console.error) {
          window.console.error("onpopstate handler error:", e && e.message ? e.message : e);
        }
      }
    };
  } catch (e) {
    if (window && window.console && window.console.error) {
      window.console.error("Spa tap error:", e && e.message ? e.message : e);
    }
  }
  return this;
}