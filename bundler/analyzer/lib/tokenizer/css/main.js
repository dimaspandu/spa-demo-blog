// Ultra-strict CSS tokenizer
// ------------------------------------------------------------
// Lexical tokenizer for CSS / style blocks.
// This tokenizer does NOT parse rules or selectors semantically.
// It only classifies tokens deterministically.
//
// Design goals:
// - Flat token stream
// - Preserve whitespace and newlines
// - No AST, no selector grammar
// - Safe for minifiers, stringifiers, analyzers
//
// Token types:
// - selector
// - identifier
// - number
// - dimension
// - string
// - comment
// - punctuator
// - whitespace
// - newline
// - at_keyword
// - function
// - hash
// - unknown

export default function cssTokenizer(source, opts = {}) {
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

  function error(msg, s = snap()) {
    const e = new SyntaxError(`${msg} (${s.line}:${s.column})`);
    if (cfg.throwOnError) throw e;
    return e;
  }

  function push(type, value, s, e = snap()) {
    tokens.push({
      type,
      value,
      start: s.index,
      end: e.index,
      line: s.line,
      column: s.column
    });
  }

  // ------------------------------------------------------------
  // Readers
  // ------------------------------------------------------------

  function readWhitespace() {
    const s = snap();
    let buf = "";
    while (/[ \t\f\v]/.test(peek())) {
      buf += peek();
      advance();
    }
    push("whitespace", buf, s);
  }

  function readNewline() {
    const s = snap();
    if (peek() === "\r" && peek(1) === "\n") advance(2);
    else advance();
    push("newline", "\n", s);
  }

  function readComment() {
    const s = snap();
    advance(2); // /*
    let buf = "/*";

    while (index < len && !(peek() === "*" && peek(1) === "/")) {
      buf += peek();
      advance();
    }

    if (index >= len) return error("Unterminated CSS comment", s);

    buf += "*";
    advance();
    buf += "/";
    advance();

    push("comment", buf, s);
  }

  function readString(quote) {
    const s = snap();
    let buf = quote;
    advance();

    while (index < len) {
      const ch = peek();

      if (ch === "\\") {
        buf += ch;
        advance();
        if (index < len) {
          buf += peek();
          advance();
        }
        continue;
      }

      if (ch === quote) {
        buf += ch;
        advance();
        push("string", buf, s);
        return;
      }

      if (ch === "\n" || ch === "\r")
        return error("Unterminated CSS string", s);

      buf += ch;
      advance();
    }

    return error("Unterminated CSS string", s);
  }

  function readNumberOrDimension() {
    const s = snap();
    let buf = "";
    let hasDot = false;

    if (peek() === "+" || peek() === "-") {
      buf += peek();
      advance();
    }

    while (/[0-9]/.test(peek()) || (!hasDot && peek() === ".")) {
      if (peek() === ".") hasDot = true;
      buf += peek();
      advance();
    }

    // Dimension (px, em, %, vh, etc)
    if (/[a-zA-Z%]/.test(peek())) {
      while (/[a-zA-Z%]/.test(peek())) {
        buf += peek();
        advance();
      }
      push("dimension", buf, s);
      return;
    }

    push("number", buf, s);
  }

  function readIdentifierOrFunction() {
    const s = snap();
    let buf = "";

    while (/[a-zA-Z0-9_-]/.test(peek())) {
      buf += peek();
      advance();
    }

    if (peek() === "(") {
      push("function", buf, s);
      return;
    }

    push("identifier", buf, s);
  }

  function readAtKeyword() {
    const s = snap();
    let buf = "@";
    advance();

    while (/[a-zA-Z_-]/.test(peek())) {
      buf += peek();
      advance();
    }

    push("at_keyword", buf, s);
  }

  function readHash() {
    const s = snap();
    let buf = "#";
    advance();

    while (/[a-zA-Z0-9_-]/.test(peek())) {
      buf += peek();
      advance();
    }

    push("hash", buf, s);
  }

  function readPunctuator() {
    const s = snap();
    const ch = peek();
    advance();
    push("punctuator", ch, s);
  }

  // ------------------------------------------------------------
  // Main loop
  // ------------------------------------------------------------

  function loop() {
    const ch = peek();
    if (ch === undefined) return;

    if (/[ \t\f\v]/.test(ch)) {
      readWhitespace();
      return;
    }

    if (ch === "\n" || ch === "\r") {
      readNewline();
      return;
    }

    if (ch === "/" && peek(1) === "*") {
      readComment();
      return;
    }

    if (ch === '"' || ch === "'") {
      readString(ch);
      return;
    }

    if (ch === "@") {
      readAtKeyword();
      return;
    }

    if (ch === "#") {
      readHash();
      return;
    }

    if (/[+-]?[0-9]/.test(ch) || (ch === "." && /[0-9]/.test(peek(1)))) {
      readNumberOrDimension();
      return;
    }

    if (/[a-zA-Z_-]/.test(ch)) {
      readIdentifierOrFunction();
      return;
    }

    // Punctuation: {},():;,.>+~[]=
    readPunctuator();
  }

  while (index < len) loop();

  return tokens;
}
