import path from "path";

/**
 * Map source file into dist folder
 * relative to the entry directory, not project root.
 */
export default function mapToDistPath(sourcePath, distPath, entryPath) {
  try {
    const sourceAbs = path.resolve(sourcePath);
    const distAbs = path.resolve(distPath);

    // Entry directory becomes the logical root
    const entryDir = path.dirname(path.resolve(entryPath));

    // Path relative to entry directory
    const relative = path.relative(entryDir, sourceAbs);

    const destination = path.join(distAbs, relative);

    return {
      success: true,
      source: sourceAbs,
      destination,
    };
  } catch (err) {
    return {
      success: false,
      source: sourcePath,
      error: err.message,
    };
  }
}

