import {
  cleanUpCode,
  cleanUpStyle,
  minifyHTML,
  minifyJS,
  stripComments,
  stripHTMLComments
} from "./bundler/utils/index.js";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import fsp from "fs/promises";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import articles from "./src/models/articles.js";

const run = promisify(exec);

// Resolve __filename and __dirname in ESM scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/*
  Load the global index.html as base layout.
  This template must include placeholders:
  {{TITLE}}, {{DESCRIPTION}}, {{IMAGE}}, and {{CONTENT}}.
*/
async function loadBaseTemplate() {
  const templatePath = path.join(__dirname, "src/index.html");
  try {
    return await fsp.readFile(templatePath, "utf-8");
  } catch (err) {
    console.error("index.html not found in project root.");
    throw err;
  }
}

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

  // Step 4: generate articles
  console.log("Generating article HTML pages...");
  await generateArticlePages(distDir, config.pagesDirectory);

  // Step 5: generate static pages
  console.log("Generating pages...");
  await generatePages(distDir, config.pagesDirectory);

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

/*
  Generate one HTML file per article using the pagesDirectory from config
*/
async function generateArticlePages(distDir, pagesDirectory) {
  const pagesDir = path.join(__dirname, pagesDirectory);
  const singlePath = path.join(pagesDir, "single.html");
  let singleTemplate = "";

  try {
    singleTemplate = await fsp.readFile(singlePath, "utf-8");
  } catch (err) {
    console.error("single.html not found in pagesDirectory.");
    throw err;
  }

  const baseTemplate = await loadBaseTemplate();

  for (const article of articles) {
    const safeSlug = article.slug && article.slug.trim() !== "" ? article.slug.trim() : String(article.id);

    let description = article.excerpt || article.content || "";
    if (description.length > 160) {
      description = description.substring(0, 157).trim() + "...";
    }

    const image = article.image || "";

    const finalHtml = baseTemplate
      .replace(/{{TITLE}}/g, `Demo Blog — ${article.title}`)
      .replace(/{{DESCRIPTION}}/g, escapeHtml(description))
      .replace(/{{IMAGE}}/g, escapeHtml(image))
      .replace("{{CONTENT}}", singleTemplate);

    const filePath = path.join(distDir, `${safeSlug}.html`);
    await fsp.writeFile(filePath, minifyHTML(stripHTMLComments(finalHtml)), "utf-8");
    console.log(`Generated: ${safeSlug}.html`);
  }
}

/*
  Generate static pages using pagesDirectory from config
*/
async function generatePages(distDir, pagesDirectory) {
  const pagesDir = path.join(__dirname, pagesDirectory);
  let entries = [];

  try {
    entries = await fsp.readdir(pagesDir);
  } catch (err) {
    console.error("pagesDirectory not found. Skipping page generation.");
    return;
  }

  const baseTemplate = await loadBaseTemplate();

  for (const entry of entries) {
    const ext = path.extname(entry).toLowerCase();
    if (ext !== ".html") continue;
    if (entry === "single.html") continue;

    const srcPath = path.join(pagesDir, entry);
    const rawContent = await fsp.readFile(srcPath, "utf-8");

    const baseName = path.basename(entry, ".html");
    const humanTitle = humanize(baseName);

    let pageTitle;
    if (baseName === "404") {
      pageTitle = "Demo Blog - Page Not Found";
    } else if (baseName === "500") {
      pageTitle = "Demo Blog - Internal Server Error";
    } else {
      pageTitle = `Demo Blog - ${humanTitle}`;
    }

    const description =
      baseName === "404"
        ? "Demo Blog — Page not found"
        : baseName === "500"
        ? "Demo Blog — Internal server error"
        : `Demo Blog — ${humanTitle} page`;

    const finalHtml = baseTemplate
      .replace(/{{TITLE}}/g, escapeHtml(pageTitle))
      .replace(/{{DESCRIPTION}}/g, escapeHtml(description))
      .replace(/{{IMAGE}}/g, "")
      .replace("{{CONTENT}}", rawContent);

    const outPath = path.join(distDir, entry);
    await fsp.writeFile(outPath, minifyHTML(stripHTMLComments(finalHtml)), "utf-8");
    console.log(`Generated: ${entry}`);
  }
}

function humanize(name) {
  return name
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Run build process
build().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});
