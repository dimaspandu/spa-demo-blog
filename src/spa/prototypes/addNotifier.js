"use strict";

/**
 * addNotifier(instructions, callback)
 * Attach notifier callbacks for lifecycle events:
 * "transition", "meet", "arrive", "exit", "comeback"
 */
export function addNotifier(instructions, callback) {
  this.notifier[instructions] = callback;
  return this;
}