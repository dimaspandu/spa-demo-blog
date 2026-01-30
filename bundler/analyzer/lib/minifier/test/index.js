import minifyJS from "../main.js";
import runTest from "../../../utils/tester.js";

/**
 * BASIC STATEMENTS
 */

runTest(
  "Minify JS - variable declaration",
  minifyJS(`const a = 1;`),
  "const a=1;"
);

runTest(
  "Minify JS - multiple statements",
  minifyJS(`
    let x = 10;
    let y = 20;
  `),
  "let x=10;let y=20;"
);

/**
 * WHITESPACE & NEWLINES
 */

runTest(
  "Minify JS - remove whitespace",
  minifyJS(`   let   a   =   5   ;   `),
  "let a=5;"
);

runTest(
  "Minify JS - remove newlines",
  minifyJS(`
    const foo = 1;
    const bar = 2;
  `),
  "const foo=1;const bar=2;"
);

/**
 * COMMENTS
 */

runTest(
  "Minify JS - remove line comment",
  minifyJS(`
    // this is a comment
    let a = 1;
  `),
  "let a=1;"
);

runTest(
  "Minify JS - remove block comment",
  minifyJS(`
    /* multi
       line
       comment */
    let b = 2;
  `),
  "let b=2;"
);

runTest(
  "Minify JS - inline comments",
  minifyJS(`let/*x*/a/*y*/=/*z*/3;`),
  "let a=3;"
);

/**
 * EXPRESSIONS & FUNCTIONS
 */

runTest(
  "Minify JS - function declaration",
  minifyJS(`
    function sum(a, b) {
      return a + b;
    }
  `),
  "function sum(a,b){return a+b;}"
);

runTest(
  "Minify JS - arrow function",
  minifyJS(`
    const add = (a, b) => {
      return a + b;
    };
  `),
  "const add=(a,b)=>{return a+b;};"
);

/**
 * CONTROL FLOW
 */

runTest(
  "Minify JS - if statement",
  minifyJS(`
    if (a > 10) {
      console.log(a);
    }
  `),
  "if(a>10){console.log(a);}"
);

runTest(
  "Minify JS - for loop",
  minifyJS(`
    for (let i = 0; i < 3; i++) {
      console.log(i);
    }
  `),
  "for(let i=0;i<3;i++){console.log(i);}"
);

/**
 * STRINGS & TEMPLATES
 */

runTest(
  "Minify JS - string literal",
  minifyJS(`const s = "hello world";`),
  "const s=\"hello world\";"
);

runTest(
  "Minify JS - template literal",
  minifyJS("const t = `hello ${name}`;"),
  "const t=`hello ${name}`;"
);

runTest(
  "Minify JS - preserve large whitespace inside string",
  minifyJS(`const msg = "hello     world     !!!";`),
  "const msg=\"hello     world     !!!\";"
);

runTest(
  "Minify JS - preserve string whitespace with surrounding formatting",
  minifyJS(`
    const text = "A    lot        of      spaces";
  `),
  "const text=\"A    lot        of      spaces\";"
);

runTest(
  "Minify JS - multiline template literal (preserved by default)",
  minifyJS(`
    const raw = (\`
      :root {
        --accent: #2563eb;
      }
      body {
        font-family: sans-serif;
        background: #f6f7fb;
        padding: 20px;
      }
      h1 {
        color: var(--accent);
      }
      p.styled {
        color: #10b981;
        font-weight: bold;
      }
    \`);

    if (typeof raw === "object") {
      console.log("1");
    } else {
      console.log("0");
    }
  `),
  "const raw=(`\n      :root {\n        --accent: #2563eb;\n      }\n      body {\n        font-family: sans-serif;\n        background: #f6f7fb;\n        padding: 20px;\n      }\n      h1 {\n        color: var(--accent);\n      }\n      p.styled {\n        color: #10b981;\n        font-weight: bold;\n      }\n    `);if(typeof raw===\"object\"){console.log(\"1\");}else{console.log(\"0\");}"
);

runTest(
  "Minify JS - template literal preserves empty lines",
  minifyJS(`
    const raw = (\`
      :root {
        --accent: #2563eb;
      }

      body {
        font-family: sans-serif;
        background: #f6f7fb;
        padding: 20px;
      }

      h1 {
        color: var(--accent);
      }

      p.styled {
        color: #10b981;
        font-weight: bold;
      }
    \`);

    if (typeof raw === "object") {
      console.log("1");
    } else {
      console.log("0");
    }
  `),
  "const raw=(`\n      :root {\n        --accent: #2563eb;\n      }\n\n      body {\n        font-family: sans-serif;\n        background: #f6f7fb;\n        padding: 20px;\n      }\n\n      h1 {\n        color: var(--accent);\n      }\n\n      p.styled {\n        color: #10b981;\n        font-weight: bold;\n      }\n    `);if(typeof raw===\"object\"){console.log(\"1\");}else{console.log(\"0\");}"
);

runTest(
  "Minify JS - multiline template literal normalized to \\n",
  minifyJS(
    `
      const raw = (\`
        :root {
          --accent: #2563eb;
        }
        body {
          font-family: sans-serif;
          background: #f6f7fb;
          padding: 20px;
        }
        h1 {
          color: var(--accent);
        }
        p.styled {
          color: #10b981;
          font-weight: bold;
        }
      \`);

      if (typeof raw === "object") {
        console.log("1");
      } else {
        console.log("0");
      }
    `,
    { normalizeTemplateNewlines: true }
  ),
  "const raw=(`\\n        :root {\\n          --accent: #2563eb;\\n        }\\n        body {\\n          font-family: sans-serif;\\n          background: #f6f7fb;\\n          padding: 20px;\\n        }\\n        h1 {\\n          color: var(--accent);\\n        }\\n        p.styled {\\n          color: #10b981;\\n          font-weight: bold;\\n        }\\n      `);if(typeof raw===\"object\"){console.log(\"1\");}else{console.log(\"0\");}"
);

/**
 * MATH EXPRESSIONS & DIVISION
 */

runTest(
  "Minify JS - division without spaces",
  minifyJS(`const percent = total === 0 ? 0 : ((passed/total) * 100).toFixed(2);`),
  "const percent=total===0?0:((passed/total)*100).toFixed(2);"
);

runTest(
  "Minify JS - division with spaces",
  minifyJS(`const percent = total === 0 ? 0 : ((passed / total) * 100).toFixed(2);`),
  "const percent=total===0?0:((passed/total)*100).toFixed(2);",
  true
);


