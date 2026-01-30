import convertESMToCJSWithMeta from "../main.js";
import runTest from "../../../utils/tester.js";

/* ============================================================
   1. STATIC IMPORTS
   ============================================================ */

runTest(
  "Import default",
  convertESMToCJSWithMeta(`import DefaultExport from "module-1";`),
  {
    code: `const DefaultExport=require("module-1").default;`,
    meta: [
      {
        module: "module-1",
        type: "static",
        assertions: null,
        literal: true,
        reason: null
      }
    ]
  }
);

runTest(
  "Named imports",
  convertESMToCJSWithMeta(`import { a, b, c } from "module-2";`),
  {
    code: `const a=require("module-2").a;const b=require("module-2").b;const c=require("module-2").c;`,
    meta: [
      {
        module: "module-2",
        type: "static",
        assertions: null,
        literal: true,
        reason: null
      }
    ]
  }
);

runTest(
  "Named imports with alias",
  convertESMToCJSWithMeta(`import { a as x, b as y } from "module-3";`),
  {
    code: `const x=require("module-3").a;const y=require("module-3").b;`,
    meta: [
      {
        module: "module-3",
        type: "static",
        assertions: null,
        literal: true,
        reason: null
      }
    ]
  }
);

runTest(
  "Default + named",
  convertESMToCJSWithMeta(`import Something, { foo, bar as baz } from "module-4";`),
  {
    code: `const Something=require("module-4").default;const foo=require("module-4").foo;const baz=require("module-4").bar;`,
    meta: [
      {
        module: "module-4",
        type: "static",
        assertions: null,
        literal: true,
        reason: null
      }
    ]
  }
);

runTest(
  "Namespace import",
  convertESMToCJSWithMeta(`import * as Utils from "module-5";`),
  {
    code: `const Utils=require("module-5");`,
    meta: [
      {
        module: "module-5",
        type: "static",
        assertions: null,
        literal: true,
        reason: null
      }
    ]
  }
);

runTest(
  "Default + namespace",
  convertESMToCJSWithMeta(`import DefaultThing, * as Everything from "module-6";`),
  {
    code: `const Everything=require("module-6");const DefaultThing=Everything.default;`,
    meta: [
      {
        module: "module-6",
        type: "static",
        assertions: null,
        literal: true,
        reason: null
      }
    ]
  }
);

runTest(
  "Side-effect import",
  convertESMToCJSWithMeta(`import "module-7";`),
  {
    code: `require("module-7");`,
    meta: [
      {
        module: "module-7",
        type: "static",
        assertions: null,
        literal: true,
        reason: null
      }
    ]
  }
);

runTest(
  "Import assertions (classic)",
  convertESMToCJSWithMeta(`import config from "./config.json" assert { type: "json" };`),
  {
    code: `const config=require("./config.json").default;`,
    meta: [
      {
        module: "./config.json",
        type: "static",
        assertions: { type: "json" },
        literal: true,
        reason: null
      }
    ]
  }
);

runTest(
  "With module attributes",
  convertESMToCJSWithMeta(`import sheet from "./styles.css" with { type: "css" };`),
  {
    code: `const sheet=require("./styles.css").default;`,
    meta: [
      {
        module: "./styles.css",
        type: "static",
        assertions: { type: "css" },
        literal: true,
        reason: null
      }
    ]
  }
);

runTest(
  "Side-effect + module attributes",
  convertESMToCJSWithMeta(`import "./globals.css" with { type: "css" };`),
  {
    code: `require("./globals.css");`,
    meta: [
      {
        module: "./globals.css",
        type: "static",
        assertions: { type: "css" },
        literal: true,
        reason: null
      }
    ]
  }
);

runTest(
  "Namespace import + module attributes",
  convertESMToCJSWithMeta(`import * as Data from "./data.json" with { type: "json" };`),
  {
    code: `const Data=require("./data.json");`,
    meta: [
      {
        module: "./data.json",
        type: "static",
        assertions: { type: "json" },
        literal: true,
        reason: null
      }
    ]
  }
);

/* ============================================================
   2. DYNAMIC IMPORTS
   ============================================================ */

