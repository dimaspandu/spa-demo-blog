import importPlus from "../helpers/import-plus.js";
import {
  setPageTitle,
  setActiveNav,
  setAnchorHydration,
  setDefaultScroll,
  setMeta
} from "../utils/index.js";

/**
 * Page builder for the About page
 * - Loads the static HTML template
 * - Initializes dynamic content hydration
 * - Updates page title and navigation state
 */
export default function aboutBuilder(ctx)
{
  // Register builder logic for the About page
  ctx.builder.future(dispose =>
  {
    // Import the CSS for the About page
    import("../styles/about.css", {
      with: { type: "css" }
    })
    .then(({ default: sheet }) => {
      document.adoptedStyleSheets = [
        ...document.adoptedStyleSheets,
        sheet
      ];
    })
    .then(() => {
      // Load the static About page template using importPlus
      importPlus("./pages/about.html").then(html => {
        // Define disposal logic and set the container to render the template
        dispose(() => {
          ctx.container = () => html;
        });
      });
    });
  });

  // Hook executed when the About page becomes active
  ctx.onMeet.set = () =>
  {
    // Update the document title
    setPageTitle("Demo Blog — About");
    
    // Reset the page scroll to the default position when entering this view
    setDefaultScroll();

    // Mark the "About" navigation link as active
    setActiveNav("/about");
    
    // Populate meta tags for SEO and Open Graph
    setMeta({
      title: "Demo Blog — About",
      description: "Demo Blog — About",
      image: "https://avatars.githubusercontent.com/u/3967909?v=4"
    });

    // Dynamically import the module for the about page
    import("../hydrators/about.js").then(({ default: setAboutHydration }) => {
      // Inject and render dynamic About page content
      setAboutHydration();

      // Enable anchor link handling (for navigation within SPA)
      setAnchorHydration();
    });
  };
}