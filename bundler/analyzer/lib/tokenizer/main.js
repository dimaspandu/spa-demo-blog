// Ultra-strict JavaScript tokenizer for ESM/CJS transformation.
// ------------------------------------------------------------------
// This tokenizer performs a deterministic, character-by-character scan
// of the input source and produces a flat token stream.
//
// Design goals:
// - Maintain behavior close to Acorn/Babel tokenization rules.
// - Do not parse AST; only classify and extract tokens with positional data.
// - Strict distinction between identifiers, keywords, punctuators,
//   string literals, template literals, numeric literals, comments, etc.
// - Track line/column coordinates for error reporting and transformation.
//
// This tokenizer is intentionally minimal but predictable, suitable for
// custom transpilers, static analyzers, and codemods that require precise
// token shapes without a full parser.

/**
 * tokenizer(source)
 *
 * Convert raw JavaScript source code into a structured token list.
 *
 * - Produces tokens with fields:
 *     { type, value, start, end, line, column }
 * - Handles:
 *     • identifiers & keywords
 *     • punctuators & operators (including multi-char tokens like "===", "=>", "**", etc.)
 *     • numeric literals
 *     • string literals (single/double quotes)
 *     • template literals (raw + interpolated segments)
 *     • comments (line `//` and block `/* ... *\/`)
 * - Preserves whitespace boundaries for accurate start/end positions.
 *
 * This function does **strict lexical scanning only** — it does not
 * understand syntax or grammar. Higher-level modules consume this token
 * stream to implement transformations (e.g., ESM → CJS).
 */

