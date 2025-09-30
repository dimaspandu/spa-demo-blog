import app from "../app.js";

export default function setAnchorHydration() {
  document.body.querySelectorAll("a").forEach(link => {
    link.onclick = function(event) {
      event.preventDefault();
      app.navigatePush(link.getAttribute("href"));
    };
  });
}