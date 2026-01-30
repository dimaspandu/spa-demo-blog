# JS Analyzer

JS Analyzer is a lightweight, **token-based analysis and transformation toolkit** for JavaScript and related web languages (CSS, HTML, JSON). Instead of building a full AST, it processes raw source code into compact token streams and applies deterministic, syntax-level transformations.

This README explains the core concepts, computational workflow, module responsibilities, and the actual project structure reflected by the test harness.

---

# 1. Core Concept

### Token-Level Processing

JS Analyzer operates on **token arrays**, not ASTs. This design keeps the system:

* simple to reason about,
* fast to execute,
* easy to extend,
* minimal in implementation.

Each tokenizer emits a flat list of tokens. All higher-level modules (minifiers, extractors, transpilers) operate by scanning or rewriting this token stream.

---

# 2. Project Structure

The repository is organized by **capability**, not by language runtime. Each capability has its own tokenizer, stringifier, transformer, and test suite.

```
js-analyzer/
│
├── lib/
│   ├── tokenizer/
│   │   ├── js/
│   │   ├── css/
│   │   ├── html/
│   │   └── json/
│   │
│   ├── stringifyTokens/
│   │   ├── js/
│   │   ├── css/
│   │   ├── html/
│   │   └── json/
│   │
│   ├── minifier/
│   │   ├── js/
│   │   ├── css/
│   │   ├── html/
│   │   └── json/
│   │
│   ├── extractModules/
│   ├── transpileImportTokensToCJS/
│   ├── transpileExportTokensToCJS/
│   └── convertESMToCJSWithMeta/
│
├── test/
│   └── index.js        # Aggregated test runner
│
├── utils/
├── LICENSE
└── README.md
```

Each module is fully decoupled and reusable on its own.

---

# 3. Test Aggregation Model

The project uses a **single entry test runner** that dynamically imports all test suites:

* tokenizer (JS, CSS, HTML, JSON)
* stringifyTokens (JS, CSS, HTML, JSON)
* minifier (JS, CSS, HTML, JSON)
* extractModules
* transpilers (import/export)
* ESM → CJS orchestration

This guarantees:

* consistent execution order
* zero implicit test registration
* explicit coverage across all capabilities

---

# 4. Computational Pipeline (JavaScript)

The JavaScript transformation workflow is a deterministic multi-stage pipeline:

1. **Tokenize** – Convert raw JS text into token objects.
2. **Extract Modules** – Detect `import` and `export` patterns.
3. **Transpile Imports** – Rewrite ESM imports to CommonJS `require`.
4. **Transpile Exports** – Rewrite ESM exports to `exports.*` / `module.exports`.
5. **Convert with Meta** – High-level orchestration returning code + metadata.
6. **Stringify Tokens** – Convert tokens back into JavaScript source.

All transformations are syntax-only and pattern-based.

---

# 5. Tokenizer (lib/tokenizer/*)

Tokenizers exist for multiple languages, each optimized for its grammar:

* JavaScript
* CSS
* HTML
* JSON

### General Rules

* Operates character-by-character
* Emits tokens for **all syntax elements**, including whitespace and newlines
* Does no semantic interpretation

Whitespace tokens are intentionally preserved to maintain positional fidelity for downstream transformations.

---

# 6. Minifiers (lib/minifier/*)

Minifiers are **language-specific**, but follow the same high-level strategy:

1. Tokenize source
2. Remove non-semantic tokens (whitespace, newlines, comments)
3. Re-stringify tokens

### Key Guarantees

* Strings are never altered
* Order is preserved
* No semantic rewrites
* Output is deterministic

JSON minification is implemented via **parse → stringify** for maximum correctness.

---

# 7. stringifyTokens (lib/stringifyTokens/*)

Stringifiers convert token arrays back into source code.

### Responsibilities

* Concatenate tokens in order
* Insert spacing only when required
* Preserve literal contents exactly

Because transformations are token-based, stringification remains simple and predictable.

---

# 8. extractModules (lib/extractModules/)

Scans JavaScript tokens to detect module-related syntax:

* static imports
* dynamic imports
* export declarations

The output is structured metadata describing module usage, without modifying code.

---

# 9. ESM → CJS Transpilation

## transpileImportTokensToCJS

Rewrites ESM imports into CommonJS `require` expressions.

Supports:

* default imports
* named imports
* namespace imports
* dynamic imports (mapped to configurable helpers)

## transpileExportTokensToCJS

Rewrites ESM exports into `exports.*` or `module.exports` assignments.

Handles:

* named exports
* default exports
* declaration exports

---

# 10. convertESMToCJSWithMeta

High-level orchestration that runs the full JS pipeline and returns:

```js
{
  code: string,
  meta: {
    module: string,
    type: "static" | "dynamic" | "export",
    assertions: object | null,
    literal: boolean,
    reason: null | "template-literal"
  }
}
```

This is useful for tooling, documentation generators, and dependency analysis.

---

# 11. End-to-End Flow Summary

```
Source Code
   ↓
Tokenizer
   ↓
Token Array
   ↓
extractModules
   ↓
transpileImportTokensToCJS
   ↓
transpileExportTokensToCJS
   ↓
stringifyTokens
   ↓
Final Output
```

---

# 12. Use Cases

JS Analyzer is suitable for:

* lightweight bundlers
* static dependency analysis
* experimental transpilers
* syntax normalization
* prototyping code rewriting tools

Each component can be used independently or as part of the full pipeline.

---

# 13. License

MIT License.
