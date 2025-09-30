import {
  cleanUpCode,
  cleanUpStyle,
  minifyHTML,
  minifyJS,
  stripComments,
  stripHTMLComments
} from "../../utils/index.js";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import fsp from "fs/promises";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const run = promisify(exec);

// Resolve __filename and __dirname in ESM scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/*
  Main build orchestrator:
  - run bundling step
  - copy configured directories and files
  - generate article pages
  - generate static pages
*/
async function build() {
  const configPath = path.join(__dirname, "config.json");
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

  const distDir = path.join(__dirname, config.outputDirectory);
  await fsp.mkdir(distDir, { recursive: true });

  // Step 1: bundle
  console.log("Running bundle.js...");
  await run("node run.bundle.js", { cwd: __dirname });
  console.log("Bundle completed.");

  // Step 2: copy directories
  if (Array.isArray(config.copyDirs)) {
    for (const dirItem of config.copyDirs) {
      let srcDir, destDirName;
      if (typeof dirItem === "string") {
        srcDir = path.join(__dirname, dirItem);
        destDirName = dirItem; // copy as-is
      } else if (typeof dirItem === "object") {
        const [key, value] = Object.entries(dirItem)[0];
        srcDir = path.join(__dirname, key);
        destDirName = value; // rename folder
      } else {
        continue;
      }

      const destDir = path.join(distDir, destDirName);
      if (fs.existsSync(srcDir)) {
        console.log("Copying directory:", srcDir, "->", destDirName);
        await copyDir(srcDir, destDir);
      }
    }
  } else if (typeof config.copyDirs === "object") {
    for (const [key, value] of Object.entries(config.copyDirs)) {
      const srcDir = path.join(__dirname, key);
      const destDirName = value;
      const destDir = path.join(distDir, destDirName);
      if (fs.existsSync(srcDir)) {
        console.log("Copying directory:", srcDir, "->", destDirName);
        await copyDir(srcDir, destDir);
      }
    }
  }

  // Step 3: copy files
  if (Array.isArray(config.copyFiles)) {
    for (const fileItem of config.copyFiles) {
      let srcFile, destFileName;
      if (typeof fileItem === "string") {
        srcFile = path.join(__dirname, fileItem);
        destFileName = path.basename(fileItem);
      } else if (typeof fileItem === "object") {
        const [key, value] = Object.entries(fileItem)[0];
        srcFile = path.join(__dirname, key);
        destFileName = value;
      } else {
        continue;
      }

      const destFile = path.join(distDir, destFileName);
      if (fs.existsSync(srcFile)) {
        console.log("Copying file:", srcFile, "->", destFileName);
        await processAndCopyFile(srcFile, destFile);
      }
    }
  } else if (typeof config.copyFiles === "object") {
    for (const [key, value] of Object.entries(config.copyFiles)) {
      const srcFile = path.join(__dirname, key);
      const destFileName = value;
      const destFile = path.join(distDir, destFileName);
      if (fs.existsSync(srcFile)) {
        console.log("Copying file:", srcFile, "->", destFileName);
        await processAndCopyFile(srcFile, destFile);
      }
    }
  }

  console.log("Build finished successfully.");
}

/*
  Process files before copying:
*/
async function processAndCopyFile(src, dest) {
  const ext = path.extname(src).toLowerCase();
  await fsp.mkdir(path.dirname(dest), { recursive: true });

  if (ext === ".js" || ext === ".html" || ext === ".css") {
    const alreadyMinified = src.includes(".min.js");
    let content = await fsp.readFile(src, "utf-8");

    if (ext === ".js" && !alreadyMinified) {
      content = stripComments(content);
      content = cleanUpCode(content);
      content = await minifyJS(content);
    } else if (ext === ".html") {
      content = minifyHTML(stripHTMLComments(content));
    } else if (ext === ".css") {
      content = stripComments(content);
      content = cleanUpStyle(content);
    }

    await fsp.writeFile(dest, content, "utf-8");
  } else {
    await fsp.copyFile(src, dest);
  }
}

/*
  Recursively copy a directory
*/
async function copyDir(src, dest) {
  await fsp.mkdir(dest, { recursive: true });
  const entries = await fsp.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await processAndCopyFile(srcPath, destPath);
    }
  }
}

// Run build process
build().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});
