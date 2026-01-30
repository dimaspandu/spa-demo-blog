import { exec } from "child_process";
import { logger } from "./logger.js";

/**
 * Minifies a given JavaScript source code.
 *
 * Execution order:
 * 1. Detect and try to use global Terser (if installed and accessible in PATH).
 * 2. If Terser is not found, attempt to auto-install it using npm.
 * 3. If installation or Terser usage fails, fallback to Toptal's online minifier API.
 * 4. If both local and remote methods fail, return the original unminified source.
 *
 * @param {string} source - The JavaScript source code to minify.
 * @returns {Promise<string>} - Returns a Promise that resolves with the minified code,
 *                              or the original source if all methods fail.
 */
export default async function uglifyJS(source) {

  // ---------------------------------------------------------------------------
  // Helper: Executes a shell command and resolves with stdout or null on error
  // ---------------------------------------------------------------------------
  function run(cmd, input) {
    return new Promise((resolve) => {
      logger.debug(`[DEBUG]: Executing shell command: ${cmd}`);

      const child = exec(cmd, { maxBuffer: 1024 * 1024 }, (err, stdout, stderr) => {
        if (err) {
          logger.warn(`[WARN]: Command execution failed: ${cmd}`);
          logger.warn(`[WARN]: Error message: ${err.message}`);
          resolve(null);
          return;
        }

        if (stderr && stderr.trim()) {
          logger.warn(`[WARN]: Command "${cmd}" produced stderr output: ${stderr.trim()}`);
          resolve(null);
          return;
        }

        logger.debug(`[DEBUG]: Command "${cmd}" completed successfully.`);
        resolve(stdout.trim());
      });

      if (input && child.stdin) {
        logger.debug("[DEBUG]: Writing source input to command stdin...");
        child.stdin.write(input);
        child.stdin.end();
      }
    });
  }

  logger.debug("[INFO]: Starting JavaScript minification process...");
  logger.debug("[STEP 1]: Checking for global Terser availability...");

  // --- 1. Check if Terser exists globally ---
  let terserExists = await run(process.platform === "win32" ? "where terser" : "which terser");

  // --- 2. Attempt auto-installation if Terser is missing ---
  if (!terserExists) {
    logger.warn("[WARN]: Global Terser not found.");

    logger.debug("[STEP 2]: Checking if npm is available for global installation...");
    const npmExists = await run(process.platform === "win32" ? "where npm" : "which npm");

    if (npmExists) {
      logger.info("[INFO]: npm found. Attempting to install Terser globally...");
      await run("npm install -g terser");

      // Recheck after installation
      terserExists = await run(process.platform === "win32" ? "where terser" : "which terser");

      if (terserExists) {
        logger.success("[SUCCESS]: Terser successfully installed globally.");
      } else {
        logger.warn("[WARN]: Failed to install Terser globally. Proceeding to fallback options.");
      }
    } else {
      logger.warn("[WARN]: npm not found. Cannot install Terser automatically.");
    }
  } else {
    logger.debug("[INFO]: Global Terser installation detected.");
  }

  // --- 3. Attempt to minify using global Terser ---
  if (terserExists) {
    logger.debug("[STEP 3]: Running Terser minification...");
    const terserResult = await run("terser -c -m", source);

    if (terserResult) {
      logger.success("[SUCCESS]: Source successfully minified using global Terser.");
      logger.debug(`[RESULT]: Minified output length: ${terserResult.length} characters.`);
      return terserResult;
    } else {
      logger.warn("[WARN]: Global Terser failed to minify source. Proceeding to Toptal API fallback...");
    }
  }

  // --- 4. Fallback: Use Toptal API ---
  logger.debug("[STEP 4]: Attempting remote minification via Toptal API...");

  if (typeof fetch !== "function") {
    logger.warn("[WARN]: 'fetch' is not available in this environment. Returning original source.");
    return source;
  }

  const url = "https://www.toptal.com/developers/javascript-minifier/api/raw";
  const body = new URLSearchParams({ input: source }).toString();

  try {
    logger.debug(`[DEBUG]: Sending POST request to ${url}...`);
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    if (!res.ok) {
      logger.warn(`[WARN]: Toptal API request failed with HTTP status ${res.status}.`);
      logger.warn("[WARN]: Returning original unminified source.");
      return source;
    }

    const minified = await res.text();
    logger.success("[SUCCESS]: Source successfully minified using Toptal API.");
    logger.debug(`[RESULT]: Minified output length: ${minified.length} characters.`);
    return minified;
  } catch (err) {
    logger.error("[ERROR]: Remote minification request failed.");
    logger.error("[DETAILS]:", err);
    logger.warn("[WARN]: Returning original unminified source due to error.");
    return source;
  }
}
