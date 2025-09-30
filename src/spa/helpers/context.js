"use strict";

/**
 * Context
 * Object passed to each reactor. Contains lifecycle hooks and builder helpers.
 */
export function Context() {
  // route params and query data
  this.params = {};
  this.query = {};

  // container: either a DOM node, string, or a function returning either
  this.container = null;

  // builder object handles synchronous/async rendering behavior
  this.builder = Object.seal({
    waiting: false,
    flushTransform: function() {},
    eventTransform: function() {},
    // future(builder) -> marks waiting true, passes dispose callback to user builder
    future: function(builder) {
      const self = this;
      this.waiting = true;
      try {
        builder(function dispose(snapshot) {
          if (typeof snapshot !== "function") {
            snapshot = function() {};
          }
          self.waiting = false;
          try { snapshot(); } catch (e) { /* ignore */ }
          try { self.flushTransform(); } catch (e) { /* ignore */ }
          try { self.eventTransform(); } catch (e) { /* ignore */ }
        });
      } catch (e) {
        // if builder throws immediately, reset waiting
        this.waiting = false;
      }
    }
  });

  /**
   * endReactor flag or function
   * - If set to a function, it will be called when the reactor ends.
   * - If explicitly set to false, it behaves like `window.history.go(-1)`,
   *   effectively navigating back in the browser history when the reactor ends.
   */
  this.endReactor = null;

  // lifecycle event objects. Each contains 'delay' (ms) and 'set' (function)
  this.onMeet = Object.seal({ delay: 0, set: function() {} });
  this.onArrive = Object.seal({ delay: 0, set: function() {} });
  this.onExit = Object.seal({ delay: 0, set: function() {} });
  this.onComeback = Object.seal({ delay: 0, set: function() {} });

  Object.seal(this);
}