export default function tokenizer(source, opts = {}) {

  // Merge user options with defaults.
  // throwOnError: whether the tokenizer should throw or return error tokens
  // allowShebang: support #! at start of file (Unix executables)
  const cfg = { throwOnError: true, allowShebang: true, ...opts };

  const len = source.length;
  let index = 0;
  let line = 1;
  let column = 0;

  const tokens = [];

  // Creates and optionally throws a SyntaxError.
  // Includes line/column in the error message.
  function makeError(msg, pos = { index, line, column }) {
    const e = new SyntaxError(`${msg} (${pos.line}:${pos.column})`);
    if (cfg.throwOnError) throw e;
    return e;
  }

  // Snapshot current position metadata for tokens.
  function snap() {
    return { index, line, column };
  }

  // Advance `n` characters, updating line/column information.
  function advance(n = 1) {
    while (n-- > 0 && index < len) {
      const ch = source[index++];
      if (ch === "\n") {
        line++;
        column = 0;
      }
      else column++;
    }
  }
  
  // Look ahead without consuming input.
  function peek(off = 0) {
    return source[index + off];
  }

  // --- Punctuators definition (longest-first is required for correct parsing) ---
  // The tokenizer uses a trie to match the longest punctuator starting at the current position.
  const punctuators = [
    ">>>=", "===", "!==", ">>>", "<<=", ">>=", "**=", "...", "||=", "&&=", "??=",
    "==", "!=", "<=", ">=", "++", "--", "**", "<<", ">>", "&&", "||", "??",
    "+=", "-=", "*=", "/=", "%=", "&=", "|=", "^=", "=>", "?.", "::",
    ".", ",", ";", ":", "?", "~", "!", "+", "-", "*", "/", "%", "&", "|", "^",
    "<", ">", "=", "{", "}", "(", ")", "[", "]", "@", "#"
  ];

  // Build a prefix trie for fast longest-match scanning.
  // Matching via trie avoids O(n * m) scans through punctuator list.
  const trie = {};
  for (const p of punctuators) {
    let node = trie;
    for (const ch of p) {
      node[ch] = node[ch] || {};
      node = node[ch];
    }
    node.__end = p; // marks the end of a valid punctuator
  }

  // Walks the trie as far as possible to get the longest matching punctuator.
  function matchPunctuator() {
    let node = trie;
    let j = index;
    let last = null;

    while (j < len) {
      const ch = source[j];
      node = node[ch];
      if (!node) break;
      if (node.__end) last = node.__end;
      j++;
    }
    return last;
  }

  // --- Unicode helpers ---
  // Detect whether Unicode property escapes are supported in this environment.
  const hasUnicode = (() => {
    try {
      return /\p{ID_Start}/u.test("a");
    } catch(e) {
      return false;
    }
  })();

  // Identifier start and continue checks, supporting unicode escapes if available.
  function isIdStart(ch) {
    if (!ch) return false;
    if (ch === "$" || ch === "_") return true;
    if (hasUnicode) return /\p{ID_Start}/u.test(ch);
    return /[A-Za-z_$]/.test(ch);
  }

  function isIdContinue(ch) {
    if (!ch) return false;
    if (ch === "$" || ch === "_") return true;
    if (hasUnicode) return /\p{ID_Continue}/u.test(ch);
    return /[A-Za-z0-9_$]/.test(ch);
  }

  // Decodes "\uXXXX" or "\u{XXXX}" sequences.
  // Used for identifiers containing unicode escapes.
  function parseUnicodeEscape(pos) {
    if (source[pos] !== "\\" || source[pos+1] !== "u") return null;

    let j = pos + 2;

    // Handle \u{XXXXX}
    if (source[j] === "{") {
      j++;
      let hex = "";
      while (j < len && source[j] !== "}") hex += source[j++];
      if (source[j] !== "}") return null;
      j++;
      if (!/^[0-9A-Fa-f]+$/.test(hex)) return null;
      return { char: String.fromCodePoint(parseInt(hex, 16)), end: j };
    }

    // Handle \uXXXX (fixed length)
    const hex = source.substr(j, 4);
    if (!/^[0-9A-Fa-f]{4}$/.test(hex)) return null;
    return { char: String.fromCharCode(parseInt(hex, 16)), end: j + 4 };
  }

  // JavaScript language keywords.
  // Identifiers matching these become keyword tokens.
  const keywords = new Set([
    "await","break","case","catch","class","const","continue","debugger","default","delete","do","else",
    "enum","export","extends","finally","for","function","if","import","in","instanceof","let","new",
    "return","super","switch","this","throw","try","typeof","var","void","while","with","yield"
  ]);

  // Determines if a slash after `prevToken` should be treated as a regex literal rather than a division operator.
  // This reproduces contextual scanning rules similar to JavaScript parsers (Acorn/Babel).
  function regexAllowedAfter(prevToken) {
    if (!prevToken) return true;

    const t = prevToken.type;

    // After identifiers, numbers, strings, etc. regex is NOT allowed.
    if (["identifier","number","string","bigint","regex","template_chunk","template_end"].includes(t))
      return false;

    // Certain keywords allow regex afterward.
    if (t === "keyword") {
      const allow = new Set(["return","case","throw","in","of","typeof","instanceof","new","delete","void"]);
      return allow.has(prevToken.value);
    }

    // Certain punctuators disallow regex (like ')', ']', '++', '--')
    if (t === "punctuator") {
      if ([")","}","]","++","--"].includes(prevToken.value)) return false;
      return true;
    }

    return true;
  }

  // Returns the last non-trivia token emitted so far.
  // Trivia tokens (whitespace, newlines, comments, shebangs)
  // must be ignored for contextual decisions.
  //
  // This helper is critical for correctly distinguishing
  // between regular expression literals and division operators,
  // since whitespace and comments do not affect JavaScript grammar.
  function lastSignificantToken() {
    for (let i = tokens.length - 1; i >= 0; i--) {
      const t = tokens[i];
      if (
        t.type !== "whitespace" &&
        t.type !== "newline" &&
        t.type !== "comment" &&
        t.type !== "shebang"
      ) {
        return t;
      }
    }
    return null;
  }

  // Emit a token.
  function pushToken(type, value, startSnap, endSnap) {
    tokens.push({
      type,
      value,
      start: startSnap.index,
      end: endSnap.index,
      line: startSnap.line,
      column: startSnap.column
    });
  }

  // --- Basic token readers ---

  // Reads spaces/tabs/vtabs/formfeeds.
  function readWhitespace() {
    const s = snap();
    let buf = "";
    while (index < len && /[ \t\v\f]/.test(peek())) {
      buf += peek();
      advance();
    }
    pushToken("whitespace", buf, s, snap());
  }

  // Reads newline sequences, differentiating CRLF vs LF.
  function readNewline() {
    const s = snap();
    if (peek() === "\r" && peek(1) === "\n") advance(2);
    else advance(1);
    pushToken("newline", "\n", s, snap());
  }

  // Reads single-line `//` comments.
  function readLineComment() {
    const s = snap();
    advance(2);
    let buf = "//";
    while (index < len && peek() !== "\n" && peek() !== "\r") {
      buf += peek();
      advance();
    }
    pushToken("comment", buf, s, snap());
  }

  // Reads block comments `/* ... */`, supporting multi-line.
  // Emits an error if the comment is never closed.
  function readBlockComment() {
    const s = snap();
    advance(2);
    let buf = "/*";

    while (index < len && !(peek() === "*" && peek(1) === "/")) {
      if (peek() === "\n") {
        buf += "\n";
        advance();
        continue;
      }
      buf += peek();
      advance();
    }

    if (index >= len) return makeError("Unterminated block comment", s);

    buf += "*"; advance();
    buf += "/"; advance();

    pushToken("comment", buf, s, snap());
  }

  // Reads string literals with escape support.
  function readString(quote) {
    const s = snap();
    advance(1);
    let buf = quote;

    while (index < len) {
      const ch = peek();

      if (ch === "\\") {
        buf += ch;
        advance(1);
        if (index < len) {
          buf += peek();
          advance(1);
        }
        continue;
      }

      if (ch === quote) {
        buf += ch;
        advance(1);
        pushToken("string", buf, s, snap());
        return;
      }

      if (ch === "\n" || ch === "\r")
        return makeError("Unterminated string literal", s);

      buf += ch;
      advance(1);
    }

    return makeError("Unterminated string literal", s);
  }

  // Reads template literals, including `${ ... }` embedded expressions.
  // For embedded expressions, template chunks and start/end tokens are emitted.
  function readTemplate() {
    const s = snap();
    advance(1);
    let buf = "`";

    while (index < len) {
      const ch = peek();

      if (ch === "\\") {
        buf += ch;
        advance(1);
        if (index < len) {
          buf += peek();
          advance(1);
        }
        continue;
      }

      if (ch === "`") {
        buf += "`";
        advance(1);
        pushToken("template", buf, s, snap());
        return;
      }

      if (ch === "$" && peek(1) === "{") {
        // Close the existing chunk
        pushToken("template_chunk", buf, s, snap());

        const s2 = snap();
        advance(2);

        pushToken("template_expr_start", "${", s2, snap());

        // Parse until matching brace
        readExpressionUntilBrace();

        buf = "";
        continue;
      }

      buf += ch;
      advance(1);
    }

    return makeError("Unterminated template literal", s);
  }

  // Parses the inside of `${ ... }` with brace-depth tracking.
  // The algorithm:
  // - depth starts at 1 (for the initial `{`)
  // - strings, templates, and comments inside are parsed with their own logic
  // - encountering `{` increments depth
  // - encountering `}` decrements depth
  // - when depth reaches 0, we emit template_expr_end and stop
  function readExpressionUntilBrace() {
    let depth = 1;

    while (index < len && depth > 0) {
      const ch = peek();

      // Nested structures
      if (ch === "'" || ch === '"') {
        readString(ch);
        continue;
      }
      if (ch === "`") {
        readTemplate();
        continue;
      }
      if (ch === "/" && peek(1) === "/") {
        readLineComment();
        continue;
      }
      if (ch === "/" && peek(1) === "*") {
        readBlockComment();
        continue;
      }

      // Nested {
      if (ch === "{") {
        const s = snap();
        advance(1);
        pushToken("punctuator", "{", s, snap());
        depth++;
        continue;
      }

      // Closing }
      if (ch === "}") {
        const s = snap();
        advance(1);
        depth--;

        if (depth === 0) {
          // Emit special template-expression-closing token
          pushToken("template_expr_end", "}", s, snap());
          return;
        }

        pushToken("punctuator", "}", s, snap());
        continue;
      }

      // Generic scanning fallback
      simpleLoop();
    }

    if (depth !== 0) makeError("Unterminated template expression");
  }

  // Reads numeric literals:
  // - Decimal, float, exponent
  // - Binary, octal, hex
  // - Numeric separators `_`
  function readNumber() {
    const s = snap();
    let j = index;

    // Handle binary/octal/hex prefixes
    if (peek() === "0" && /[xXbBoO]/.test(peek(1))) {
      j = index + 2;
      const pfx = source[index+1];
      const re =
        (pfx === "x" || pfx === "X") ? /[0-9A-Fa-f_]/ :
        (pfx === "b" || pfx === "B") ? /[01_]/ :
        /[0-7_]/;

      while (j < len && re.test(source[j])) j++;

      const raw = source.slice(index, j);
      index = j;
      pushToken("number", raw, s, snap());
      return;
    }

    let sawDot = false;
    let sawExp = false;

    while (j < len) {
      const c = source[j];

      if (c === "_") {
        j++;
        continue;
      }

      if (c === ".") {
        if (sawDot) break;
        sawDot = true;
        j++;
        continue;
      }

      if (c === "e" || c === "E") {
        if (sawExp) break;
        sawExp = true;
        j++;
        if (/[+-]/.test(source[j])) j++;
        continue;
      }

      if (!/[0-9]/.test(c)) break;

      j++;
    }

    const raw = source.slice(index, j);
    index = j;
    pushToken("number", raw, s, snap());
  }

  // Reads identifiers and keywords (including unicode escapes inside identifiers).
  function readIdentifierOrKeyword() {
    const s = snap();
    let buf = "";

    // Unicode escape at beginning
    if (peek() === "\\" && peek(1) === "u") {
      const u = parseUnicodeEscape(index);
      if (!u) return makeError("Invalid unicode escape in identifier", s);
      buf += u.char;
      index = u.end;
    } else {
      buf += peek();
      advance(1);
    }

    while (index < len) {
      if (peek() === "\\" && peek(1) === "u") {
        const u = parseUnicodeEscape(index);
        if (!u) break;
        buf += u.char;
        index = u.end;
        continue;
      }

      if (!isIdContinue(peek())) break;

      buf += peek();
      advance(1);
    }

    const type = keywords.has(buf) ? "keyword" : "identifier";
    pushToken(type, buf, s, snap());
  }

  // Reads regular expression literals.
  // Handles character classes and escapes.
  function readRegexLiteral() {
    const s = snap();
    advance(1);
    let body = "/";
    let inClass = false;

    while (index < len) {
      const ch = peek();

      if (ch === "\\") {
        body += ch;
        advance(1);
        if (index < len) {
          body += peek();
          advance(1);
        }
        continue;
      }

      if (ch === "[") {
        inClass = true;
        body += ch;
        advance(1);
        continue;
      }

      if (ch === "]" && inClass) {
        inClass = false;
        body += ch;
        advance(1);
        continue;
      }

      if (ch === "/" && !inClass) {
        body += "/";
        advance(1);
        break;
      }

      if (ch === "\n" || ch === "\r")
        return makeError("Unterminated regex literal", s);

      body += ch;
      advance(1);
    }

    // Read flags
    let flags = "";
    while (index < len && /[a-z]/i.test(peek())) {
      flags += peek();
      advance(1);
    }

    pushToken("regex", body + flags, s, snap());
  }

  // Core scanning routine:
  // Determines the type of the next token by checking character categories in a prioritized order.
  // This is the main loop executed until input exhaustion.
  function simpleLoop() {
    const ch = peek();
    if (ch === undefined) return;

    if (/[ \t\v\f]/.test(ch)) {
      readWhitespace();
      return;
    }

    if (ch === "\r" || ch === "\n") {
      readNewline();
      return;
    }

    if (ch === "/" && peek(1) === "/") {
      readLineComment();
      return;
    }

    if (ch === "/" && peek(1) === "*") {
      readBlockComment();
      return;
    }

    if (ch === '"' || ch === "'") {
      readString(ch);
      return;
    }

    if (ch === "`") {
      readTemplate();
      return;
    }

    if (/[0-9]/.test(ch) || (ch === "." && /[0-9]/.test(peek(1)))) {
      readNumber();
      return;
    }

    if (isIdStart(ch) || (ch === "\\" && peek(1) === "u")) {
      readIdentifierOrKeyword();
      return;
    }

    const punct = matchPunctuator();
    if (punct) {
      // "/" is ambiguous: it may start a regex literal or be a division operator.
      if (punct === "/" && regexAllowedAfter(lastSignificantToken())) {
        readRegexLiteral();
        return;
      }
      const s = snap();
      advance(punct.length);
      pushToken("punctuator", punct, s, snap());
      return;
    }

    // Unknown single-character token fallback.
    const s = snap();
    advance(1);
    pushToken("unknown", ch, s, snap());
  }

  // Handle shebangs (#!) if allowed.
  if (cfg.allowShebang && source.startsWith("#!")) {
    const s = snap();
    let buf = "";
    while (index < len && peek() !== "\n") {
      buf += peek();
      advance(1);
    }
    pushToken("shebang", buf, s, snap());
  }

  // Main scanning loop.
  while (index < len) simpleLoop();

  return tokens;
}
