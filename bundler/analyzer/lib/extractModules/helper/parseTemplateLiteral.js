/* ----------------------------------------------------------
 * Parse template literal (complete):
 * template_chunk  → `./style-
 * template_expr_start → ${
 * identifier → theme
 * template_expr_end → }
 * template → .css`
 * ---------------------------------------------------------- */
export default function parseTemplateLiteral(tokens, startIndex) {
  let i = startIndex;
  let str = "";

  while (i < tokens.length) {
    const t = tokens[i];

    if (t.type === "template_chunk") {
      str += t.value;
      i++;
      continue;
    }

    if (t.type === "template_expr_start") {
      str += "${";
      i++;
      continue;
    }

    if (t.type === "identifier") {
      str += t.value;
      i++;
      continue;
    }

    if (t.type === "template_expr_end") {
      str += "}";
      i++;
      continue;
    }

    if (t.type === "template") {
      str += t.value; // Eg: '.css`'
      i++;
      break;
    }

    break;
  }

  return { value: str, nextIndex: i };
}