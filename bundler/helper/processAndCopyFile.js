import fsp from "fs/promises";
import path from "path";
import logger from "./logger.js";

/**
 * processAndCopyFile(src, dest)
 * ------------------------------
 * Copies non-JS assets (images, fonts, etc.) into the output directory.
 */
export default async function processAndCopyFile(src, dest) {
  logger.info(`[COPY] Copying asset from ${src} to ${dest}`);

  await fsp.mkdir(path.dirname(dest), { recursive: true });
  await fsp.copyFile(src, dest);

  logger.success(`[COPY] Asset successfully copied to ${dest}`);
}