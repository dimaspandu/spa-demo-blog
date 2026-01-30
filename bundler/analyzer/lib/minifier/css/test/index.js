import minifyCSS from "../main.js";
import runTest from "../../../../utils/tester.js";
import { CSS_MINIFY_LEVEL } from "../constants.js";

/**
 * BASIC DECLARATIONS
 */

runTest(
  "Minify CSS - simple declaration",
  minifyCSS(`color: red;`),
  "color:red;"
);

runTest(
  "Minify CSS - multiple declarations",
  minifyCSS(`width: 100px; height: 50px;`),
  "width:100px;height:50px;"
);

/**
 * WHITESPACE & NEWLINES
 */

runTest(
  "Minify CSS - remove whitespace",
  minifyCSS(`  color   :   red  ;  `),
  "color:red;"
);

runTest(
  "Minify CSS - remove newlines",
  minifyCSS(`
    color: red;
    background: blue;
  `),
  "color:red;background:blue;"
);

/**
 * COMMENTS
 */

runTest(
  "Minify CSS - remove comments",
  minifyCSS(`
    /* main color */
    color: red;
  `),
  "color:red;"
);

runTest(
  "Minify CSS - inline comment",
  minifyCSS(`color/*x*/:/*y*/red;`),
  "color:red;"
);

/**
 * SELECTORS
 */

runTest(
  "Minify CSS - simple selector",
  minifyCSS(`.box { color: red; }`),
  ".box{color:red;}"
);

runTest(
  "Minify CSS - complex selector",
  minifyCSS(`
    ul > li.active + li:hover {
      margin: 10px;
    }
  `),
  "ul>li.active+li:hover{margin:10px;}"
);

/**
 * FUNCTIONS & DIMENSIONS
 */

runTest(
  "Minify CSS - function value",
  minifyCSS(`transform: rotate(45deg);`),
  "transform:rotate(45deg);"
);

runTest(
  "Minify CSS - calc expression",
  minifyCSS(`width: calc(100% - 20px);`),
  "width:calc(100% - 20px);"
);

/**
 * AT-RULES
 */

runTest(
  "Minify CSS - @media rule",
  minifyCSS(`
    @media screen and (max-width: 600px) {
      body {
        font-size: 14px;
      }
    }
  `),
  "@media screen and(max-width:600px){body{font-size:14px;}}"
);

/**
 * STRINGS & URLS
 */

runTest(
  "Minify CSS - string value",
  minifyCSS(`background: "img/bg.png";`),
  "background:\"img/bg.png\";"
);

runTest(
  "Minify CSS - url function",
  minifyCSS(`background: url("img/bg.png");`),
  "background:url(\"img/bg.png\");"
);

/**
 * COMPREHENSIVE
 */

runTest(
  "Minify CSS - comprehensive styling",
  minifyCSS(`
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
  `),
  `:root{--accent:#2563eb;}body{font-family:sans-serif;background:#f6f7fb;padding:20px;}h1{color:var(--accent);}p.styled{color:#10b981;font-weight:bold;}`
);

/**
 * ADJACENT VALUES
 */

runTest(
  "Minify CSS - transform with time value",
  minifyCSS(`transition: transform 0.2s;`),
  "transition:transform 0.2s;"
);

runTest(
  "Minify CSS - margin shorthand with auto",
  minifyCSS(`margin: 0 auto;`),
  "margin:0 auto;"
);

/**
 * MEDIA QUERIES
 */

runTest(
  "Minify CSS - @media with multiple keywords",
  minifyCSS(`@media screen and (max-width: 540px) { body { font-size: 14px; } }`),
  "@media screen and(max-width:540px){body{font-size:14px;}}"
);

/**
 * HASHES & COLORS
 */

runTest(
  "Minify CSS - hex color with hash",
  minifyCSS(`#header { color: #ff6f61; }`),
  "#header{color:#ff6f61;}"
);

/**
 * PSEUDO-CLASSES & COMBINATORS
 */

runTest(
  "Minify CSS - pseudo-class hover",
  minifyCSS(`.btn:hover { opacity: 0.8; }`),
  ".btn:hover{opacity:0.8;}"
);

runTest(
  "Minify CSS - combinators",
  minifyCSS(`ul > li + li { margin-top: 10px; }`),
  "ul>li+li{margin-top:10px;}"
);

/**
 * FUNCTION VALUES
 */

runTest(
  "Minify CSS - calc with spaces",
  minifyCSS(`width: calc(100% - 20px);`),
  "width:calc(100% - 20px);"
);

runTest(
  "Minify CSS - nested function",
  minifyCSS(`background: linear-gradient(to right, red, rgba(0,0,0,0.5));`),
  "background:linear-gradient(to right,red,rgba(0,0,0,0.5));"
);

/**
 * STRINGS WITH QUOTES
 */

runTest(
  "Minify CSS - single quotes string",
  minifyCSS(`font-family: 'Nunito', sans-serif;`),
  "font-family:'Nunito',sans-serif;"
);

/**
 * COMPREHENSIVE EDGE CASE
 */

runTest(
  "Minify CSS - full component edge case",
  minifyCSS(`
    .card {
      transform: translateY(10px);
      transition: transform 0.3s ease-in-out;
      background-color: #fff;
      border-radius: 8px;
    }
  `),
  ".card{transform:translateY(10px);transition:transform 0.3s ease-in-out;background-color:#fff;border-radius:8px;}"
);

/**
 * MINIFY LEVELS
 */

runTest(
  "Minify CSS - DEEP level fully re-stringifies (default)",
  minifyCSS(
    `
      .box {
        width: 100px;
        height: 50px;
        border: solid 1px #000000;
      }
    `,
    { level: CSS_MINIFY_LEVEL.DEEP }
  ),
  ".box{width:100px;height:50px;border:solid 1px #000000;}"
);

runTest(
  "Minify CSS - SAFE avoids risky re-stringify",
  minifyCSS(
    `
      .box {
        width: 100px;
        height: 50px;
      }

      .box__container {
        width: calc(100% - 20px);
      }
    `,
    { level: CSS_MINIFY_LEVEL.SAFE }
  ),
  ".box { width: 100px; height: 50px; } .box__container { width: calc(100% - 20px); }"
);

runTest(
  "Minify CSS - dimension followed by hex color",
  minifyCSS(`border: solid 1px #fff;`),
  "border:solid 1px #fff;"
);

runTest(
  "Minify CSS - SAFE preserves whitespace between dimension and color",
  minifyCSS(
    `border: solid 1px #fff;`,
    { level: CSS_MINIFY_LEVEL.SAFE }
  ),
  "border: solid 1px #fff;",
  true
);


