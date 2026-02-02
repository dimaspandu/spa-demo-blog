import { app } from "./app.js";
import {
  aboutBuilder,
  error404Builder,
  error500Builder,
  homeBuilder,
  singleBuilder
} from "./builders/index.js";
import setTransition from "./utils/setTransition.js";

/**
 * --------------------------------------------------------------
 * ROUTE CONFIGURATION
 * --------------------------------------------------------------
 * The following section defines how the SPA (Single Page Application)
 * should respond when the user navigates to different URLs.
 */

/**
 * --- Home reactor ---
 */
app.reactor(["", "/", "/home"], homeBuilder, error500Builder);

/**
 * --- About reactor ---
 */
app.reactor("/about", aboutBuilder, error500Builder);

/**
 * --- Single reactor ---
 */
app.reactor("/{slug}", singleBuilder, error500Builder);

/**
 * --- Error reactor ---
 */
app.err(error404Builder);

/**
 * --------------------------------------------------------------
 * APP NOTIFIERS
 * --------------------------------------------------------------
 * Notifiers are hooks that can be triggered during app lifecycle events.
 */

/**
 * --- Transition notifier ---
 */
app.addNotifier("transition", setTransition);

/**
 * --- Page load notifier ---
 */
app.addNotifier("meet", setTransition);

/**
 * --------------------------------------------------------------
 * APP START
 * --------------------------------------------------------------
 * app.tap() is called here to start the SPA after all routes and notifiers
 * have been registered.
 */
app.tap();

const application = app;
export default application;
