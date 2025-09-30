// -----------------------------
// STATIC IMPORT (runs on page load)
// -----------------------------

// 1. Import JSON (native support in modern browsers)
import colors from "./colors.json" with { type: "json" };
console.log("Static JSON data:", colors);

// 2. Import CSS (supported in Chromium 111+ / Safari 17+)
import sheet from "./styles.css" with { type: "css" };
console.log("Static CSS data:", sheet);
document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];

// 3. Import JavaScript module
import { greet } from "./helper.js";
greet("Static Visitor");

// Example: use JSON data in the DOM
const p = document.createElement("p");
p.textContent = `Primary color (static): ${colors.primary}`;
p.style.color = colors.primary;
document.body.appendChild(p);

// -----------------------------
// DYNAMIC IMPORT (runs on demand)
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

  // 3. Dynamic JavaScript import
  const { greet: dynGreet } = await import("./dynamic/helper.js");
  dynGreet("Dynamic Visitor");

  // Example: add DOM element with dynamic color
  const p = document.createElement("p");
  p.textContent = `Secondary color (dynamic): ${dynColors.secondary}`;
  p.style.color = dynColors.secondary;
  document.body.appendChild(p);
});