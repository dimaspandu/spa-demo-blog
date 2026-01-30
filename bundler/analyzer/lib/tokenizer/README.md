# Ultra-Strict JavaScript Tokenizer Documentation

This document explains the design and operation of the ultra-strict JavaScript tokenizer implemented in `tokenizer/main.js`. It provides a detailed description of the algorithm, scanning rules, token classification logic, and how the tokenizer maintains deterministic behavior.

---

## Overview

The tokenizer performs a linear, deterministic scan of a JavaScript source string and emits a flat token stream. It does not construct an Abstract Syntax Tree (AST) or attempt to interpret syntactic meaning. Its purpose is to produce precise, position-aware lexical tokens suitable for tasks such as:

- Custom transpilers (e.g., ESM to CJS transforms)
- Static analysis
- Code modification tools (codemods)
- Experimental JavaScript tooling that requires predictable tokenization

---

## Core Design Principles

### 1. Deterministic Character-by-Character Scanning
The tokenizer processes input strictly from left to right. No backtracking or grammar-based parsing is performed.

### 2. Strict Token Categorization
The tokenizer differentiates between:

- Identifiers and keywords
- Punctuators and multi-character operators
- Numeric literals
- String literals
- Template literals (raw chunks and interpolation boundaries)
- Comments
- Regular expressions
- Whitespace and newlines

### 3. Positional Metadata
Every token includes:

```
{
  type,
  value,
  start,
  end,
  line,
  column
}
```

This allows consumers to implement accurate transformations and error reporting.

### 4. Close Alignment with Acorn/Babel
Although simpler, the tokenizer follows major lexical conventions used by established JavaScript parsers.

---

## Configuration

The exported `tokenizer(source, opts)` function supports:

- **throwOnError**: If true, tokenizer throws on malformed input (default: true)
- **allowShebang**: Recognizes Unix shebangs (`#!`) at the start of a file

---

## High-Level Scanning Algorithm

1. Initialize indexes, line/column counters, and token array.
2. If allowed, detect a shebang.
3. Enter a loop:
   - Inspect the next character
   - Select the appropriate reader routine
   - Emit a token
4. Stop when the entire input has been consumed.

The algorithm is purely lexical.

---

## Punctuator Matching (Trie-Based)

A prefix trie is constructed from the full list of JavaScript punctuators. This enables longest-match scanning, essential for operators such as:

- `===`
- `>>>`
- `=>`
- `?.`
- `...`

Trie matching ensures performance and correctness by avoiding repeated linear scans over operator lists.

---

## Identifier and Keyword Handling

The tokenizer supports:

- ASCII identifiers
- Unicode identifiers
- Unicode escapes (`\uXXXX` and `\u{X}`)

Keywords are recognized through a static `Set`.

If the identifier is a keyword, the token type becomes `"keyword"`; otherwise it is `"identifier"`.

---

## Number Literal Handling

The tokenizer supports:

- Decimal numbers
- Floating-point numbers
- Exponent notation
- Binary, octal, hexadecimal prefixes
- Numeric separators (`_`)

The number scanner stops when encountering a non-numeric character.

---

## String Literal Handling

Supports:

- Single quotes (`'`)
- Double quotes (`"`)

Escape sequences are recognized. Unterminated strings produce an error if `throwOnError` is enabled.

---

## Template Literal Handling

Template literals are scanned with:

- Raw template chunks (`template`, `template_chunk`)
- Expression boundaries (`template_expr_start`, `template_expr_end`)
- Nested parsing of `${ ... }` expressions
- Recursive handling of strings, templates, comments, and nested braces within expressions

Brace depth is tracked precisely to avoid premature closure.

---

## Comment Handling

### Line Comments
Recognized by `//`. The reader scans until newline or end-of-file.

### Block Comments
Recognized by `/* */`. Multi-line comments are supported. Unterminated comments produce an error.

---

## Regex Literal Handling

JavaScript regular expression literals are ambiguous with the division operator (`/`). The tokenizer uses context rules similar to Acorn/Babel:

- A slash is treated as regex if it can legally follow the previous token.
- A set of disallowed and allowed preceding token types determines this behavior.

The regex reader handles:

- Character classes
- Escapes
- Flags (`g`, `i`, `m`, etc.)

---

## Whitespace and Newline Handling

Whitespace is tokenized as `"whitespace"` and newlines as `"newline"`. Line/column tracking is updated accordingly.

This is critical for transformation tools that rely on positional accuracy.

---

## Unknown Characters

If the tokenizer encounters a character that does not fit any category, it emits an `"unknown"` token.

---

## Error Handling

Errors such as:

- Unterminated strings
- Unterminated block comments
- Unterminated regex literals
- Invalid unicode escapes

are reported via `SyntaxError` (unless configured otherwise).

---

## Output

The tokenizer always returns an array of structured tokens:

```
[
  { type: "keyword", value: "export", start: 0, end: 6, line: 1, column: 0 },
  { type: "identifier", value: "foo", start: 7, end: 10, line: 1, column: 7 },
  ...
]
```

Whitespace, comments, and newlines are preserved as separate tokens for maximum fidelity.

---

## File Layout

```
tokenizer/
  main.js       // Implementation
  README.md     // This documentation
```

---

## Summary

This tokenizer is designed to serve as a predictable and strict lexical layer for JavaScript transformation pipelines. Its major strengths include:

- Deterministic character scanning
- Unicode-aware identifier parsing
- Accurate template literal processing
- Longest-match punctuator resolution via trie
- Contextual regex recognition
- Full positional metadata

Its simplicity and precision make it suitable for advanced tooling without requiring a full parser.

## License

MIT

