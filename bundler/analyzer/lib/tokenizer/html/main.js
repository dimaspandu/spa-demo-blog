// Ultra-strict HTML tokenizer for static analysis and transformation.
// ------------------------------------------------------------------
// This tokenizer performs a deterministic, character-by-character scan
// of HTML / SVG source code and produces a flat token stream.
//
// Design goals:
// - No DOM parsing, no tree construction.
// - No validation of tag nesting or correctness.
// - Preserve exact raw text and spacing.
// - Produce predictable token shapes for downstream transformers.
// - Track line/column coordinates for precise source mapping.
//
// This tokenizer is suitable for:
// - HTML / SVG rewriting
// - Static analysis
// - Template preprocessing
// - Hybrid JS/HTML tooling
export default function htmlTokenizer(source, opts = {}) {
  const cfg = { throwOnError: true, ...opts };

  const len = source.length;
  let index = 0;
  let line = 1;
  let column = 0;

  const tokens = [];

  function snap() {
    return { index, line, column };
  }

  function advance(n = 1) {
    while (n-- > 0 && index < len) {
      const ch = source[index++];
      if (ch === "\n") {
        line++;
        column = 0;
      } else {
        column++;
      }
    }
  }

  function peek(off = 0) {
    return source[index + off];
  }

  function push(type, value, s, e) {
    tokens.push({
      type,
      value,
      start: s.index,
      end: e.index,
      line: s.line,
      column: s.column
    });
  }

  function error(msg, s = snap()) {
    const e = new SyntaxError(`${msg} (${s.line}:${s.column})`);
    if (cfg.throwOnError) throw e;
    return e;
  }

  // --- Readers ---

  function readWhitespace() {
    const s = snap();
    let buf = "";
    while (/[ \t]/.test(peek())) {
      buf += peek();
      advance();
    }
    push("whitespace", buf, s, snap());
  }

  function readNewline() {
    const s = snap();
    if (peek() === "\r" && peek(1) === "\n") advance(2);
    else advance(1);
    push("newline", "\n", s, snap());
  }

  function readText() {
    const s = snap();
    let buf = "";
    while (index < len && peek() !== "<") {
      if (peek() === "\n" || peek() === "\r") break;
      buf += peek();
      advance();
    }
    if (buf) push("text", buf, s, snap());
  }

  function readComment() {
    const s = snap();
    advance(4); // <!--
    let buf = "<!--";

    while (index < len && !(peek() === "-" && peek(1) === "-" && peek(2) === ">")) {
      buf += peek();
      advance();
    }

    if (index >= len) return error("Unterminated HTML comment", s);

    buf += "-->";
    advance(3);

    push("comment", buf, s, snap());
  }

  function readXMLDeclaration() {
    const s = snap();
    let buf = "";

    // read "<?"
    buf += peek(); // <
    advance();
    buf += peek(); // ?
    advance();

    // read until "?>"
    while (
      index < len &&
      !(peek() === "?" && peek(1) === ">")
    ) {
      buf += peek();
      advance();
    }

    if (peek() === "?" && peek(1) === ">") {
      buf += "?>";
      advance(2);
    }

    push("xml_declaration", buf, s, snap());
  }

  function readDoctype() {
    const s = snap();
    advance(2); // <!
    let buf = "<!";

    while (index < len && peek() !== ">") {
      buf += peek();
      advance();
    }

    if (peek() === ">") {
      buf += ">";
      advance();
    }

    push("doctype", buf, s, snap());
  }

  function readTag() {
    const s = snap();
    advance(); // <
    push("tag_open", "<", s, snap());

    // closing tag
    if (peek() === "/") {
      const s2 = snap();
      advance();
      push("tag_close", "/", s2, snap());
    }

    // tag name
    while (/[A-Za-z0-9:_-]/.test(peek())) {
      const s3 = snap();
      let buf = "";
      while (/[A-Za-z0-9:_-]/.test(peek())) {
        buf += peek();
        advance();
      }
      push("tag_name", buf, s3, snap());
    }

    // attributes
    while (index < len && peek() !== ">" && !(peek() === "/" && peek(1) === ">")) {
      if (/[ \t]/.test(peek())) {
        readWhitespace();
        continue;
      }

      const sAttr = snap();
      let name = "";
      while (/[^\s=>]/.test(peek())) {
        name += peek();
        advance();
      }
      if (name) push("attr_name", name, sAttr, snap());

      if (peek() === "=") {
        const sEq = snap();
        advance();
        push("attr_equal", "=", sEq, snap());

        const quote = peek();
        if (quote === '"' || quote === "'") {
          const sVal = snap();
          advance();
          let val = quote;
          while (index < len && peek() !== quote) {
            val += peek();
            advance();
          }
          if (peek() === quote) {
            val += quote;
            advance();
          }
          push("attr_value", val, sVal, snap());
        }
      }
    }

    // self closing
    if (peek() === "/" && peek(1) === ">") {
      const s2 = snap();
      advance(2);
      push("tag_self_close", "/>", s2, snap());
      return;
    }

    // >
    if (peek() === ">") {
      const s2 = snap();
      advance();
      push("tag_end", ">", s2, snap());
    }
  }

  // --- Main loop ---
  while (index < len) {
    const ch = peek();

    if (ch === "\r" || ch === "\n") {
      readNewline();
      continue;
    }

    if (/[ \t]/.test(ch)) {
      readWhitespace();
      continue;
    }

    if (ch === "<") {
      if (source.startsWith("<?xml", index)) {
        readXMLDeclaration();
        continue;
      }

      if (source.startsWith("<!--", index)) {
        readComment();
        continue;
      }

      if (source.startsWith("<!", index)) {
        readDoctype();
        continue;
      }

      readTag();
      continue;
    }

    readText();
  }

  return tokens;
}
