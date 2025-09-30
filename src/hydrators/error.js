/**
 * Generates the HTML for an error page.
 *
 * @param {number} statusCode - The HTTP status code to display (default is 404).
 * @param {string} statusMessage - A short message describing the error (default is "Page Not Found").
 * @returns {string} - The HTML string representing the error page.
 */
export default function setErrorHydration(statusCode = 404, statusMessage = "Page Not Found") {
  return (`
    <div class="error-page">
      <div class="error-page__card card">
        <h1 class="error-page__title">${statusCode}</h1>
        <p class="error-page__message">${statusMessage}</p>
        <a href="/" class="error-page__btn btn">Go to Home</a>
      </div>
    </div>
  `);
}
