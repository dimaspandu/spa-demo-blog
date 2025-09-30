/**
 * Merge require(...).http()/https() into require(".../<HTTP>/") 
 * or require(".../<HTTPS>/") without + if arg is string literal
 */
export default function mergeRequireNetworkCalls(source) {
  return source.replace(
    /require\s*\(\s*([^)]+)\s*\)\s*\.\s*(http|https)\s*\(\s*([^\)]*)\s*\)/g,
    function(_match, reqArg, proto, httpArg) {
      const protoTag = proto === "http" ? "/<HTTP>/" : "/<HTTPS>/";
      const argTrimmed = httpArg.trim();

      // Remove surrounding quotes for string literals
      function isStringLiteral(str) {
        return /^['"`].*['"`]$/.test(str.trim());
      }

      if (!argTrimmed) {
        // no argument, check if reqArg is string literal
        if (isStringLiteral(reqArg)) {
          // merge directly
          const merged = reqArg.slice(0, -1) + protoTag + reqArg.slice(-1);
          return `require(${merged})`;
        } else {
          // not a literal, fallback to +
          return `require(${reqArg} + "${protoTag}")`;
        }
      } else {
        // argument exists
        if (isStringLiteral(reqArg) && isStringLiteral(argTrimmed)) {
          const merged = reqArg.slice(0, -1) + protoTag + argTrimmed.slice(1);
          return `require(${merged})`;
        } else {
          return `require(${reqArg} + "${protoTag}" + ${argTrimmed})`;
        }
      }
    }
  );
}