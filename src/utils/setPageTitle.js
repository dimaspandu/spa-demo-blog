/**
 * Update the document title in the browser tab
 * @param {string} title - The new title to be set (default is an empty string)
 */
export default function setPageTitle(title = "") {
  // Assign the given title to the document.title property
  // This changes the text displayed in the browser tab
  document.title = title;
}
