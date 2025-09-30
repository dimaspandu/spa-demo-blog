/**
 * importPlus(path, options)
 *
 * A helper that extends the native ES module `import()`
 * to also support non-JS assets like SVG, HTML, XML.
 *
 * Uses a simple cache so the same path is not requested multiple times,
 * unless explicitly disabled via options.
 *
 * @param {string} path - The relative or absolute path to the asset or module
 * @param {object} [options] - Optional settings
 * @param {boolean} [options.useCache=true] - Whether to use the internal cache
 * @returns {Promise|string|any|HTMLScriptElement|HTMLLinkElement} 
 */
const importCache = new Map();

export default function importPlus(path, options = { useCache: true }) {
  const supportsPromise = typeof Promise !== "undefined";
  const { useCache = true } = options;

  // If cached and allowed, return cached loader
  if (useCache && importCache.has(path)) {
    return importCache.get(path);
  }

  let loader;
  let finalPath = path;

  // Bypass browser import cache by appending a query param
  if (!useCache && path.match(/\.(js|mjs)$/i)) {
    const cacheBuster = `t=${Date.now()}-${Math.random()}`;
    finalPath = path.includes("?") ? `${path}&${cacheBuster}` : `${path}?${cacheBuster}`;
  }

  // Load CSS with <link>, others (SVG/HTML/XML) as text
  if (finalPath.match(/\.css$/i)) {
    loader = new Promise((resolve, reject) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = finalPath;
      link.onload = () => resolve(link);
      link.onerror = () => reject(new Error("Failed to load " + finalPath));
      document.head.appendChild(link);
    });
  } else if (finalPath.match(/\.(svg|html|xml)$/i)) {
    if (supportsPromise) {
      loader = fetch(finalPath).then(res => res.text());
    } else {
      loader = (() => {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", finalPath, true);
        xhr.send();
        return {
          then: (resolve) => { xhr.onload = () => resolve(xhr.responseText); return this; },
          catch: (reject) => { xhr.onerror = () => reject(new Error("Failed to load " + finalPath)); return this; }
        };
      })();
    }
  }

  // Load JS / MJS modules
  else if (finalPath.match(/\.(js|mjs)$/i)) {
    if (supportsPromise) {
      loader = import(finalPath);
    } else {
      loader = (() => {
        const script = document.createElement("script");
        script.src = finalPath;
        script.type = "module";
        document.head.appendChild(script);
        return {
          then: (resolve) => { script.onload = () => resolve(script); return this; },
          catch: (reject) => { script.onerror = () => reject(new Error("Failed to load " + finalPath)); return this; }
        };
      })();
    }
  }

  // Fallback for other file types
  else {
    if (supportsPromise) {
      loader = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = finalPath;
        script.type = "module";
        script.onload = () => resolve(script);
        script.onerror = () => reject(new Error("Failed to load " + finalPath));
        document.head.appendChild(script);
      });
    } else {
      loader = (() => {
        const script = document.createElement("script");
        script.src = finalPath;
        script.type = "module";
        document.head.appendChild(script);
        return {
          then: (resolve) => { script.onload = () => resolve(script); return this; },
          catch: (reject) => { script.onerror = () => reject(new Error("Failed to load " + finalPath)); return this; }
        };
      })();
    }
  }

  // Save in cache only if enabled
  if (useCache) {
    importCache.set(path, loader);
  }

  return loader;
}
