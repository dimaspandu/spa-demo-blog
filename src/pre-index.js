// ------------------------------------------------------
// Global styles (non-module CSS)
// ------------------------------------------------------
import "./globals.css";

// ------------------------------------------------------
// HTML documents
// These are treated as first-class bundle inputs,
// not just static files.
// ------------------------------------------------------
import "./index.html";
import "./pages/404.html";
import "./pages/500.html";
import "./pages/about.html";
import "./pages/index.html";
import "./pages/single.html";

/**
 * Note:
 * - ./index.html is the actual HTML shell served by the server.
 * - ./pages/index.html is a template used by the SPA for the home page.
 */

// ------------------------------------------------------
// Application runtime entry
// ------------------------------------------------------
import application from "./index.js";

/**
 * Retain application entry in the bundle graph.
 *
 * This no-op invocation prevents aggressive tree-shaking
 * or dead-code elimination from removing the SPA runtime
 * when the bundler performs static analysis.
 *
 * The function is intentionally meaningless at runtime
 * but semantically meaningful for the bundler.
 */
(() => application)(application);