runTest(
  "Dynamic import basic",
  convertESMToCJSWithMeta(`import("module-12");`),
  {
    code: `requireByHttp("module-12");`,
    meta: [
      {
        module: "module-12",
        type: "dynamic",
        assertions: null,
        literal: true,
        reason: null
      }
    ]
  }
);

runTest(
  "Dynamic import awaited",
  convertESMToCJSWithMeta(`(async()=>{await import("module-13");})();`),
  {
    code: `(async()=>{await requireByHttp("module-13");})();`,
    meta: [
      {
        module: "module-13",
        type: "dynamic",
        assertions: null,
        literal: true,
        reason: null
      }
    ]
  }
);

runTest(
  "Dynamic import with module attributes",
  JSON.stringify(
    convertESMToCJSWithMeta(`import("module-14", { with: { type: "css" } });`),
    null,
    2
  ),
  JSON.stringify(
    {
      code: `requireByHttp("module-14",{with:{type:"css"}});`,
      meta: [
        {
          module: "module-14",
          type: "dynamic",
          assertions: { type: "css" },
          literal: true,
          reason: null
        }
      ]
    },
    null,
    2
  )
);

runTest(
  "Dynamic import with custom options",
  convertESMToCJSWithMeta(`import("module-15", { namespace: "ExampleNS" });`),
  {
    code: `requireByHttp("module-15",{namespace:"ExampleNS"});`,
    meta: [
      {
        module: "module-15",
        type: "dynamic",
        assertions: { namespace: "ExampleNS" },
        literal: true,
        reason: null
      }
    ]
  }
);

runTest(
  "Dynamic import with assert json",
  convertESMToCJSWithMeta(`import("./config.json", { assert: { type: "json" } });`),
  {
    code: `requireByHttp("./config.json",{assert:{type:"json"}});`,
    meta: [
      {
        module: "./config.json",
        type: "dynamic",
        assertions: { type: "json" },
        literal: true,
        reason: null
      }
    ]
  }
);

runTest(
  "Dynamic import template literal",
  convertESMToCJSWithMeta(`import(\`https://example.com/module-17.js\`);`),
  {
    code: `requireByHttp(\`https://example.com/module-17.js\`);`,
    meta: [
      {
        module: "`https://example.com/module-17.js`",
        type: "dynamic",
        assertions: null,
        literal: true,
        reason: null
      }
    ]
  }
);

runTest(
  "Dynamic import single quote",
  convertESMToCJSWithMeta(`import('https://example.com/module-18.js');`),
  {
    code: `requireByHttp('https://example.com/module-18.js');`,
    meta: [
      {
        module: "https://example.com/module-18.js",
        type: "dynamic",
        assertions: null,
        literal: true,
        reason: null
      }
    ]
  }
);

runTest(
  "Dynamic import template literal + options",
  convertESMToCJSWithMeta(
    `const theme="light";import(\`./style-\${theme}.css\`,{with:{type:"css"}});`
  ),
  {
    code: `const theme="light";requireByHttp(\`./style-\${theme}.css\`,{with:{type:"css"}});`,
    meta: [
      {
        module: "`./style-${theme}.css`",
        type: "dynamic",
        assertions: { type: "css" },
        literal: false,
        reason: "template-literal"
      }
    ]
  }
);

runTest(
  "Chained dynamic import",
  convertESMToCJSWithMeta(`import("module-20").then(m=>console.log(m));`),
  {
    code: `requireByHttp("module-20").then(m=>console.log(m));`,
    meta: [
      {
        module: "module-20",
        type: "dynamic",
        assertions: null,
        literal: true,
        reason: null
      }
    ]
  }
);

runTest(
  "Dynamic import inside function expression",
  convertESMToCJSWithMeta(`export function getModule(){return import("module-21");}`),
  {
    code: `function getModule(){return requireByHttp("module-21");}exports.getModule=getModule;`,
    meta: [
      {
        module: "module-21",
        type: "dynamic",
        assertions: null,
        literal: true,
        reason: null
      }
    ]
  }
);

/* ============================================================
   3. RE-EXPORTS
   ============================================================ */

runTest(
  "Re-export all",
  convertESMToCJSWithMeta(`export * from "./module-22.js";`),
  {
    code: `Object.assign(exports,require("./module-22.js"));`,
    meta: [
      {
        module: "./module-22.js",
        type: "export",
        assertions: null,
        literal: true,
        reason: null
      }
    ]
  }
);

