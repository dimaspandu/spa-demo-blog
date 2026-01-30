# convertESMToCJSWithMeta

A high‑level transformation pipeline that converts ES Module syntax (`import` / `export`) into CommonJS **while preserving complete module metadata**. This README explains the algorithm in clear computer‑science terms, including processing stages, data flow, token transformations, and the reasoning behind the architecture.

---

## 1. Purpose

`convertESMToCJSWithMeta(code)` performs two tasks simultaneously:

1. **Transpile ESM → CJS** into executable CommonJS JavaScript
2. **Extract structured metadata** about all modules referenced by the source

This enables:

* Static analysis
* Tooling / bundling
* Dependency graph generation
* Custom runtime behavior

The core design choice: **everything is done at the token level, not AST**, allowing simplicity and predictability.

---

## 2. High‑level Pipeline

The function is structured as a **four‑stage deterministic pipeline**:

```
Raw Source Code
       │
       ▼
[1] Tokenization
       │ filtered tokens
       ▼
[2] Metadata Extraction
       │ meta[]
       ▼
[3] Transform ESM → CJS
       │ transformed tokens
       ▼
[4] Token Stringification
       │
       ▼
Final CJS Code
```

Each stage is pure and independent. The same token list flows through the pipeline.

---

## 3. Stage 1 — Tokenization

### Goal

Convert raw JavaScript into a **flat stream of tokens**, then remove tokens irrelevant for structural analysis:

* whitespace
* newlines
* comments

### Result

A minimal token list where every element carries:

```
{
  type: "keyword" | "identifier" | "punctuator" | ... ,
  value: string
}
```

This creates a lightweight lexical representation (similar to a simplified lexer), ideal for manual token transformations.

---

## 4. Stage 2 — Metadata Extraction

Performed by: `extractModules(cleanedTokens)`

### Algorithm

A **single scan** walks through the token list and identifies:

* static imports (`import x from "..."`)
* dynamic imports (`import("...")`)
* re‑exports (`export * from "..."`)
* export‑from lists (`export {a} from "..."`)

For each match it builds metadata entries:

```
{
  module: string,
  type: "static" | "dynamic" | "export",
  assertions: object | null,
  literal: boolean,
  reason: null | "template-literal"
}
```

### Notes

* Metadata stage **does not mutate tokens**.
* Template literals are detected and marked `literal: false`.
* Module attributes (classic `assert {}` or `with {}`) are parsed and stored.

---

## 5. Stage 3 — ESM → CJS Token Transformation

### Overview

Two transformers mutate the token list:

```
transpileExportTokensToCJS(cleanedTokens)
→ transpileImportTokensToCJS(...)
```

Imports must run **after** exports to preserve execution ordering rules.

### Examples of transformations

#### Static import

```
import A from "x"
→ tokens for: const A = require("x").default;
```

#### Named import list

```
import {a, b} from "m"
→ const a=require("m").a; const b=require("m").b;
```

#### Export named

```
export { a }
→ exports.a = a;
```

#### Re‑export all

```
export * from "mod"
→ Object.assign(exports, require("mod"));
```

#### Dynamic import

```
import("x")
→ requireByHttp("x")
```

#### Dynamic import with attributes

```
import("x", { assert: { type: "json" } })
→ requireByHttp("x", { assert:{type:"json"} })
```

Each transformation overwrites tokens *surgically* (no AST), ensuring predictable output.

---

## 6. Stage 4 — Token Stringification

Performed by: `stringifyTokens(transformedTokens)`

### Role

Re‑assemble the final JavaScript text **without pretty‑printing**.

### Rules applied

* Minimal necessary spacing to prevent token merging
* No formatting or indentation
* Template literals are treated as atomic

This ensures that:

```
[{type:"identifier", value:"import"}, {type:"identifier", value:"x"}]
→ "import x"
```

not `importx`.

The goal is structural correctness, not aesthetics.

---

## 7. Output Structure

The returned object:

```
{
  code: "…CJS code…",
  meta: [ … metadata entries … ]
}
```

Both values derive from **the same token stream**, guaranteeing synchronization between transformed code and metadata.

---

## 8. Why This Architecture Works

### Predictable

No AST complexity — transformations are linear token rewrites.

### Safe

Stringification prevents unintended merges and preserves syntactic correctness.

### Composable

Any stage can be replaced or enhanced independently (e.g., custom metadata parser, alternate transpilation rules).

### Fully Deterministic

Same input → same output, guaranteed by stable token processing.

---

## 9. Test Suite Coverage

The provided tests confirm correctness across:

* default, named, namespace, and side‑effect imports
* module assertions (`assert {}` and `with {}`)
* dynamic imports with options
* template literal paths
* re‑exports and mixed export forms
* alias resolution
* nested / chained dynamic imports

The transformation intentionally mirrors real bundlers like Rollup/ESBuild—but with low‑level token control and full metadata extraction.

---

## 10. Summary

`convertESMToCJSWithMeta` is a predictable, token‑level, multi‑stage compiler pipeline for converting ESM into CJS while producing complete dependency metadata.

Its design emphasizes:

* deterministic output
* small surface area
* modular processing steps
* non‑AST simplicity
* high transparency suitable for tooling and analysis

If you want, I can also generate:

* A flowchart diagram
* Sequence diagrams for import and export rewrites
* Extended deep‑dive into token formats and walker algorithms

## License

MIT
