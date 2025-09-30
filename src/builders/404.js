import setErrorHydration from "../hydrators/error.js";
import {
  setPageTitle,
  setActiveNav,
  setAnchorHydration,
  setDefaultScroll,
  setMeta
} from "../utils/index.js";

/**
 * Builder for the 404 Page Not Found error page.
 *
 * @param {object} ctx - Context object provided by the router.
 */
export default function error404Builder(ctx)
{
  // Define the message for a 404 error
  const statusMessage = "Page Not Found";

  // Provide the container HTML for the error page
  ctx.container = () => setErrorHydration(404, statusMessage);

  // Hook executed when the error page is mounted
  ctx.onMeet.set = () =>
  {
    // Update the browser tab title
    setPageTitle(`Demo Blog - ${statusMessage}`);
    
    // Populate meta tags for SEO and Open Graph
    setMeta({
      title: `Demo Blog - ${statusMessage}`,
      description: `Demo Blog - ${statusMessage}`,
      image: "https://avatars.githubusercontent.com/u/3967909?v=4"
    });
        
    // Reset the page scroll to the default position when entering this view
    setDefaultScroll();

    // Reset navigation state (no link should be active)
    setActiveNav("*");

    // Enable anchor navigation handling for SPA behavior
    setAnchorHydration();
  };
}
