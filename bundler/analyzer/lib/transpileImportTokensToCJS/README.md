# transpileImportTokensToCJS — Technical README

This document explains the internal design, algorithmic structure, and transformation workflow of `transpileImportTokensToCJS()`. It is written for developers who want to understand how the engine works from a computer‑science perspective rather than just as a user‑facing tool.

---

## 1. Purpose and Architecture Overview

`transpileImportTokensToCJS(tokens, dynamicImportIdentifier)` is a **syntactic transformer**: it rewrites *token arrays* representing ESM import syntax into their equivalent **CommonJS** constructs.

Important architectural points:

* **Token‑to‑token transformer** — operates on *already tokenized* JavaScript code.
* **Not a parser**, not an interpreter — no AST, no semantic validation, no scope analysis.
* **Linear scan with local pattern matching** — uses a predictable O(n) algorithm.
* **Mutation‑based strategy** — occasionally `splice()` modifies the stream, but via careful index handling.
* **Skip‑map model** (`skippedIndex`) — avoids double‑emitting tokens.

Conceptually, the module behaves like a lightweight compiler pass that detects syntactic patterns and emits rewritten token sequences.

---

## 2. Core Data Structures

### 2.1 `tokens`

The raw token array. Elements look like:

```js
{ type: "identifier", value: "import" }
{ type: "punctuator", value: "{" }
{ type: "string", value: "\"mod\"" }
```

Assumptions:

* Whitespace/comments are removed.
* Adjacent syntactic tokens are intact.

### 2.2 `bufferTokens`

The output accumulator. All transformed tokens are pushed here in order.
This is the primary return value.

### 2.3 `skippedIndex`

A hash table mapping token indices to `1`.

```js
skippedIndex[12] = 1;
```

Meaning: *“do not output the original token at index 12.”*

This enables rewriting while keeping the main loop simple. When a complex import pattern is consumed, all consumed indices are marked as skipped.

---

## 3. High‑Level Algorithm

At its core, the algorithm is:

```
for each token i in tokens:
    if token i begins an ESM import pattern:
        parse pattern
        emit new CJS tokens into bufferTokens
        mark consumed tokens as skipped
    else if not skipped:
        copy token to bufferTokens
return bufferTokens
```

### Complexity

* **Time:** O(n) — single linear scan.
* **Space:** O(n) — output size proportional to input + inserted require() tokens.

---

## 4. Pattern-Matching Strategy

The transformer matches imports using **deterministic lookahead**.
No backtracking, no recursion. Every branch tests tokens using fixed offsets:

```js
next(1), next(2), next(3)
```

The patterns and their rewrites:

---

## 5. Transformation Rules (By Pattern)

Each rule checks a specific syntactic shape.
Below are the major categories and how they are rewritten.

### 5.1 Default Import

Pattern:

```
import A from "mod"
```

Rewrite:

```
const A = require("mod").default;
```

Mechanism:

* Insert `const`
* Rewrite `from` → `=`
* Splice: `require ( "mod" ) . default ;`
* Skip trailing `assert {}` or semicolon

### 5.2 Named Import (Destructuring)

Pattern:

```
import { a, b as x } from "mod"
```

Rewrite:

```
const a = require("mod").a;
const x = require("mod").b;
```

Algorithm:

* `getDestructureEndIndex()` locates the matching `}`.
* Walk each identifier and generate a line.
* Skip original structure.

### 5.3 Default + Named

Pattern:

```
import d, { a, b } from "mod"
```

Combined rewrite:

```
const d = require("mod").default;
const a = require("mod").a;
const b = require("mod").b;
```

Same destructuring logic as above.

### 5.4 Namespace Import

Pattern:

```
import * as ns from "mod"
```

Rewrite:

```
const ns = require("mod");
```

Inserts one simple assignment.

### 5.5 Default + Namespace

Pattern:

```
import d, * as ns from "mod"
```

Rewrite:

```
const ns = require("mod");
const d = ns.default;
```

Requires reading both bindings and emitting two separate constants.

### 5.6 Bare Import

Pattern:

```
import "mod"
```

Rewrite:

```
require("mod");
```

Side‑effect only.

### 5.7 Dynamic Import

Pattern:

```
import("mod")
```

Rewrite:

```
dynamicImportIdentifier("mod");
```

Where `dynamicImportIdentifier` defaults to:

```
requireByHttp
```

Uses `getDynamicImportEndIndex()` to skip nested parentheses.

---

## 6. Helper: `generateRequireTokens()`

This function builds the minimal token sequence for:

```
require("mod")
```

It returns:

```js
[
  { type: "identifier", value: "require" },
  { type: "punctuator", value: "(" },
  modulePathToken,
  { type: "punctuator", value: ")" },
]
```

Used throughout named/namespace import logic.

---

## 7. Handling `assert` and `with` Clause

ESM allows metadata after imports:

```
import x from "y" assert { type: "json" }
```

This transformer **ignores** the clause entirely.
Algorithm:

1. Detect keyword `assert` or `with`
2. Skip the entire object literal via `getObjectLiteralsEndIndex()`
3. Skip optional semicolon

This keeps the transformer syntactic and avoids semantic interpretation.

---

## 8. Why Skip-Map Instead of Removing Tokens?

Because removing tokens would shift indices and break lookahead.
Instead:

```
skippedIndex[i] = 1
```

allows safe pattern‑matching while leaving original tokens in place.

This results in:

* deterministic pointer movement
* fewer mutation hazards
* simpler mental model

---

## 9. Example From the Test Suite

### Input tokens

```
import DefaultExport from "mod"
```

### Output tokens

```
const DefaultExport = require("mod").default;
```

The test confirms exact match between EXPECTED and RESULT.

---

## 10. Summary

`transpileImportTokensToCJS()` is a:

* fast,
* single‑pass,
* token‑pattern‑matching,
* side‑effect–free
  transformer specializing in ESM → CommonJS rewrites.

Its design emphasizes **predictability, simplicity, and portability** rather than full JavaScript semantics. This makes it ideal for build tools, prototype bundlers, or environments needing minimal dependency footprints.

---

If you want, I can also generate:

* an architecture diagram,
* algorithm pseudocode,
* a test‑mapping table,
* or a section describing common pitfalls when mutating token streams.

## License

MIT
