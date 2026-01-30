# extractModules

`extractModules(tokens)` is a lightweight, tokenizer-level module analyzer designed to detect three categories of module usage inside JavaScript source code:

1. **Static imports** — `import ... from "x"`, `import "x"`, and variations
2. **Dynamic imports** — `import("x")`, including options and assertions
3. **Export-from statements** — `export * from "x"`, `export { a, b } from "x"`

It operates entirely on **token arrays**, not ASTs, and uses a simple state machine–like linear scan.

This makes it suitable for environments where:

* Minimal parsing cost is required
* Only module detection is needed (not full code analysis)
* Input has already been tokenized (e.g., by a custom tokenizer or simple lexer)

---

## Overview of the Algorithm

At the highest level, the algorithm:

1. Iterates through the token list using a `while (i < tokens.length)` loop.
2. At each token, checks whether it begins one of the recognized module patterns.
3. When a pattern is detected, the algorithm delegates to a helper:

   * `parseStaticImport()`
   * `parseDynamicImport()`
   * `parseExportFrom()`
4. Each helper returns:

   * the extracted result object
   * the next index (`nextIndex`) to continue scanning
5. The result object is pushed into an accumulator list.
6. The loop continues until the end of the token array.

This results in a single-pass, O(n) time complexity, highly efficient for large files.

---

## High-Level Flow

```txt
┌───────────────────────────────────────────────────────────┐
│ Start                                                     │
└───┬───────────────────────────────────────────────────────┘
    │
    ▼
Scan token[i]
    │
    ├── import ? ──▶ dynamic or static import? ──▶ parse
    │
    ├── export ? ──▶ export-from pattern? ───────▶ parse
    │
    └── otherwise continue
    │
    ▼
Store result
    │
    ▼
Continue scanning
    │
    ▼
End
```

The control structure is intentionally simple, allowing predictable behavior and easy extension.

---

## Token-Based Pattern Detection

Because the system operates on tokens rather than AST nodes, pattern recognition depends purely on **local token shapes**, for example:

* Dynamic import is detected when encountering: `import` followed immediately by `(`.
* Static import requires `import` followed by either an identifier, a `{`, a `*`, or a string literal.
* Export-from is detected when `export` is followed by either `*` or a `{ ... }` block, plus a `from` keyword.

Using token patterns like these avoids the need for a parser but still captures all module references.

---

## Responsibilities of Helper Parsers

### `parseStaticImport(tokens, startIndex)`

Extracts the target module of any static import construct, handling:

* Default import
* Named imports `{ a, b as x }`
* Namespace imports `* as X`
* Side-effect imports
* `assert { ... }` or `with { ... }` syntax

It advances until the module string is found and optionally parses attributes.

### `parseDynamicImport(tokens, startIndex)`

Handles all forms of `import(...)`, including:

* Simple literal imports
* Template literal usage
* Options `{ with: { ... } }` or `{ assert: { ... } }`

Also detects when a dynamic import is **non-literal** (e.g., template with interpolation), setting:

```js
literal: false
reason: "template-literal"
```

### `parseExportFrom(tokens, startIndex)`

Captures `export ... from "module"` patterns without inspecting the exported names, because only the module origin is relevant.

---

## Data Structure of Results

Every extracted item has the following shape:

```ts
{
  module: string;      // "./file.js" or a template string
  type: "static" | "dynamic" | "export";
  assertions: object | null; // e.g. { type: "json" }
  literal: boolean;    // true for string literal, false for computed
  reason: string | null; // explanation for non-literal
}
```

This structure is consistent across all module forms, making downstream processing simple—for example:

* Generating dependency graphs
* Performing module resolution
* Extracting import metadata

---

## Why Use a Token-Based Approach?

### Advantages

* **Fast:** no parsing, no AST creation → O(n) scan
* **Robust:** unaffected by JS syntax outside import/export
* **Predictable:** minimal branching, explicit token patterns
* **Configurable:** helpers can be extended without rewriting the core loop

### Limitations

* It assumes **correct tokenization** (input must already be syntactically valid)
* Does **not** evaluate expressions (e.g., cannot calculate dynamic paths)
* Limited to module syntax detection, not full JS semantic analysis

---

## Summary

`extractModules()` acts like a very small, efficient scanner for modern JavaScript module syntax. By combining a simple linear algorithm with specialized helper parsers, it provides complete coverage of:

* Static `import`
* Dynamic `import(...)`
* `export ... from` forwarding

All without relying on AST parsing.

This makes it ideal for build tools, bundlers, analyzers, or compilers that simply need to **detect module dependencies** at the token level.

## License

MIT
