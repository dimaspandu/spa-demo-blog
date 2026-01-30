/**
 * Checks whether a file extension represents a supported static asset type.
 *
 * Asset extensions are non-JavaScript files that may either:
 *  - be bundled as modules (when combined with the ".module." naming convention), or
 *  - be treated as plain assets and copied directly to the output directory.
 *
 * This function is used to:
 *  - distinguish asset files from JavaScript modules,
 *  - apply asset-specific handling such as minification or direct copying,
 *  - ensure consistent filtering logic across the bundler (graph building,
 *    module mapping, and output generation).
 *
 * Supported asset types:
 *  - ".css"  : Stylesheets
 *  - ".svg"  : SVG images
 *  - ".html" : HTML documents or fragments
 *  - ".xml"  : XML files
 *  - ".json" : JSON data files
 *
 * The extension must include the leading dot (e.g. ".css", not "css").
 *
 * @param {string} ext - File extension as returned by path.extname().
 * @returns {boolean} True if the extension is a recognized asset type.
 */
export default function isAssetExtension(ext) {
  return [".css", ".svg", ".html", ".xml", ".json"].includes(ext);
}
