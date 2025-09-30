import { exec } from "child_process";

/**
 * Minifies a given JavaScript source code.
 * 1. Detect & try using global Terser (if installed).
 * 2. If not found, try to auto-install with npm.
 * 3. If that fails, fallback to Toptal's online minifier.
 * 4. If both fail, return original source.
 *
 * @param {string} source - The JavaScript source code to minify.
 * @returns {Promise<string>} - Minified source or original source on failure.
 */
export default async function minifyJS(source) {
  // Helper: run a shell command and return promise
  function run(cmd, input) {
    return new Promise((resolve) => {
      const child = exec(cmd, { maxBuffer: 1024 * 1024 }, (err, stdout, stderr) => {
        if (err || (stderr && stderr.trim())) {
          resolve(null);
          return;
        }
        resolve(stdout.trim());
      });
      if (input && child.stdin) {
        child.stdin.write(input);
        child.stdin.end();
      }
    });
  }

  // --- 1. Check if terser is available globally ---
  let terserExists = await run(process.platform === "win32" ? "where terser" : "which terser");
  if (!terserExists) {
    // --- 2. Try auto install terser globally if npm available ---
    const npmExists = await run(process.platform === "win32" ? "where npm" : "which npm");
    if (npmExists) {
      console.info("Installing terser globally...");
      await run("npm install -g terser");
      // recheck
      terserExists = await run(process.platform === "win32" ? "where terser" : "which terser");
    }
  }

  if (terserExists) {
    const terserResult = await run("terser -c -m", source);
    if (terserResult) {
      console.info("Minified with global terser");
      return terserResult;
    }
  }

  // --- 3. Fallback: use Toptal API ---
  if (typeof fetch !== "function") {
    console.warn("fetch not available, returning original source");
    return source;
  }

  const url = "https://www.toptal.com/developers/javascript-minifier/api/raw";
  const body = new URLSearchParams({ input: source }).toString();

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    if (!res.ok) {
      console.warn(`Minify failed with status ${res.status}, returning original source`);
      return source;
    }

    console.info("Minified with Toptal API");
    return await res.text();
  } catch (err) {
    console.warn("Minify request failed, returning original source:", err);
    return source;
  }
}
