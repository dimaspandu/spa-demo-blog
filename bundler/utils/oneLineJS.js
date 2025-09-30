// Utility: flatten JavaScript code into a single line safely
export default function oneLineJS(code) {
  return code
    // Preserve string literals by escaping newlines inside them
    .replace(/(["'`])((?:\\\1|.)*?)\1/g, (m) => {
      return m.replace(/\n/g, "\\n");
    })
    // Remove line breaks when chained calls (dot before newline)
    .replace(/\.\s*[\r\n]+\s*/g, ".")
    // Remove generic newlines and indentations
    .replace(/[\r\n]+/g, " ")
    // Collapse multiple spaces
    .replace(/\s{2,}/g, " ")
    // Remove unwanted spaces before dot-methods
    .replace(/\s+\.(?=\w+\()/g, ".")
    .trim();
}
