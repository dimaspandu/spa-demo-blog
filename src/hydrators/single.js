import articles from "../models/articles.js";
import setErrorHydration from "./error.js";
import setPageTitle from "../utils/setPageTitle.js";
import setMeta from "../utils/setMeta.js";

export default function setSingleHydration(ctx) {
  // Find the article based on slug parameter from the context
  const article = articles.find(a => a.slug === ctx.params.slug);

  // Handle case when the article is not found
  if (!article) {
    const fallbackMessage = "Demo Blog — Page Not Found";

    // Update the document title to include the article title
    setPageTitle(fallbackMessage);

    // Populate meta tags for SEO and Open Graph
    setMeta({
      title: fallbackMessage,
      description: fallbackMessage,
      image: "https://avatars.githubusercontent.com/u/3967909?v=4"
    });
    
    // Provide the container HTML for the error page
    ctx.setContainer(() => setErrorHydration(404, "Page Not Found"));
  }

  // Update the document title to include the article title
  setPageTitle(`Demo Blog — ${article.title}`);

  // Populate meta tags for SEO and Open Graph
  setMeta(article.slug);

  // Update the main image of the detail page
  document.getElementById("detail-image").className = "post-detail__image";
  document.getElementById("detail-image").src = article.image;

  // Update the article title element
  document.getElementById("detail-title").className = "post-detail__title";
  document.getElementById("detail-title").textContent = article.title;

  // Update metadata (date and author)
  document.getElementById("detail-meta").className = "meta-row";
  document.getElementById("detail-meta").innerHTML = `<div>${article.date}</div><div></div><div>${article.author}</div>`;

  // Insert the article content (currently placeholder content)
  document.getElementById("detail-content").className = "post-detail__content";
  document.getElementById("detail-content").innerHTML = `
    <p>${article.excerpt}</p>
    <p>Full content placeholder for article ID ${article.id}.</p>
  `;

  // Configure social media share links
  document.getElementById("share-twitter").className = "share__link";
  document.getElementById("share-facebook").className = "share__link";
  document.getElementById("share-linkedin").className = "share__link share__link--last";

  const url = location.href;
  document.getElementById("share-twitter").href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(url)}`;
  document.getElementById("share-facebook").href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  document.getElementById("share-linkedin").href = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(article.title)}`;

  // Select related articles based on shared tags (fallback to random articles if fewer than 4 found)
  let related = articles.filter(a => a.id !== article.id && a.tags.some(t => article.tags.includes(t))).slice(0, 4);
  if (related.length < 4) {
    related = related.concat(articles.filter(a => a.id !== article.id).slice(0, 4 - related.length));
  }

  // Render related articles section
  const relatedEl = document.getElementById("related");
  relatedEl.className = "post-detail__related-list";

  related.forEach(a => {
    const card = document.createElement("div");
    card.className = "card card--related";
    card.style.padding = "12px";
    card.innerHTML = `
      <img src="${a.image}" class="post__image" style="width:100%;height:120px;object-fit:cover;border-radius:8px">
      <h4 class="post__title" style="margin:8px 0">${a.title}</h4>
      <div class="post__excerpt">${a.excerpt}</div>
      <div style="margin-top:8px">
        <a class="btn" href="/${a.slug}">Read</a>
      </div>
    `;
    relatedEl.appendChild(card);
  });
}
