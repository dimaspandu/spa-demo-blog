/**
 * logger.js
 * ----------
 * A minimal, dependency-free colorized logger for Node.js environments.
 * Provides standardized console outputs with ANSI color codes.
 * Works in most modern terminals and automatically resets color after each log.
 */

// ANSI color codes for terminal text formatting
const colors = {
  reset: "\x1b[0m",      // Reset all styles
  bold: "\x1b[1m",       // Bold text
  dim: "\x1b[2m",        // Dimmed text
  underline: "\x1b[4m",  // Underlined text
  red: "\x1b[31m",       // Red text
  green: "\x1b[32m",     // Green text
  yellow: "\x1b[33m",    // Yellow text
  blue: "\x1b[34m",      // Blue text
  magenta: "\x1b[35m",   // Magenta text
  cyan: "\x1b[36m",      // Cyan text
  gray: "\x1b[90m",      // Gray text
};

// Check if terminal supports color output (non-TTY disables colors)
const useColor = process.stdout.isTTY;

/**
 * Helper function to wrap text in ANSI colors if color output is enabled.
 */
function colorize(colorCode, text) {
  return useColor ? `${colorCode}${text}${colors.reset}` : text;
}

/**
 * Logger object exposing multiple logging levels:
 *  - info:    Informational messages (cyan)
 *  - warn:    Warning messages (yellow)
 *  - error:   Error messages (red)
 *  - success: Success messages (green)
 *  - debug:   Developer-only messages (magenta)
 *
 * Each log is timestamped for easier debugging during runtime.
 */
const logger = {
  info: (msg) => {
    console.log(`${colorize(colors.cyan, "[INFO]")} ${msg}`);
  },

  warn: (msg) => {
    console.warn(`${colorize(colors.yellow, "[WARN]")} ${msg}`);
  },

  error: (msg) => {
    console.error(`${colorize(colors.red, "[ERROR]")} ${msg}`);
  },

  success: (msg) => {
    console.log(`${colorize(colors.green, "[SUCCESS]")} ${msg}`);
  },

  debug: (msg) => {
    console.log(`${colorize(colors.magenta, "[DEBUG]")} ${msg}`);
  },
};

// Optional: export both logger and colors for advanced custom use
export { logger, colors };
export default logger;
