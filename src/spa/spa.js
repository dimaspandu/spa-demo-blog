"use strict";

import { safeTrimRightSlash } from "./utils.js";

/**
 * Spa constructor
 * options: { baseUrl, dividerPath, hashtag (bool), hostdom (DOM node) }
 *
 * Automatically determines hash mode, dividerPath, and baseUrl for file://, localhost, or domain.
 * Forces hash mode if URL has file extension (like .html, .php, .asp)
 */
export function Spa(options) {
  // normalize options argument to object (ES5-safe)
  options = options || {};

  // detect if running from file:// protocol
  const isFileProtocol = location.protocol === "file:";

  // detect if current URL already contains hash (#)
  const hashInUrl = location.href.indexOf("#") !== -1;

  // detect if URL has a file extension (.html, .php, .asp, etc)
  const fileExtPattern = /\.\w+$/;
  const hasFileExtension = fileExtPattern.test(location.pathname);

  // determine hashtag mode automatically if not provided
  const hashtagOption = typeof options.hashtag === "undefined"
    ? (isFileProtocol || hashInUrl || hasFileExtension)
    : !!options.hashtag;

  // determine baseUrl automatically if not provided
  let baseUrlOption = typeof options.baseUrl === "undefined"
    ? (isFileProtocol ? location.pathname : location.origin)
    : String(options.baseUrl);
  baseUrlOption = safeTrimRightSlash(baseUrlOption);

  // determine dividerPath automatically if not provided
  const dividerPathOption = typeof options.dividerPath === "undefined"
    ? (hashtagOption ? "#" : baseUrlOption)
    : String(options.dividerPath);

  // determine hostdom or fallback to document.body
  const hostdomOption = typeof options.hostdom === "undefined"
    ? document.body
    : options.hostdom;

  // seal options object
  this.options = Object.seal({
    baseUrl: baseUrlOption,
    dividerPath: dividerPathOption,
    hashtag: hashtagOption,
    hostdom: hostdomOption
  });

  // warning: if hashtag disabled and no baseUrl, navigation may fail
  if (!this.options.hashtag && (!this.options.baseUrl || this.options.baseUrl.length === 0)) {
    if (window && window.console && window.console.error) {
      window.console.error(
        "SPA warning: baseUrl not set and hashtag disabled. Navigation may fail."
      );
    }
  }

  // adjust dividerPath when hashtag disabled
  if (!this.options.hashtag && this.options.baseUrl.length > 0) {
    if (this.options.dividerPath !== "#" && this.options.dividerPath !== this.options.baseUrl) {
      if (window && window.console && window.console.warn) {
        window.console.warn(
          "SPA warning: dividerPath should match baseUrl when hashtag is disabled."
        );
      }
    }
    // set dividerPath to baseUrl when hashtag disabled
    this.options.dividerPath = this.options.baseUrl;
  }

  Object.freeze(this);
}