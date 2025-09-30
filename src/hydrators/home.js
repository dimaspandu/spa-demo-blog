import { articles, featuredIds } from "../models/index.js";

/**
 * Hydrates the homepage with dynamic content:
 * - Carousel
 * - Post list
 * - Popular posts
 * - Subscribe button handler
 */
export default function setHomeHydration() {
  // DOM references
  const slidesEl = document.getElementById("slides");
  const dotsEl = document.getElementById("dots");
  const postListEl = document.getElementById("post-list");
  const popularEl = document.getElementById("popular-list");

  let currentSlide = 0;
  let slideTimer;

  /**
   * Build the carousel with featured articles
   */
  function buildCarousel() {
    slidesEl.innerHTML = "";
    dotsEl.innerHTML = "";

    featuredIds.forEach((id, idx) => {
      const article = articles.find(a => a.id === id);

      const slide = document.createElement("div");
      slide.className = "carousel__slide";
      slide.style.backgroundImage = `url(${article.image})`;
      slide.innerHTML = `
        <div class="carousel__slide-meta">
          <h2 style="margin:0">${article.title}</h2>
          <p class="post__excerpt">${article.excerpt}</p>
          <div style="margin-top:10px">
            <a href="/${article.slug}" class="btn">Read more</a>
          </div>
        </div>
      `;
      slidesEl.appendChild(slide);

      const dot = document.createElement("div");
      dot.className = "carousel__dot";
      dot.dataset.index = idx;
      dot.addEventListener("click", () => goToSlide(idx));
      dotsEl.appendChild(dot);
    });

    updateDots(0);
    startSlideTimer();
  }

  /**
   * Update carousel dots and slide position
   * @param {number} index - index of the slide to activate
   */
  function updateDots(index) {
    Array.from(dotsEl.children).forEach((dot, idx) =>
      dot.classList.toggle("carousel__dot--active", idx === index)
    );
    slidesEl.style.transform = `translateX(-${index * 100}%)`;
    currentSlide = index;
  }

  /**
   * Navigate to a specific slide
   * @param {number} index - index of the slide
   */
  function goToSlide(index) {
    updateDots(index);
  }

  /**
   * Start automatic slide rotation
   */
  function startSlideTimer() {
    slideTimer = setInterval(
      () => goToSlide((currentSlide + 1) % featuredIds.length),
      4000
    );
  }

  // Pause auto slide on hover
  slidesEl.parentElement.addEventListener("mouseenter", () =>
    clearInterval(slideTimer)
  );

  // Resume auto slide on mouse leave
  slidesEl.parentElement.addEventListener("mouseleave", startSlideTimer);

  /**
   * Build post list sorted by date
   */
  function buildPostList() {
    postListEl.innerHTML = "";
    const sortedPosts = [...articles].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    sortedPosts.forEach(article => {
      const post = document.createElement("article");
      post.className = "post card";
      post.innerHTML = `
        <img src="${article.image}" alt="${article.title}" class="post__image">
        <div>
          <h3 class="post__title">${article.title}</h3>
          <div class="post__excerpt">${article.excerpt}</div>
          <div class="meta-row">
            <div>${article.author}</div>
          </div>
          <div style="margin-top:10px">
            <a class="btn" href="/${article.slug}">View detail</a>
          </div>
        </div>
      `;
      postListEl.appendChild(post);
    });
  }

  /**
   * Build popular posts section with predefined IDs
   */
  function buildPopular() {
    popularEl.innerHTML = "";
    const popularIds = [4, 2, 5, 1];

    popularIds.slice(0, 5).forEach(id => {
      const article = articles.find(a => a.id === id);
      const li = document.createElement("li");
      li.innerHTML = `
        <a href="/${article.slug}" class="popular__link">
          <img src="${article.image}" class="popular__img" style="width:100px;height:65px;border-radius:8px;object-fit:cover">
          <div class="popular__info">
            <strong class="popular__title" style="display:block">${article.title}</strong>
            <small class="popular__date" style="color:#6b7280">${article.date}</small>
          </div>
        </a>
      `;
      popularEl.appendChild(li);
    });
  }

  /**
   * Handle subscribe button click
   */
  document.getElementById("sub-btn").addEventListener("click", () => {
    const email = document.getElementById("sub-email").value.trim();
    if (!email) return alert("Please enter your email");
    alert("Thanks — this demo does not actually subscribe.");
  });

  // Build homepage sections
  buildCarousel();
  buildPostList();
  buildPopular();
}
