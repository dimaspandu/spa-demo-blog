# stringifyTokens

This document explains the internal computational model, algorithmic rules, token–spacing heuristics, and structural design of the `stringifyTokens()` function. The goal is to give a clear understanding of **how the tokenizer-to-source reconstruction works**, why certain spacing rules exist, and how correctness is preserved without performing full pretty-printing.

---

## 1. Purpose of the Module

`stringifyTokens(tokens)` converts an array of **flat token objects** back into a JavaScript source string. It is designed as the inverse of a tokenizer for the purpose of:

* test normalization,
* round‑tripping tokens → minimal source code,
* safe reconstruction without introducing syntactic errors.

This module is *not* a formatter. It does **not** try to beautify or re-indent; it only inserts spaces where absolutely necessary to prevent accidental merging of tokens into unintended larger tokens.

---

## 2. Token Structure

Each token is expected to have at least:

```
{ type: "identifier" | "keyword" | "number" | "string" | "punctuator" | "template" | "privateIdentifier", value: "..." }
```

These types drive all spacing decisions.

---

## 3. High-Level Algorithm

The reconstruction algorithm is a **single-pass linear scan**:

```
let out = ""
for each token c at index i:
    let p = tokens[i-1] (if any)
    if template involved: append c.value
    else determine if a space is required between p and c
    append (space?) + c.value
return out
```

The process is deterministic and O(n) in time and O(1) in extra memory.

---

## 4. Core Spacing Rules

The key challenge is determining if two adjacent tokens must be separated by a space to avoid forming illegal or unintended JavaScript syntax.

### 4.1 Template Literal Tokens

Templates are considered **atomic**:

* No inserted spaces
* Adjacent tokens concatenate directly

Reason: Template delimiters (`` ` ``, `${`, `}`) cannot be spaced without breaking semantics.

### 4.2 Word-like Tokens

A "word-like" token means:

* identifier
* keyword
* private identifier (#x)

Rules:

* Word + word → must insert space
* Word + private id → must insert space
* Private id + word → must insert space

Examples:

```
letx      // wrong
let x     // correct
foo#bar   // wrong
foo #bar  // correct
```

### 4.3 Numbers Adjacent to Words

Numbers must not merge with identifiers:

```
1in    // invalid
1 in   // valid
```

Therefore:

* number + word → space
* word + number → space (safe rule)

### 4.4 Punctuator Edge Cases

Certain punctuator pairs must be spaced to prevent unintended operators.
A helper function `needsPunctuatorSpace(a, b)` handles this.

Cases:

* `--` + `>` → would form `-->` (JSX closing syntax)
* `+` + `++` → would merge into `+++`
* `-` + `--` → would merge into `----`

Default: no spacing.

---

## 5. Pseudocode Model

```
out = ""
for i in 0..len(tokens)-1:
    c = tokens[i]
    p = tokens[i-1] or null

    if p is null:
        out += c.value
        continue

    if p.type == "template" or c.type == "template":
        out += c.value
        continue

    needSpace = false

    if (word(p) and word(c)) or (word(p) and private(c)) or (private(p) and word(c)):
        needSpace = true

    if number(p) and (word(c) or private(c)):
        needSpace = true

    if word(p) and number(c):
        needSpace = true

    if punct(p) and punct(c) and needsPunctSpace(p.value, c.value):
        needSpace = true

    out += (needSpace ? " " : "") + c.value
return out
```

---

## 6. Why This Approach Works

The tokenizer already resolved all ambiguous contexts, such as:

* `/regex/` vs division operator,
* multi-character punctuators (`==`, `===`, `=>`),
* spread vs rest operator.

Therefore, reconstruction does **not** need to re-evaluate syntactic ambiguity. It only ensures tokens do not merge into invalid forms.

By restricting itself to **minimal spacing**, `stringifyTokens()` guarantees:

* deterministic tests,
* compact code representation,
* reversible token stream semantics.

---

## 7. Test Suite Interpretation

The tests verify correctness across:

### 7.1 Import / Export reconstruction

Ensures keywords, identifiers, braces, and strings do not accidentally merge.

Examples:

```
import A from"x";
export{a,b}
export default()=>x
```

### 7.2 Literal reconstruction

```
export"hello"
export 123
export`hello`
```

No spaces added unless required.

### 7.3 Template literals

```
import A from`x/${y}`
export default`x`
```

Ensures templates remain unmodified.

### 7.4 Punctuator safety

```
-- >
+ ++
- --
```

Spacing applied only in ambiguous cases.

### 7.5 Mixed constructs

```
import X from"m1"export X
```

Multiple statements serialized tightly without extra semicolons.

All tests demonstrate the same principle: **spacing is only inserted if omitting it would break JavaScript syntax or change its meaning**.

---

## 8. Summary

`stringifyTokens()` is a:

* linear-time,
* deterministic,
* space-minimal,
* syntax-preserving token assembler.

It performs **micro-spacing** logic rather than formatting, making it perfect for:

* token-based transforms,
* JS transpiler pipelines,
* automated tests that require stable minimal output,
* low-overhead source-code manipulation tools.

## License

MIT
