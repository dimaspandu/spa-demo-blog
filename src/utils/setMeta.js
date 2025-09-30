import articles from "../models/articles.js";

/**
 * Set meta tags dynamically
 * @param {string|object} arg - If string, treat as article slug. If object, treat as custom meta.
 *   Custom object example: { title: "Home", description: "Welcome to our site", image: "/img/home.jpg" }
 */
export default function setMeta(arg) {
  let title = "";
  let description = "";
  let image = "";

  if (typeof arg === "string") {
    // Find article by slug
    const article = articles.find((a) => a.slug === arg);
    if (!article) {
      console.warn("Article not found for slug:", arg);
      return;
    }
    title = article.title;
    description = article.excerpt;
    image = article.image;
  } else if (typeof arg === "object" && arg !== null) {
    // Use custom meta
    title = arg.title || "";
    description = arg.description || "";
    image = arg.image || "";
  } else {
    console.warn("Invalid argument passed to setMeta:", arg);
    return;
  }

  // Populate description
  const descriptionMeta = document.querySelector('meta[name="description"]');
  if (descriptionMeta) descriptionMeta.setAttribute("content", description);

  // Populate Open Graph title
  const ogTitleMeta = document.querySelector('meta[property="og:title"]');
  if (ogTitleMeta) ogTitleMeta.setAttribute("content", title);

  // Populate Open Graph description
  const ogDescMeta = document.querySelector('meta[property="og:description"]');
  if (ogDescMeta) ogDescMeta.setAttribute("content", description);

  // Populate Open Graph image
  const ogImageMeta = document.querySelector('meta[property="og:image"]');
  if (ogImageMeta) ogImageMeta.setAttribute("content", image);
}
