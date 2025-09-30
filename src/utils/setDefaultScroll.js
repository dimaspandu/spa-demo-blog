// This utility resets the window scroll position to the default state.
// By default, it scrolls to the top-left corner instantly.
// If smooth behavior is preferred, change "instant" to "smooth".
export default function setDefaultScroll() {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "instant"
  });
}
