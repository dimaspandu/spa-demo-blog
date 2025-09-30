"use strict";

/**
 * navigateClear()
 * Clear browser history entries created by SPA and reset journey stack to current active.
 * This uses history.back() repeatedly. Works best in modern browsers but falls back safely.
 */
export function navigateClear() {
  // set navigate blocker to queue length (we'll decrease it on pop)
  this.state.navigateBlocker.queue = this.state.journey.length;
  this.state.navigateBlocker.works = true;

  // store firstReactor as the current active
  this.state.firstReactor.origin = this.state.activeReactor.origin;
  this.state.firstReactor.request = this.state.activeReactor.request;
  this.state.firstReactor.params = this.state.activeReactor.params;
  this.state.firstReactor.query = this.state.activeReactor.query;

  // reset previous reactor
  this.state.previousReactor.origin = null;
  this.state.previousReactor.request = null;
  this.state.previousReactor.params = {};
  this.state.previousReactor.query = {};

  // go back in history for all but the first item
  for (let i = this.state.journey.length - 1; i >= 1; i--) {
    try {
      window.history.back();
    } catch (e) {
      /* ignore */
    }
  }

  // reset journey to single current active entry
  this.state.journey = [{
    origin: this.state.activeReactor.origin,
    request: this.state.activeReactor.request,
    params: this.state.activeReactor.params,
    query: this.state.activeReactor.query
  }];

  // replace current to ensure consistent state
  this.navigateReplace(this.state.journey[0].request);
}