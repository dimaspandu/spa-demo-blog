/**
 * ensureJsExtension()
 * -------------------
 * Ensures that the given file path ends with a `.js` extension.
 * If the file already has an extension, it will be replaced with `.js`.
 * If the file has no extension, `.js` will be appended.
 *
 * @param {string} outputFilePath - The original file path which may or may not have an extension.
 * @returns {string} - The normalized file path that always ends with `.js`.
 */
export default function ensureJsExtension(outputFilePath) {
  // Remove query parameters or fragments (#, ?) from the path
  const clean = outputFilePath.split(/[?#]/)[0];

  // Split the cleaned path into parts by "/"
  const parts = clean.split("/");

  // Get the last part of the path (the file name)
  let last = parts[parts.length - 1];

  // If the file name already has an extension, replace it with ".js"
  if (last.indexOf(".") > -1) {
    last = last.replace(/\.[^.]+$/, ".js");
  } else {
    // If no extension exists, append ".js"
    last = last + ".js";
  }

  // Replace the last part of the path with the updated file name
  parts[parts.length - 1] = last;

  // Rejoin the path parts with "/" and return
  return parts.join("/");
}
