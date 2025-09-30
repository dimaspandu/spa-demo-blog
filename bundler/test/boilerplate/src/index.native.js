// Import custom helpers for non-bundler environments
import {
  importPlus,   // Extended importer (used for non-standard file types)
  injectSVG     // Utility to inject SVG into the DOM
} from "./helpers/index.js"

// -----------------------------
// STATIC IMPORTS (executed immediately)
// -----------------------------

// 1. Import JSON
import colors from "./colors.json" with { type: "json" };
console.log("Static JSON data:", colors);

// 2. Import CSS
import sheet from "./styles.css" with { type: "css" };
console.log("Static CSS data:", sheet);
// Apply stylesheet
document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];

// 2.1. Import SVG via helper function
importPlus("./assets/logo.svg").then((logoSVG) => {
  console.log("Static SVG data:", logoSVG);
  // Insert the SVG into the logo container
  injectSVG(logoSVG, document.getElementById("logo"));
});

// 3. Import JavaScript module
import { greet } from "./helper.js";
greet("Static Visitor");

// Example: use JSON data in the DOM
const p = document.createElement("p");
p.textContent = `Primary color (static): ${colors.primary}`;
p.style.color = colors.primary;
p.style.display = "flex";
p.style.flexDirection = "column";
document.body.appendChild(p);

// Add a JPG image manually
const img = document.createElement("img");
img.setAttribute("src", "./assets/df-seller.jpg");
img.style.width = "20px";
img.style.height = "auto";
p.appendChild(img);

// -----------------------------
// DYNAMIC IMPORTS (executed on button click)
// -----------------------------
const button = document.getElementById("load-dynamic");

button.addEventListener("click", async () => {
  // 1. Dynamic JSON import
  const { default: dynColors } = await import("./dynamic/colors.json", {
    with: { type: "json" }
  });
  console.log("Dynamic JSON data:", dynColors);

  // 2. Dynamic CSS import
  const { default: dynSheet } = await import("./dynamic/styles.css", {
    with: { type: "css" }
  });
  document.adoptedStyleSheets = [
    ...document.adoptedStyleSheets,
    dynSheet
  ];

  // 2.1. Import HTML via helper function
  const greetings = await importPlus("./html/greetings.html");
  console.log("Dynamic HTML data:", greetings);
  const messageEl = document.getElementById("message");
  messageEl.innerHTML = greetings;

  // 3. Dynamic JavaScript import
  const { greet: dynGreet } = await import("./dynamic/helper.js");
  dynGreet("Dynamic Visitor");

  // Example: create element styled with dynamic color
  const p = document.createElement("p");
  p.textContent = `Secondary color (dynamic): ${dynColors.secondary}`;
  p.style.color = dynColors.secondary;
  document.body.appendChild(p);

  try {
    const { default: characters } = await import("https://amdmicrofrontends.netlify.app/microservices/characters.js");
    console.log("Dynamic external data", characters);
  } catch (_) {
    console.log("Dynamic external data: SKIPPED!");
  }
});
