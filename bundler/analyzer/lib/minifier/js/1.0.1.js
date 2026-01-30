import tokenizer from "../tokenizer/main.js";
import stringifyJSTokens from "../stringifyTokens/main.js";

/**
 * minifyJS(code, options)
 * ------------------------------------------------------------
 * Token-based JavaScript minifier with configurable behavior.
 *
 * This function performs a safe, deterministic JS minification by:
 * 1. Tokenizing the input source code.
 * 2. Removing or rewriting non-semantic tokens based on options.
 * 3. Re-stringifying the resulting token stream.
 *
 * Design principles:
 * - No AST parsing
 * - No semantic rewrites
 * - No identifier mangling
 * - Template literals are preserved unless explicitly configured
 *
 * @param {string} code
 * @param {object} [options]
 * @returns {string}
 */
export default function minifyJS(code, options = {}) {
  if (typeof code !== "string" || code.length === 0) return "";

  const cfg = {
    removeWhitespace: true,
    removeNewlines: true,
    removeComments: true,
    normalizeTemplateNewlines: false,
    ...options
  };

  const tokens = tokenizer(code);

  const cleanedTokens = [];

  for (const token of tokens) {
    // --- Remove trivia tokens ---
    if (
      (cfg.removeWhitespace && token.type === "whitespace") ||
      (cfg.removeNewlines && token.type === "newline") ||
      (cfg.removeComments && token.type === "comment")
    ) {
      continue;
    }

    // --- Normalize template literal newlines ---
    if (
      cfg.normalizeTemplateNewlines &&
      (token.type === "template" || token.type === "template_chunk")
    ) {
      cleanedTokens.push({
        ...token,
        value: normalizeTemplateNewlines(token.value)
      });
      continue;
    }

    cleanedTokens.push(token);
  }

  return stringifyJSTokens(cleanedTokens);
}

/**
 * Encode literal newlines inside template literals
 * into escaped "\n" sequences.
 *
 * This preserves runtime string value while allowing
 * single-line output formatting.
 */
function normalizeTemplateNewlines(value) {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n/g, "\\n");
}
