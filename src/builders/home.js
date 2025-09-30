import importPlus from "../helpers/import-plus.js";
import {
  setPageTitle,
  setActiveNav,
  setAnchorHydration,
  setDefaultScroll,
  setMeta
} from "../utils/index.js";

/**
 * Home page builder
 * 
 * @param {object} ctx - Page context provided by the router or framework
 * Handles:
 * - Loading home page HTML
 * - Setting up page title
 * - Activating navigation
 * - Hydrating home-specific content
 * - Setting anchor hydration
 */
export default function homeBuilder(ctx)
{
  // Register builder logic for the home page
  ctx.builder.future(dispose =>
  {
    // Import the CSS for the home page
    import("../styles/home.css", {
      with: { type: "css" }
    })
    .then(({ default: sheet }) => {
      document.adoptedStyleSheets = [
        ...document.adoptedStyleSheets,
        sheet
      ];
    })
    .then(() => {
      // Import the static HTML template for the home page
      importPlus("./pages/index.html").then(html => {
        // Define how to dispose and replace the container with new HTML
        dispose(() => {
          ctx.container = () => html;
        });
      });
    });
  });

  // Hook executed when the page is mounted (or becomes active)
  ctx.onMeet.set = () =>
  {
    // Set document title
    setPageTitle("Demo Blog — Home");
    
    // Reset the page scroll to the default position when entering this view
    setDefaultScroll();

    // Mark "Home" navigation as active
    setActiveNav("/");

    // Populate meta tags for SEO and Open Graph
    setMeta({
      title: "Demo Blog — Home",
      description: "Demo Blog — Home",
      image: "https://avatars.githubusercontent.com/u/3967909?v=4"
    });

    // Dynamically import the module for the home page
    import("../hydrators/home.js").then(({ default: setHomeHydration }) => {
      // Hydrate the home page with dynamic content
      setHomeHydration();

      // Enable anchor link handling (for navigation within SPA)
      setAnchorHydration();
    });
  };
}
