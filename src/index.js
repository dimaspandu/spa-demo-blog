import app from "./app.js";
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
 *
 * `app.reactor` registers routes:
 *   - First argument: route path(s)
 *   - Second argument: builder function that renders the view
 *   - Third argument (optional): error handler in case of failure
 *
 * `app.err` registers a fallback when no routes are matched.
 */

/**
 * --- Home reactor ---
 * Defines the entry points for the home page.
 * Matches three possible routes: "", "/", and "/home".
 * When any of these paths are visited, the `homeBuilder` is executed
 * to inject the home page template and logic into the app container.
 * 
 * If something fails while building the home page,
 * `error500Builder` will be called to render a server error page.
 */
app.reactor(["", "/", "/home"], homeBuilder, error500Builder);

/**
 * --- About reactor ---
 * Registers the "/about" route.
 * Visiting this path will call `aboutBuilder`, which renders the "About" page.
 * If rendering fails, `error500Builder` provides a graceful fallback.
 */
app.reactor("/about", aboutBuilder, error500Builder);

/**
 * --- Single reactor ---
 * Registers the dynamic "single" route.
 * The syntax `/{slug}` means this route can match any path like "/article-123".
 * Example: "/hello-world" will call the `singleBuilder` with a context
 * containing `{ slug: "hello-world" }`.
 * 
 * If rendering fails, `error500Builder` provides a graceful fallback.
 */
app.reactor("/{slug}", singleBuilder, error500Builder);

/**
 * --- Error reactor ---
 * Handles cases when no registered route matches the requested path.
 * For example, navigating to "/does-not-exist" will call `error404Builder`,
 * which typically shows a "404 Not Found" page.
 */
app.err(error404Builder);

/**
 * --------------------------------------------------------------
 * APP NOTIFIERS
 * --------------------------------------------------------------
 * Notifiers are hooks that can be triggered during app lifecycle events
 * (like transitions or page loads). They allow adding visual effects
 * or executing logic automatically when certain conditions are met.
 */

/**
 * --- Transition notifier ---
 * Adds a notifier named "transition".
 * When triggered, it uses `setTransition` to show a visual indicator
 * (the element with id="transistor") for 1 second.
 * This is useful to provide feedback while navigating between routes.
 */
app.addNotifier("transition", setTransition);

/**
 * --- Page load notifier ---
 * Adds another notifier named "meet".
 * This also calls `setTransition`, but here it ensures the transition element
 * is hidden once the new page is ready.
 * 
 * Together with the "transition" notifier, this creates a smooth UX:
 * - "transition": show indicator when route changes
 * - "meet": hide indicator after content is loaded
 */
app.addNotifier("meet", setTransition);

/**
 * --------------------------------------------------------------
 * APP START
 * --------------------------------------------------------------
 * Finally, start the application routing.
 * Calling `app.tap()` initializes the system, binds all the reactors
 * and notifiers, and makes the SPA ready to handle navigation.
 */
app.tap();
