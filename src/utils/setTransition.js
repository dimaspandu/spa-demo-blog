/**
 * Displays a temporary transition indicator on the page.
 *
 * @param {number} duration - Duration in milliseconds before hiding the indicator. Defaults to 1000.
 */
export default function setTransition(duration = 1000) {
  // Get the transition indicator element by its ID
  const transistor = document.getElementById("transistor");

  // If the element does not exist, exit early
  if (!transistor) return;

  // Show the transition indicator
  transistor.style.display = "block";

  // Hide the transition indicator after the given duration
  setTimeout(() => {
    transistor.style.display = "none";
  }, duration);
}
