// -----------------------------
// STATIC IMPORTS (executed immediately)
// -----------------------------

// 1. Import JSON (native support in modern browsers)
import colors from "./colors.json" with { type: "json" };
console.log("Static JSON data:", colors);

// 2. Import CSS as a module (Chromium 111+ / Safari 17+ support)
import sheet from "./styles.css" with { type: "css" };
console.log("Static CSS data:", sheet);
// Apply imported CSS to the document
document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];

// 2.1. Import SVG as a module
import logoSVG from "./assets/logo.svg" with { type: "svg" };
console.log("Static SVG data:", logoSVG);
// Insert the SVG markup into the logo container
const logoContainer = document.getElementById("logo");
logoContainer.innerHTML = logoSVG;

// 3. Import a JavaScript helper module
import { greet } from "./helper.js";
greet("Static Visitor");

// Example: use JSON data to style DOM element
const p = document.createElement("p");
p.textContent = `Primary color (static): ${colors.primary}`;
p.style.color = colors.primary;
p.style.display = "flex";
p.style.flexDirection = "column";
document.body.appendChild(p);

// Import a JPG asset so bundler includes it
import "./assets/df-seller.jpg";

// Create an <img> element for the JPG
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

  // 2.1. Import HTML as a module
  const { default: greetings } = await import("./html/greetings.html");
  console.log("Dynamic HTML data:", greetings);
  const messageEl = document.getElementById("message");
  messageEl.innerHTML = greetings;

  // 3. Dynamic JavaScript import
  const { greet: dynGreet } = await import("./dynamic/helper.js");
  dynGreet("Dynamic Visitor");

  // Example: add DOM element styled with dynamic JSON data
  const p = document.createElement("p");
  p.textContent = `Secondary color (dynamic): ${dynColors.secondary}`;
  p.style.color = dynColors.secondary;
  document.body.appendChild(p);

  try {
    const { default: characters } = await import("https://amdmicrofrontends.netlify.app/microservices/cdn/services.js").namespace("&/galaxy/characters.js");
    console.log("Dynamic external data", characters);
  } catch (_) {
    console.log("Dynamic external data: SKIPPED!");
  }
});
