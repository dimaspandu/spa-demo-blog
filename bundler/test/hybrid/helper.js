export function greet(name) {
  console.log(`Hello, ${name}!`);
  const el = document.createElement("div");
  el.textContent = `JS Module says: Hello, ${name}!`;
  el.style.marginTop = "10px";
  el.style.fontStyle = "italic";
  document.body.appendChild(el);
}
