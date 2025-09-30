/**
 * Set the active navigation link based on the given path
 * @param {string} path - The current route or pathname
 */
export default function setActiveNav(path) {
  // Get all navigation links
  const links = document.querySelectorAll(".header__nav-link");

  // Reset all links to remove the active class
  links.forEach(link => link.classList.remove("header__nav-link--active"));

  // Add active class for home path
  if (path === "" || path === "/" || path === "/home") {
    const homeLink = document.querySelector('.header__nav-link[href="/"]');
    if (homeLink) homeLink.classList.add("header__nav-link--active");
  }

  // Add active class for about path
  else if (path === "/about") {
    const aboutLink = document.querySelector('.header__nav-link[href="/about"]');
    if (aboutLink) aboutLink.classList.add("header__nav-link--active");
  }

  // If no match, links remain without the active class
}
