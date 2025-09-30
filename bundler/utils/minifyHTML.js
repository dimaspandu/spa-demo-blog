// Utility: minify HTML into a single line
export default function minifyHTML(html) {
  return html
    .replace(/>\s+</g, "><") // remove whitespace between tags
    .replace(/\n/g, "")       // remove newlines
    .replace(/\r/g, "")       // remove carriage returns
    .replace(/\t/g, "")       // remove tabs
    .replace(/\s{2,}/g, " ")  // collapse multiple spaces
    .trim();
}