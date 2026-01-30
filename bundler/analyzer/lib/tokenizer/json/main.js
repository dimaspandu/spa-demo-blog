// Ultra-strict JSON tokenizer
// ------------------------------------------------------------
// Lexical tokenizer for pure JSON files.
// This tokenizer performs a deterministic, character-by-character
// scan and produces a flat token stream.
//
// Design goals:
// - Strict JSON compliance (no comments, no trailing commas)
// - Flat token stream (no AST, no parsing)
// - Preserve whitespace and newlines
// - Deterministic token classification
// - Track line/column for precise diagnostics
//
// Suitable for:
// - package.json analysis
// - config inspection
// - JSON rewriting / formatting
// - Static tooling pipelines
//
// Token types:
// - string
// - number
// - literal        (true | false | null)
// - punctuator     ({ } [ ] : ,)
// - whitespace
// - newline
// - unknown

export default function jsonTokenizer(source, opts = {}) {
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

    while (peek() === " " || peek() === "\t") {
      buf += peek();
      advance();
    }

    if (buf) push("whitespace", buf, s);
  }

  function readNewline() {
    const s = snap();
    if (peek() === "\r" && peek(1) === "\n") advance(2);
    else advance();
    push("newline", "\n", s);
  }

  function readString() {
    const s = snap();
    let buf = '"';
    advance(); // opening "

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

      if (ch === '"') {
        buf += '"';
        advance();
        push("string", buf, s);
        return;
      }

      if (ch === "\n" || ch === "\r")
        return error("Unterminated JSON string", s);

      buf += ch;
      advance();
    }

    return error("Unterminated JSON string", s);
  }

  function readNumber() {
    const s = snap();
    let buf = "";

    if (peek() === "-") {
      buf += "-";
      advance();
    }

    if (!isDigit(peek()))
      return error("Invalid JSON number", s);

    if (peek() === "0") {
      buf += "0";
      advance();
    } else {
      while (isDigit(peek())) {
        buf += peek();
        advance();
      }
    }

    if (peek() === ".") {
      buf += ".";
      advance();
      if (!isDigit(peek()))
        return error("Invalid JSON number", s);
      while (isDigit(peek())) {
        buf += peek();
        advance();
      }
    }

    if (peek() === "e" || peek() === "E") {
      buf += peek();
      advance();
      if (peek() === "+" || peek() === "-") {
        buf += peek();
        advance();
      }
      if (!isDigit(peek()))
        return error("Invalid JSON exponent", s);
      while (isDigit(peek())) {
        buf += peek();
        advance();
      }
    }

    push("number", buf, s);
  }

  function readLiteral() {
    const s = snap();
    let buf = "";

    if (!/[a-z]/.test(peek())) {
      error("Invalid JSON literal", s);
      return;
    }

    while (/[a-z]/.test(peek())) {
      buf += peek();
      advance();
    }

    if (buf === "true" || buf === "false" || buf === "null") {
      push("literal", buf, s);
      return;
    }

    error(`Invalid JSON literal "${buf}"`, s);
    push("unknown", buf, s);
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

    if (ch === " " || ch === "\t") {
      readWhitespace();
      return;
    }

    if (ch === "\n" || ch === "\r") {
      readNewline();
      return;
    }

    if (ch === '"') {
      readString();
      return;
    }

    if (ch === "-" || isDigit(ch)) {
      readNumber();
      return;
    }

    if (/[a-z]/.test(ch)) {
      readLiteral();
      return;
    }

    if ("{}[]:,".includes(ch)) {
      readPunctuator();
      return;
    }

    // Anything else is invalid in strict JSON
    const s = snap();
    advance();
    error(`Unexpected character "${ch}"`, s);
    push("unknown", ch, s);
  }

  while (index < len) loop();

  return tokens;
}

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

function isDigit(ch) {
  return ch >= "0" && ch <= "9";
}