runTest(
  "Export named",
  convertESMToCJSWithMeta(`export { foo, bar } from "./module-23.js";`),
  {
    code: `exports.foo=require("./module-23.js").foo;exports.bar=require("./module-23.js").bar;`,
    meta: [
      {
        module: "./module-23.js",
        type: "export",
        assertions: null,
        literal: true,
        reason: null
      }
    ]
  }
);

runTest(
  "Export named alias",
  convertESMToCJSWithMeta(`export { baz as myBaz } from "./module-24.js";`),
  {
    code: `exports.myBaz=require("./module-24.js").baz;`,
    meta: [
      {
        module: "./module-24.js",
        type: "export",
        assertions: null,
        literal: true,
        reason: null
      }
    ]
  }
);

runTest(
  "Export default from source",
  convertESMToCJSWithMeta(`export { default as RemoteDefault } from "./module-25.js";`),
  {
    code: `exports.RemoteDefault=require("./module-25.js").default;`,
    meta: [
      {
        module: "./module-25.js",
        type: "export",
        assertions: null,
        literal: true,
        reason: null
      }
    ]
  }
);

runTest(
  "Export mixture",
  convertESMToCJSWithMeta(
    `export { default as MainComponent, helper } from "./components.js";`
  ),
  {
    code: `exports.MainComponent=require("./components.js").default;exports.helper=require("./components.js").helper;`,
    meta: [
      {
        module: "./components.js",
        type: "export",
        assertions: null,
        literal: true,
        reason: null
      }
    ]
  }
);

/* ============================================================
   4. RE-EXPORT NAMESPACE
   ============================================================ */

runTest(
  "Export namespace",
  convertESMToCJSWithMeta(`export * as utils from "./utils.js";`),
  {
    code: `exports.utils=require("./utils.js");`,
    meta: [
      {
        module: "./utils.js",
        type: "export",
        assertions: null,
        literal: true,
        reason: null
      }
    ]
  }
);

/* ============================================================
   5. OPTIONS HANDLING
   ============================================================ */

/**
 * dynamicImportIdentifier override
 */
runTest(
  "Dynamic import with custom dynamicImportIdentifier",
  convertESMToCJSWithMeta(
    `import("module-custom");`,
    { dynamicImportIdentifier: "__dynamicRequire__" }
  ),
  {
    code: `__dynamicRequire__("module-custom");`,
    meta: [
      {
        module: "module-custom",
        type: "dynamic",
        assertions: null,
        literal: true,
        reason: null
      }
    ]
  }
);

/**
 * convertBlockBindingsToVar = false (default behavior)
 */
runTest(
  "Preserve let and const when convertBlockBindingsToVar is false",
  convertESMToCJSWithMeta(
    `
    let a = 1;
    const b = 2;
    import("module-const-let");
    `
  ),
  {
    code: `let a=1;const b=2;requireByHttp("module-const-let");`,
    meta: [
      {
        module: "module-const-let",
        type: "dynamic",
        assertions: null,
        literal: true,
        reason: null
      }
    ]
  }
);

/**
 * convertBlockBindingsToVar = true
 */
runTest(
  "Convert let and const to var when convertBlockBindingsToVar is enabled",
  convertESMToCJSWithMeta(
    `
    let x = 10;
    const y = 20;
    import("module-var");
    `,
    { convertBlockBindingsToVar: true }
  ),
  {
    code: `var x=10;var y=20;requireByHttp("module-var");`,
    meta: [
      {
        module: "module-var",
        type: "dynamic",
        assertions: null,
        literal: true,
        reason: null
      }
    ]
  }
);

/**
 * Both options combined
 */
runTest(
  "Custom dynamicImportIdentifier + convertBlockBindingsToVar",
  convertESMToCJSWithMeta(
    `
    const theme = "dark";
    import("./theme.js");
    `,
    {
      dynamicImportIdentifier: "customLoader",
      convertBlockBindingsToVar: true
    }
  ),
  {
    code: `var theme="dark";customLoader("./theme.js");`,
    meta: [
      {
        module: "./theme.js",
        type: "dynamic",
        assertions: null,
        literal: true,
        reason: null
      }
    ]
  },
  true
);
