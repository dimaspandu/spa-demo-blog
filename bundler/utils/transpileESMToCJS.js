/**
 * Simple ESM → CJS transpiler
 * Handles:
 * - Default + named imports
 * - Named imports only
 * - Default only imports
 * - Side-effect imports
 * - Dynamic imports (http/https + fallback)
 * - Named & default exports
 * - Re-exports (with or without alias)
 * - Named exports list-style (with or without alias)
 * - Preserves quote style
 * - Maintains export order according to code
 */
export default function transpileESMToCJS(esmCode) {
  let code = esmCode;

  // ------------------------
  // Helper: find matching brace position
  // Scans forward from an opening brace index and returns the index
  // of the matching closing brace, taking into account strings and comments.
  // ------------------------
  function findMatchingBrace(str, openIndex) {
    const len = str.length;
    let depth = 0;
    let inSingle = false;
    let inDouble = false;
    let inTemplate = false;
    let i = openIndex;

    while (i < len) {
      const ch = str[i];
      const prev = str[i - 1];

      // If inside single-quoted string
      if (inSingle) {
        if (ch === "'" && prev !== "\\") inSingle = false;
        i++;
        continue;
      }

      // If inside double-quoted string
      if (inDouble) {
        if (ch === '"' && prev !== "\\") inDouble = false;
        i++;
        continue;
      }

      // If inside template literal
      if (inTemplate) {
        if (ch === "`" && prev !== "\\") {
          inTemplate = false;
          i++;
          continue;
        }
        // allow template expressions ${ ... } - they will contain braces handled by depth
        i++;
        continue;
      }

      // Not inside a string/template: handle comments and enter strings/templates
      if (ch === "/" && str[i + 1] === "/") {
        // single-line comment: skip to newline
        i += 2;
        while (i < len && str[i] !== "\n") i++;
        continue;
      }

      if (ch === "/" && str[i + 1] === "*") {
        // multi-line comment: skip to closing */
        i += 2;
        while (i < len && !(str[i] === "*" && str[i + 1] === "/")) i++;
        i += 2;
        continue;
      }

      if (ch === "'") {
        inSingle = true;
        i++;
        continue;
      }

      if (ch === '"') {
        inDouble = true;
        i++;
        continue;
      }

      if (ch === "`") {
        inTemplate = true;
        i++;
        continue;
      }

      // Track braces when not in string/comment
      if (ch === "{") {
        depth++;
      } else if (ch === "}") {
        depth--;
        if (depth === 0) return i;
      }

      i++;
    }

    // No matching brace found
    return -1;
  }

  // ------------------------
  // Pre-pass: replace anonymous `export default function() { ... }`
  // and `export default class { ... }` safely, by scanning for the
  // full block and then replacing with `exports.default = <block>;`
  //
  // This must run before the other export-handling passes so the generic
  // export regexes do not break anonymous function/class forms.
  // ------------------------
  (function replaceAnonymousDefaults() {
    // Handle anonymous default functions: match "export default function("
    while (true) {
      const fnIndex = code.search(/export\s+default\s+function\s*\(/);
      if (fnIndex === -1) break;

      // find the opening parenthesis, then the following '{' for the function body
      const parenPos = code.indexOf("(", fnIndex);
      if (parenPos === -1) break;
      const bodyOpen = code.indexOf("{", parenPos);
      if (bodyOpen === -1) break;

      const bodyClose = findMatchingBrace(code, bodyOpen);
      if (bodyClose === -1) break;

      // full segment includes "export default function(...) { ... }"
      const segment = code.slice(fnIndex, bodyClose + 1);
      // remove the leading "export default "
      const core = segment.replace(/^export\s+default\s+/, "");
      // replace entire segment with an exports assignment + semicolon
      const replacement = `exports.default = ${core};`;
      code = code.slice(0, fnIndex) + replacement + code.slice(bodyClose + 1);
    }

    // Handle anonymous default classes: match "export default class {"
    while (true) {
      const clsIndex = code.search(/export\s+default\s+class\s*{/);
      if (clsIndex === -1) break;

      const bodyOpen = code.indexOf("{", clsIndex);
      if (bodyOpen === -1) break;

      const bodyClose = findMatchingBrace(code, bodyOpen);
      if (bodyClose === -1) break;

      // full segment includes "export default class { ... }"
      const segment = code.slice(clsIndex, bodyClose + 1);
      const core = segment.replace(/^export\s+default\s+/, "");
      const replacement = `exports.default = ${core};`;
      code = code.slice(0, clsIndex) + replacement + code.slice(bodyClose + 1);
    }
  })();

  // ------------------------
  // Imports
  // ------------------------

  // Handle dynamic import with attributes for JSON
  // Example: import("./x.json", { with: { type: "json" } }) -> require(...).http()
  code = code.replace(
    /import\(\s*(['"][^'"]+\.json['"])\s*,\s*\{\s*with:\s*\{\s*type:\s*["']json["']\s*\}\s*\}\s*\)/g,
    (_, mod) => `require(${mod}).http()`
  );

  // Handle dynamic import with attributes for CSS
  code = code.replace(
    /import\(\s*(['"][^'"]+\.css['"])\s*,\s*\{\s*with:\s*\{\s*type:\s*["']css["']\s*\}\s*\}\s*\)/g,
    (_, mod) => `require(${mod}).http()`
  );

  // ------------------------
  // Normalize import attributes
  // Remove "with { ... }" from static imports only
  // ------------------------
  code = code
    // static import with attributes
    .replace(/(import\s+[^'"]+\s+from\s+['"][^'"]+['"])\s+with\s*{[^}]+}/g, "$1")
    // side-effect import with attributes
    .replace(/(import\s+['"][^'"]+['"])\s+with\s*{[^}]+}/g, "$1");

  // ------------------------
  // Imports
  // ------------------------

  // Default + named imports
  code = code.replace(
    /import\s+([a-zA-Z0-9_$]+)\s*,\s*{([^}]+)}\s*from\s*(['"].+?['"]);?/g,
    (_, def, named, mod) => {
      const imports = named
        .split(",")
        .map(s => s.trim())
        .map(s => {
          if (s.includes(" as ")) {
            const [orig, alias] = s.split(" as ").map(x => x.trim());
            return `const ${alias} = require(${mod}).${orig};`;
          }
          return `const ${s} = require(${mod}).${s};`;
        })
        .join("\n");
      return `const ${def} = require(${mod}).default;\n${imports}`;
    }
  );

  // Named imports only
  code = code.replace(
    /import\s*{([^}]+)}\s*from\s*(['"].+?['"]);?/g,
    (_, named, mod) => {
      return named
        .split(",")
        .map(s => {
          s = s.trim();
          if (s.includes(" as ")) {
            const [orig, alias] = s.split(" as ").map(x => x.trim());
            return `const ${alias} = require(${mod}).${orig};`;
          }
          return `const ${s} = require(${mod}).${s};`;
        })
        .join("\n");
    }
  );

  // Default only
  code = code.replace(
    /import\s+([a-zA-Z0-9_$]+)\s+from\s*(['"].+?['"]);?/g,
    (_, def, mod) => `const ${def} = require(${mod}).default;`
  );

  // Side-effect only imports
  code = code.replace(
    /import\s+(['"][^'"]+['"]);?/g,
    (_, mod) => `require(${mod});`
  );

  // Dynamic import (supports full chain like .http(...).then(...))
  // Replaces import("x") -> require("x")...
  code = code.replace(
    /import\s*\(\s*(['"][^'"]+['"])\s*\)((?:\.\s*[A-Za-z_$][\w$]*\s*\([^)]*\))*)/g,
    (_, mod, calls) => {
      const callsStr = calls || "";
      let fixedCalls = callsStr.replace(/\.\s*([A-Za-z_$][\w$]*)\s*\(/g, (m, name) => `.${name}(`);
      fixedCalls = fixedCalls.replace(/\.namespace(?=\s*\()/g, ".http");
      if (!fixedCalls) {
        return `require(${mod}).http()`;
      }
      const mFirst = fixedCalls.match(/^\.\s*([A-Za-z_$][\w$]*)/);
      const first = mFirst ? mFirst[1] : null;
      if (first && !/^(http|https|namespace)$/i.test(first)) {
        return `require(${mod}).http()${fixedCalls}`;
      }
      return `require(${mod})${fixedCalls}`;
    }
  );

  // ------------------------
  // Re-exports
  // ------------------------
  code = code.replace(
    /export\s*{([^}]+)}\s*from\s*(['"].+?['"]);?/g,
    (_, names, mod) => {
      return names
        .split(",")
        .map(s => {
          s = s.trim();
          if (s.includes(" as ")) {
            const [orig, alias] = s.split(" as ").map(x => x.trim());
            return `exports.${alias} = require(${mod}).${orig};`;
          }
          return `exports.${s} = require(${mod}).${s};`;
        })
        .join("\n");
    }
  );

  // ------------------------
  // Exports
  // ------------------------
  const allExports = [];

  // export default function foo() {}
  code = code.replace(/export\s+default\s+function\s+([a-zA-Z0-9_$]+)\s*\(/g,
    (_, fnName, offset) => {
      allExports.push({ name: fnName, isDefault: true, index: offset });
      return `function ${fnName}(`;
    }
  );

  // export function foo() {}
  code = code.replace(/export\s+function\s+([a-zA-Z0-9_$]+)\s*\(/g,
    (_, fnName, offset) => {
      allExports.push({ name: fnName, isDefault: false, index: offset });
      return `function ${fnName}(`;
    }
  );

  // export const foo = ...
  code = code.replace(/export\s+(const|let|var)\s+([a-zA-Z0-9_$]+)\s*=/g,
    (_, type, name, offset) => {
      allExports.push({ name: name, isDefault: false, index: offset });
      return `${type} ${name} =`;
    }
  );

  // export { foo, bar as baz }
  code = code.replace(/export\s*{\s*([^}]+)\s*};?/g,
    (_, names, offset) => {
      names.split(',').forEach(s => {
        s = s.trim();
        if (s.includes(' as ')) {
          const [orig, alias] = s.split(' as ').map(x => x.trim());
          allExports.push({ name: alias, original: orig, isDefault: false, index: offset });
        } else {
          allExports.push({ name: s, isDefault: false, index: offset });
        }
      });
      return '';
    }
  );

  // Default exports in multiple forms
  code = code.replace(/export\s+default\s+([a-zA-Z0-9_$]+)\s*=\s*([^;]+);?/g,
    (_, name, rhs, offset) => {
      allExports.push({ name: name, isDefault: true, index: offset });
      return `const ${name} = ${rhs};`;
    }
  );
  code = code.replace(/export\s+default\s+([a-zA-Z0-9_$]+);?/g,
    (_, name, offset) => {
      allExports.push({ name: name, isDefault: true, index: offset });
      return '';
    }
  );
  code = code.replace(/export\s+default\s+function\s*\([^)]*\)\s*{[\s\S]*?}/g,
    (match, offset) => {
      allExports.push({ expr: match.replace(/^export\s+default\s+/, ''), isDefault: true, index: offset });
      return '';
    }
  );
  code = code.replace(/export\s+default\s+class\s*{[\s\S]*?}/g,
    (match, offset) => {
      allExports.push({ expr: match.replace(/^export\s+default\s+/, ''), isDefault: true, index: offset });
      return '';
    }
  );
  code = code.replace(/export\s+default\s+([^;]+);?/g,
    (_, expr, offset) => {
      allExports.push({ expr: expr.trim(), isDefault: true, index: offset });
      return '';
    }
  );

  // ------------------------
  // Build exports block
  // ------------------------
  allExports.sort((a, b) => a.index - b.index);
  const exportsBlock = allExports.map(e => {
    if (e.original) return `exports.${e.name} = ${e.original};`;
    if (e.expr) return `exports.default = ${e.expr};`;
    return e.isDefault
      ? `exports.default = ${e.name};`
      : `exports.${e.name} = ${e.name};`;
  }).join("\n");

  if (exportsBlock) {
    code = code.replace(/\s*$/, "") + "\n\n" + exportsBlock + "\n";
  }

  return code.replace(/\r\n/g, "\n");
}
