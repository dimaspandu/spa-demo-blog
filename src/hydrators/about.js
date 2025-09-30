import articles from "../models/articles.js";

/**
 * Hydration function for the About page
 * - Inserts static text about the blog
 * - Displays author profile information
 * - Shows total number of articles
 */
export default function setAboutHydration() {
  // Reference to the About page content container
  const contentEl = document.getElementById("about-content");

  // Author metadata displayed in the profile section
  const author = {
    name: "Dimas Pratama",
    bio: "Writer & Frontend Developer. Passionate about clean code, UX, and accessibility.",
    image: "https://avatars.githubusercontent.com/u/3967909?v=4"
  };

  // Count total articles to display in the description
  const totalArticles = articles.length;

  // HTML template for the About page content
  const html = `
    <div class="about-text">
      <p>This is a minimal demo blog built with plain HTML, CSS, and JavaScript (ES modules).</p>
      <p>It demonstrates a home listing page with a hero carousel, article list, sidebar widgets, and a detail view for each article.</p>
      <p>Currently, there are <strong>${totalArticles}</strong> articles in this demo.</p>
    </div>

    <div class="author-profile card">
      <img src="${author.image}" alt="${author.name}" class="author-profile__img">
      <div class="author-info">
        <h2 class="author-info__name">${author.name}</h2>
        <p class="author-info__role">${author.bio}</p>
      </div>
    </div>
  `;

  // Inject the generated HTML into the page container
  contentEl.innerHTML = html;
}
