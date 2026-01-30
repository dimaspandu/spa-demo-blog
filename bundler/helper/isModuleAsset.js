/**
 * Determines whether a file should be treated as a "module asset".
 *
 * A module asset is an asset file that is intentionally imported as a JavaScript
 * module and therefore must be processed by the bundler, included in the module
 * graph, and registered in the runtime module registry.
 *
 * Convention:
 *  - Only asset files whose filename contains ".module." are considered modules.
 *  - This applies to assets such as CSS, SVG, HTML, XML, and JSON.
 *
 * Examples:
 *  - "style.module.css"  -> true  (bundled as a module)
 *  - "icon.module.svg"   -> true  (bundled as a module)
 *  - "data.module.json"  -> true  (bundled as a module)
 *  - "style.css"         -> false (copied as a plain asset)
 *  - "icon.svg"          -> false (copied as a plain asset)
 *
 * This function does not validate file extensions.
 * It only checks the naming convention used to explicitly opt-in to module behavior.
 *
 * @param {string} filename - Absolute or relative file path.
 * @returns {boolean} True if the file is explicitly marked as a module asset.
 */
export default function isModuleAsset(filename) {
  return filename.includes(".module.");
}
