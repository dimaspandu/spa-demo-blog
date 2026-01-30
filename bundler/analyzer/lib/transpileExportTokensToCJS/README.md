# transpileExportTokensToCJS — Technical README

This document explains the internal architecture, algorithms, and transformation logic used by `transpileExportTokensToCJS()`. It focuses on the *computer-science perspective*: token‑based parsing, pattern‑detection automata, complexity, structural guarantees, and predictable rewriting rules.

The module rewrites **ESM export syntax** into **CommonJS** by operating directly on token arrays. It performs *pure syntactic transformation* without semantic interpretation.

---

## 1. Purpose of the Module

`transpileExportTokensToCJS(tokens)` converts all variations of `export` in JavaScript into equivalent CommonJS runtime behavior.

The challenge: ESM `export` supports many syntactic shapes, including inline declarations, re‑exports, aggregated exports, default exports, and tagged specifiers.

This transformer focuses strictly on **syntactic rewriting**, meaning:

* No AST is constructed.
* No scope analysis is done.
* No semantic resolution (e.g., "where is identifier declared?").

Because it works strictly at the token layer, the transformer is extremely fast and predictable.

---

## 2. Token-Level Architecture

The module processes a flat array of token objects:

```js
{ type: "keyword", value: "export" }
{ type: "identifier", value: "foo" }
{ type: "punctuator", value: "{" }
```

Similar to a lexer output.

### Internal Data Structures

#### 2.1 `bufferTokens`

Collects generated output tokens.

#### 2.2 `skippedIndex`

A hash table marking consumed token indices:

```js
skippedIndex[i] = 1
```

This ensures tokens are not printed twice.

#### 2.3 `tokens` (mutated in place)

Occasional `splice()` operations inject new tokens into the stream; however, the main iteration relies on skip markers, so pointer logic remains safe.

---

## 3. Algorithm Overview

The algorithm uses a **single-pass forward scan** with multi-token lookahead.

```
for each index i in tokens:
    if tokens[i] begins an export pattern:
        identify pattern shape
        rewrite into CJS tokens
        mark original tokens as skipped
    else if token not skipped:
        push token into output
return bufferTokens
```

### Complexity

* **Time:** O(n)
* **Space:** O(n)

The transformer is essentially a deterministic finite recognizer + emitter.

---

## 4. Supported Export Patterns

The transformer handles all principal ESM export forms.

### 4.1 Exporting Declarations

Patterns:

```
export const x = 1
export let a = 10, b = 20
export function foo() {}
export class Bar {}
```

Rewrite strategies:

1. Emit the declaration itself (unmodified) into output.
2. Emit additional assignment(s):

```
exports.x = x;
exports.foo = foo;
exports.Bar = Bar;
```

This preserves logical equivalence of named exports.

---

### 4.2 Exporting Previously Declared Identifiers

Pattern:

```
export { a, b as c }
```

Rewrite:

```
exports.a = a;
exports.c = b;
```

Algorithm:

* Detect opening `{` via `getDestructureEndIndex`.
* Walk comma-separated identifiers.
* Extract alias mapping.
* For each specifier, generate `exports[name] = local;` tokens.
* Skip original block.

---

### 4.3 Export From Another Module

Patterns:

```
export { a, b as c } from "mod"
export * from "mod"
export * as ns from "mod"
```

Because this transformer is token-only, it rewrites these into runtime `require()` calls + exported bindings.

Examples:

```
const __m = require("mod");
exports.a = __m.a;
exports.c = __m.b;
```

For namespace exports:

```
const __m = require("mod");
for (const key in __m) {
    if (key !== "default") exports[key] = __m[key];
}
```

(Actual implementation may vary depending on your exact semantics for star-exports.)

---

### 4.4 Export Default

Patterns:

```
export default expression
export default function() {}
export default function foo() {}
export default class {}
```

Rewrite strategy:

* Emit original declaration (sometimes wrapping anonymous forms).
* Assign to CommonJS:

```
module.exports = <expression>;
```

For anonymous inline function/class:

```
module.exports = function() {}
```

For named default function/class:

```
function Foo() {}
module.exports = Foo;
```

---

### 4.5 Bare Export (rare)

```
export {}
```

This produces no output. The transformer simply skips it.

---

## 5. Helper Mechanics

### 5.1 `getDestructureEndIndex(tokens, start)`

Finds matching `}` with a classic brace-balance scan.

### 5.2 `getObjectLiteralsEndIndex(tokens, start)`

Handles export statements with trailing metadata objects.

### 5.3 Temporary module aliases

Re-export-from modules generate an auto-generated alias:

```
__reexp1
```

These are purely lexical and guaranteed not to conflict with user variables because they never appear in the original token set.

---

## 6. Why Token-Based Instead of AST?

### Benefits:

* Extremely fast; no ECMAScript grammar overhead.
* Works well for code-generators, bundlers, embedded environments.
* Predictable transformation model.
* Dependencies kept minimal.

### Limitations:

* No scope resolution (shadowed names not detected).
* Cannot validate whether an exported name exists.
* Cannot merge star-exports accurately across complex module graphs.

This tradeoff is intentional: the transformer prioritizes speed and predictability.

---

## 7. Example Test Case Walkthrough

### Input tokens:

```
export const x = 1
```

### Output tokens:

```
const x = 1;
exports.x = x;
```

Breakdown:

1. Detect `export` + declaration.
2. Emit declaration unchanged.
3. Generate `exports.x = x;` tokens.
4. Mark original export tokens as skipped.

---

## 8. Summary of Workflow

```
1. Iterate through tokens
2. Detect shape of export (default, named, re-export, declaration)
3. Use balanced scanners to skip blocks safely
4. Emit CommonJS assignment constructs
5. Skip original ESM syntax
6. Output is deterministic, linear, side-effect free
```

This design forms a reliable middle layer for tools converting ESM → CommonJS using **pure token rewriting**.

---

If you want, I can also extend this README with:

* flowchart diagrams
* pseudo-code for each pattern handler
* ESM → CJS reference table
* test-by-test explanation

## License

MIT
