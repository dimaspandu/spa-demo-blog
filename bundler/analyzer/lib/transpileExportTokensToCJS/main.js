import getArrayLiteralsEndIndex from "../../utils/getArrayLiteralsEndIndex.js";
import getDestructureEndIndex from "../../utils/getDestructureEndIndex.js";
import getExportBlockEndIndex from "../../utils/getExportBlockEndIndex.js";
import getObjectLiteralsEndIndex from "../../utils/getObjectLiteralsEndIndex.js";
import getShallowDestructureEndIndex from "../../utils/getShallowDestructureEndIndex.js";

/**
 * Rearranges ES module export syntax into CommonJS export assignments.
 *
 * This function walks through a flat token list and:
 * - Detects various patterns of ES "export" statements.
 * - Converts them into equivalent CommonJS `exports.* = ...` forms.
 * - Tracks tokens that should be skipped or replaced.
 * - Maintains output order: normal code first (bufferTokens), export statements later (exportTokens).
 *
 * Logic strictly matches original behavior.
 */
export default function transpileExportTokensToCJS(tokens) {
  const bufferTokens = [];
  const exportTokens = [];
  const skippedIndex = {};
  const iclosedIndex = {};

  // ---------------------------------------------------------
  // Helper functions
  // ---------------------------------------------------------

  /** Pushes a token object into a target array. */
  const push = (arr, type, value) => {
    arr.push({ type, value });
  };

  /** Generates: exports.identifier = identifier; */
  const pushExportAssign = (identifier) => {
    push(exportTokens, "identifier", "exports");
    push(exportTokens, "punctuator", ".");
    push(exportTokens, identifier.type, identifier.value);
    push(exportTokens, "punctuator", "=");
    push(exportTokens, identifier.type, identifier.value);
    push(exportTokens, "punctuator", ";");
  };

  /** Pushes: exports.default = */
  const pushExportsDotDefaultEq = (arr = exportTokens) => {
    push(arr, "identifier", "exports");
    push(arr, "punctuator", ".");
    push(arr, "identifier", "default");
    push(arr, "punctuator", "=");
  };

  for (let i = 0; i < tokens.length; i++) {
    const idx = i;
    const cur = tokens[idx];

    const next = (n) => tokens[idx + n];

    /** Checks if a token is the semicolon punctuator. */
    const isSemi = (t) => t && t.type === "punctuator" && t.value === ";";

    /** Marks index to skip if token at pos is a semicolon. */
    const skipIfSemi = (pos) => {
      if (isSemi(tokens[pos])) {
        skippedIndex[pos] = 1;
      }
    };

    /** Ensures a semicolon exists at the insert position. */
    const ensureSemicolon = (tokens, checkIndex, insertIndex = checkIndex) => {
      if (!isSemi(tokens[checkIndex])) {
        tokens.splice(insertIndex, 0, { type: "punctuator", value: ";" });
      }
    };

    // export const a1 = 1
    // export let b1 = 2
    // export var c1 = 3
    // export /* comment */ const commented1 = 100
    // ;export const startingSemicolon = true
    // and similar variations
    if (
      cur.type === "keyword" &&
      cur.value === "export" &&
      next(1) &&
      next(2) &&
      next(3) &&
      next(1).type === "keyword" &&
      next(2).type === "identifier" &&
      next(3).type === "punctuator" &&
      next(3).value === "="
    ) {
      const endIndex = getExportBlockEndIndex(tokens, idx);
      ensureSemicolon(tokens, endIndex, endIndex + 1);
      pushExportAssign(tokens[idx + 2]);
    }

    // export let noValue
    // export var emptyValue
    else if (
      cur.type === "keyword" &&
      cur.value === "export" &&
      next(1) &&
      next(2) &&
      next(1).type === "keyword" &&
      (next(1).value === "var" ||
        next(1).value === "let" ||
        next(1).value === "const") &&
      next(2).type === "identifier" &&
      (!tokens[idx + 3] || (next(3) && next(3).value !== "="))
    ) {
      const endIndex = idx + 3;
      ensureSemicolon(tokens, endIndex);
      pushExportAssign(tokens[idx + 2]);
    }

    // export { lib.foo, lib.bar }
    // (shallow destructuring with dot expressions)
    else if (
      cur.type === "keyword" &&
      cur.value === "export" &&
      next(1) &&
      next(2) &&
      next(3) &&
      next(4) &&
      next(1).type === "punctuator" &&
      next(1).value === "{" &&
      next(2).type === "identifier" &&
      next(3).type === "punctuator" &&
      next(3).value === "." &&
      next(4).type === "identifier"
    ) {
      const endIndex = getShallowDestructureEndIndex(tokens, idx + 1);

      skippedIndex[idx] = 1;

      for (let j = idx + 1; j <= endIndex; j++) {
        skippedIndex[j] = 1;

        if (j === endIndex) {
          skipIfSemi(j + 1);
        }

        const tPrev = tokens[j - 1];
        const tNext3 = tokens[j + 3];

        const isBraceBrace =
          tPrev.type === "punctuator" &&
          tPrev.value === "{" &&
          tNext3.type === "punctuator" &&
          tNext3.value === "}";

        const isBraceComma =
          tPrev.type === "punctuator" &&
          tPrev.value === "{" &&
          tNext3.type === "punctuator" &&
          tNext3.value === ",";

        const isCommaComma =
          tPrev.type === "punctuator" &&
          tPrev.value === "," &&
          tNext3.type === "punctuator" &&
          tNext3.value === ",";

        const isCommaBrace =
          tPrev.type === "punctuator" &&
          tPrev.value === "," &&
          tNext3.type === "punctuator" &&
          tNext3.value === "}";

        if (isBraceBrace || isBraceComma ||  isCommaComma ||isCommaBrace) {
          exportTokens.push({ type: "identifier", value: "exports" });
          exportTokens.push({ type: "punctuator", value: "." });
          exportTokens.push({
            type: tokens[j + 2].type,
            value: tokens[j + 2].value
          });
          exportTokens.push({ type: "punctuator", value: "=" });

          const hasFrom =
            tokens[endIndex + 1].type === "identifier" &&
            tokens[endIndex + 1].value === "from";

          if (hasFrom) {
            skippedIndex[endIndex + 1] = 1;
            skippedIndex[endIndex + 2] = 1;
            skippedIndex[endIndex + 3] = 1;

            exportTokens.push({ type: "identifier", value: "require" });
            exportTokens.push({ type: "punctuator", value: "(" });
            exportTokens.push({
              type: tokens[endIndex + 2].type,
              value: tokens[endIndex + 2].value
            });
            exportTokens.push({ type: "punctuator", value: ")" });
            exportTokens.push({ type: "punctuator", value: "." });
            exportTokens.push({
              type: tokens[j].type,
              value: tokens[j].value
            });
            exportTokens.push({
              type: tokens[j + 1].type,
              value: tokens[j + 1].value
            });
            exportTokens.push({
              type: tokens[j + 2].type,
              value: tokens[j + 2].value
            });
            exportTokens.push({ type: "punctuator", value: ";" });
          } else {
            exportTokens.push({
              type: tokens[j].type,
              value: tokens[j].value
            });
            exportTokens.push({
              type: tokens[j + 1].type,
              value: tokens[j + 1].value
            });
            exportTokens.push({
              type: tokens[j + 2].type,
              value: tokens[j + 2].value
            });
            exportTokens.push({ type: "punctuator", value: ";" });
          }
        }
      }
    }

    // export { x, y }
    // export { a as b }
    // export { foo, bar } from "./module.js"
    // (deep destructuring)
    else if (
      cur.type === "keyword" &&
      cur.value === "export" &&
      next(1) &&
      next(1).type === "punctuator" &&
      next(1).value === "{"
    ) {
      const endIndex = getDestructureEndIndex(tokens, idx + 1);

      skippedIndex[idx] = 1;
      for (let j = idx + 1; j <= endIndex; j++) {
        skippedIndex[j] = 1;

        if (j === endIndex) {
          skipIfSemi(j + 1);
        }

        const tPrev = tokens[j - 1];
        const tNext1 = tokens[j + 1];

        const isBraceBrace =
          tPrev.type === "punctuator" &&
          tPrev.value === "{" &&
          tNext1.type === "punctuator" &&
          tNext1.value === "}";

        const isBraceComma =
          tPrev.type === "punctuator" &&
          tPrev.value === "{" &&
          tNext1.type === "punctuator" &&
          tNext1.value === ",";

        const isCommaComma =
          tPrev.type === "punctuator" &&
          tPrev.value === "," &&
          tNext1.type === "punctuator" &&
          tNext1.value === ",";

        const isCommaBrace =
          tPrev.type === "punctuator" &&
          tPrev.value === "," &&
          tNext1.type === "punctuator" &&
          tNext1.value === "}";

        if (isBraceBrace || isBraceComma || isCommaComma || isCommaBrace) {
          exportTokens.push({ type: "identifier", value: "exports" });
          exportTokens.push({ type: "punctuator", value: "." });
          exportTokens.push({
            type: tokens[j].type,
            value: tokens[j].value
          });
          exportTokens.push({ type: "punctuator", value: "=" });

          const hasFrom =
            tokens[endIndex + 1].type === "identifier" &&
            tokens[endIndex + 1].value === "from";

          if (hasFrom) {
            skippedIndex[endIndex + 1] = 1;
            skippedIndex[endIndex + 2] = 1;
            skippedIndex[endIndex + 3] = 1;

            exportTokens.push({ type: "identifier", value: "require" });
            exportTokens.push({ type: "punctuator", value: "(" });
            exportTokens.push({
              type: tokens[endIndex + 2].type,
              value: tokens[endIndex + 2].value
            });
            exportTokens.push({ type: "punctuator", value: ")" });
            exportTokens.push({ type: "punctuator", value: "." });
            exportTokens.push({
              type: tokens[j].type,
              value: tokens[j].value
            });
            exportTokens.push({ type: "punctuator", value: ";" });
          } else {
            exportTokens.push({
              type: tokens[j].type,
              value: tokens[j].value
            });
            exportTokens.push({ type: "punctuator", value: ";" });
          }
        }

        else if (
          tokens[j + 1].type === "identifier" &&
          tokens[j + 1].value === "as"
        ) {
          exportTokens.push({ type: "identifier", value: "exports" });
          exportTokens.push({ type: "punctuator", value: "." });
          exportTokens.push({
            type: tokens[j + 2].type,
            value: tokens[j + 2].value
          });
          exportTokens.push({ type: "punctuator", value: "=" });

          const hasFrom =
            tokens[endIndex + 1].type === "identifier" &&
            tokens[endIndex + 1].value === "from";

          if (hasFrom) {
            skippedIndex[endIndex + 1] = 1;
            skippedIndex[endIndex + 2] = 1;
            skippedIndex[endIndex + 3] = 1;

            exportTokens.push({ type: "identifier", value: "require" });
            exportTokens.push({ type: "punctuator", value: "(" });
            exportTokens.push({
              type: tokens[endIndex + 2].type,
              value: tokens[endIndex + 2].value
            });
            exportTokens.push({ type: "punctuator", value: ")" });
            exportTokens.push({ type: "punctuator", value: "." });
            exportTokens.push({
              type: tokens[j].type,
              value: tokens[j].value
            });
            exportTokens.push({ type: "punctuator", value: ";" });
          } else {
            exportTokens.push({
              type: tokens[j].type,
              value: tokens[j].value
            });
            exportTokens.push({ type: "punctuator", value: ";" });
          }
        }
      }
    }

    // export default function myFunc() {}
    else if (
      cur.type === "keyword" &&
      cur.value === "export" &&
      next(1) &&
      next(2) &&
      next(3) &&
      next(4) &&
      next(1).type === "keyword" &&
      next(1).value === "default" &&
      next(2).type === "keyword" &&
      (next(2).value === "function" || next(2).value === "class") &&
      next(3).type === "identifier" &&
      next(4).type === "punctuator" &&
      (next(4).value === "(" || next(4).value === "{")
    ) {
      skippedIndex[idx] = 1;
      skippedIndex[idx + 1] = 1;

      pushExportsDotDefaultEq();
      exportTokens.push({
        type: next(3).type,
        value: next(3).value
      });
      exportTokens.push({ type: "punctuator", value: ";" });
    }

    // export default function (
    else if (
      cur.type === "keyword" &&
      cur.value === "export" &&
      next(1) &&
      next(2) &&
      next(3) &&
      next(1).type === "keyword" &&
      next(1).value === "default" &&
      next(2).type === "keyword" &&
      next(2).value === "function" &&
      next(3).type === "punctuator" &&
      next(3).value === "("
    ) {
      skippedIndex[idx] = 1;
      skippedIndex[idx + 1] = 1;

      const endIndex = getExportBlockEndIndex(tokens, idx);
      iclosedIndex[endIndex] = 1;

      pushExportsDotDefaultEq(bufferTokens);
    }

    // export default (function (
    else if (
      cur.type === "keyword" &&
      cur.value === "export" &&
      next(1) &&
      next(2) &&
      next(3) &&
      next(4) &&
      next(1).type === "keyword" &&
      next(1).value === "default" &&
      next(2).type === "punctuator" &&
      next(2).value === "(" &&
      next(3).type === "keyword" &&
      next(3).value === "function" &&
      next(4).type === "punctuator" &&
      next(4).value === "("
    ) {
      skippedIndex[idx] = 1;
      skippedIndex[idx + 1] = 1;

      pushExportsDotDefaultEq(bufferTokens);
    }

    // export default class { ... }
    else if (
      cur.type === "keyword" &&
      cur.value === "export" &&
      next(1) &&
      next(2) &&
      next(3) &&
      next(1).type === "keyword" &&
      next(1).value === "default" &&
      next(2).type === "keyword" &&
      next(2).value === "class" &&
      next(3).type === "punctuator" &&
      next(3).value === "{"
    ) {
      skippedIndex[idx] = 1;
      skippedIndex[idx + 1] = 1;

      const endIndex = getExportBlockEndIndex(tokens, idx);
      ensureSemicolon(tokens, endIndex + 1);

      pushExportsDotDefaultEq(bufferTokens);
    }

    // export * from "module"
    else if (
      cur.type === "keyword" &&
      cur.value === "export" &&
      next(1) &&
      next(2) &&
      next(3) &&
      next(1).type === "punctuator" &&
      next(1).value === "*" &&
      next(2).type === "identifier" &&
      next(2).value === "from" &&
      next(3).type === "string"
    ) {
      bufferTokens.push({ type: "identifier", value: "Object" });

      next(1).value = ".";
      next(2).value = "assign";

      tokens.splice(idx + 3, 0, { type: "punctuator", value: "(" });
      tokens.splice(idx + 4, 0, { type: "identifier", value: "exports" });
      tokens.splice(idx + 5, 0, { type: "punctuator", value: "," });
      tokens.splice(idx + 6, 0, { type: "identifier", value: "require" });
      tokens.splice(idx + 7, 0, { type: "punctuator", value: "(" });
      tokens.splice(idx + 9, 0, { type: "punctuator", value: ")" });
      tokens.splice(idx + 10, 0, { type: "punctuator", value: ")" });

      const endIndex = idx + 11;
      ensureSemicolon(tokens, endIndex);
    }

    // export default const app1
    else if (
      cur.type === "keyword" &&
      cur.value === "export" &&
      next(1) && next(2) && next(3) &&
      next(1).type === "keyword" && next(1).value === "default" &&
      (
        next(2).type === "keyword" &&
        (
          next(2).value === "const" ||
          next(2).value === "let" ||
          next(2).value === "var"
        )
      )
      &&
      next(3).type === "identifier"
    ) {
      skippedIndex[idx] = 1;
      skippedIndex[idx + 1] = 1;

      exportTokens.push({ type: "identifier", value: "exports" });
      exportTokens.push({ type: "punctuator", value: "." });
      exportTokens.push({ type: "identifier", value: "default" });
      exportTokens.push({ type: "punctuator", value: "=" });
      exportTokens.push({ type: tokens[idx + 3].type, value: tokens[idx + 3].value });
      exportTokens.push({ type: "punctuator", value: ";" });
      
      const endIndex = idx + 4;
      ensureSemicolon(tokens, endIndex);
    }

    // export default dynamicValue
    else if (
      cur.type === "keyword" &&
      cur.value === "export" &&
      next(1) &&
      next(2) &&
      next(1).type === "keyword" &&
      next(1).value === "default" &&
      (
        next(2).type === "identifier" ||
        next(2).type === "string" ||
        next(2).type === "number"
      )
    ) {
      bufferTokens.push({ type: "identifier", value: "exports" });

      tokens.splice(idx + 1, 0, { type: "punctuator", value: "." });
      tokens.splice(idx + 3, 0, { type: "punctuator", value: "=" });

      const endIndex = idx + 5;
      ensureSemicolon(tokens, endIndex);
    }

    // export async function
    else if (
      cur.type === "keyword" &&
      cur.value === "export" &&
      next(1) &&
      next(2) &&
      next(3) &&
      next(4) &&
      next(1).type === "identifier" &&
      next(1).value === "async" &&
      next(2).type === "keyword" &&
      next(2).value === "function" &&
      next(3).type === "identifier" &&
      next(4).type === "punctuator" &&
      next(4).value === "("
    ) {
      pushExportAssign(tokens[idx + 3]);
    }

    // export function*
    else if (
      cur.type === "keyword" &&
      cur.value === "export" &&
      next(1) &&
      next(2) &&
      next(3) &&
      next(4) &&
      next(1).type === "keyword" &&
      next(1).value === "function" &&
      next(2).type === "punctuator" &&
      next(2).value === "*" &&
      next(3).type === "identifier" &&
      next(4).type === "punctuator" &&
      next(4).value === "("
    ) {
      pushExportAssign(tokens[idx + 3]);
    }

    // export * as utils from "./module.js"
    else if (
      cur.type === "keyword" &&
      cur.value === "export" &&
      next(1) &&
      next(2) &&
      next(3) &&
      next(4) &&
      next(1).type === "punctuator" &&
      next(1).value === "*" &&
      next(2).type === "identifier" &&
      next(2).value === "as" &&
      next(3).type === "identifier" &&
      next(4).type === "identifier" &&
      next(4).value === "from" &&
      next(5).type === "string"
    ) {
      tokens[idx + 1] = { type: "identifier", value: "exports" };
      tokens[idx + 2] = { type: "punctuator", value: "." };
      tokens[idx + 4] = { type: "punctuator", value: "=" };

      tokens.splice(idx + 5, 0, { type: "identifier", value: "require" });
      tokens.splice(idx + 6, 0, { type: "punctuator", value: "(" });
      tokens.splice(idx + 8, 0, { type: "punctuator", value: ")" });

      const endIndex = idx + 9;
      ensureSemicolon(tokens, endIndex);
    }

    // export default { ... }
    else if (
      cur.type === "keyword" &&
      cur.value === "export" &&
      next(1) &&
      next(2) &&
      next(3) &&
      next(4) &&
      next(1).type === "keyword" &&
      next(1).value === "default" &&
      next(2).type === "punctuator" &&
      next(2).value === "{"
    ) {
      bufferTokens.push({ type: "identifier", value: "exports" });

      tokens.splice(idx + 1, 0, { type: "punctuator", value: "." });
      tokens.splice(idx + 3, 0, { type: "punctuator", value: "=" });

      const endIndex = getObjectLiteralsEndIndex(tokens, idx + 4);
      const after = tokens[endIndex + 1];

      if (!after || (after && !isSemi(after))) {
        tokens.splice(endIndex + 1, 0, { type: "punctuator", value: ";" });
      }
    }

    // export default [ ... ]
    else if (
      cur.type === "keyword" &&
      cur.value === "export" &&
      next(1) &&
      next(2) &&
      next(3) &&
      next(4) &&
      next(1).type === "keyword" &&
      next(1).value === "default" &&
      next(2).type === "punctuator" &&
      next(2).value === "["
    ) {
      bufferTokens.push({ type: "identifier", value: "exports" });

      tokens.splice(idx + 1, 0, { type: "punctuator", value: "." });
      tokens.splice(idx + 3, 0, { type: "punctuator", value: "=" });

      const endIndex = getArrayLiteralsEndIndex(tokens, idx + 4);
      const after = tokens[endIndex + 1];

      if (!after || (after && !isSemi(after))) {
        tokens.splice(endIndex + 1, 0, { type: "punctuator", value: ";" });
      }
    }

    // export default () => ...
    else if (
      cur.type === "keyword" &&
      cur.value === "export" &&
      next(1) &&
      next(2) &&
      next(3) &&
      next(4) &&
      next(1).type === "keyword" &&
      next(1).value === "default" &&
      next(2).type === "punctuator" &&
      next(2).value === "(" &&
      next(3).type === "punctuator" &&
      next(3).value === ")" &&
      next(4).type === "punctuator" &&
      next(4).value === "=>"
    ) {
      bufferTokens.push({ type: "identifier", value: "exports" });
      tokens.splice(idx + 1, 0, { type: "punctuator", value: "." });
      tokens.splice(idx + 3, 0, { type: "punctuator", value: "=" });
    }

    // export function foo()
    else if (
      cur.type === "keyword" &&
      cur.value === "export" &&
      next(1) &&
      next(2) &&
      next(3) &&
      next(1).type === "keyword" &&
      next(1).value === "function" &&
      next(2).type === "identifier" &&
      next(3).type === "punctuator" &&
      next(3).value === "("
    ) {
      pushExportAssign(tokens[idx + 2]);
    }

    // export * from dynamicIdentifier
    else if (
      cur.type === "keyword" &&
      cur.value === "export" &&
      next(1) &&
      next(2) &&
      next(3) &&
      next(1).type === "punctuator" &&
      next(1).value === "*" &&
      next(2).type === "identifier" &&
      next(2).value === "from" &&
      next(3).type === "identifier"
    ) {
      skippedIndex[idx] = 1;
      skippedIndex[idx + 1] = 1;
      skippedIndex[idx + 2] = 1;
      skippedIndex[idx + 3] = 1;

      if (next(4) && isSemi(next(4))) {
        skippedIndex[idx + 4] = 1;
      }

      exportTokens.push({ type: "identifier", value: "Object" });
      exportTokens.push({ type: "punctuator", value: "." });
      exportTokens.push({ type: "identifier", value: "assign" });
      exportTokens.push({ type: "punctuator", value: "(" });
      exportTokens.push({ type: "identifier", value: "exports" });
      exportTokens.push({ type: "punctuator", value: "," });
      exportTokens.push({ type: "identifier", value: "require" });
      exportTokens.push({ type: "punctuator", value: "(" });
      exportTokens.push(tokens[idx + 3]);
      exportTokens.push({ type: "punctuator", value: ")" });
      exportTokens.push({ type: "punctuator", value: ")" });
      exportTokens.push({ type: "punctuator", value: ";" });
    }

    // )export
    else if (
      cur.type === "punctuator" &&
      cur.value === ")" &&
      next(1) &&
      next(1).type === "keyword" &&
      next(1).value === "export"
    ) {
      bufferTokens.push({ type: "punctuator", value: ")" });
      tokens.splice(idx + 1, 0, { type: "punctuator", value: ";" });
    }

    // default: push normal tokens
    else if (!skippedIndex[idx]) {
      bufferTokens.push({ type: cur.type, value: cur.value });

      if (iclosedIndex[idx]) {
        bufferTokens.push({ type: "punctuator", value: ";" });
      }
    }
  }

  return [...bufferTokens, ...exportTokens];
}
