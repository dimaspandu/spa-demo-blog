/**
 * Normalize string for comparison:
 * - Convert CRLF to LF
 * - Preserve newlines at start/end
 */
export default function normalize(str) {
  return str.replace(/\r\n/g, "\n").replace(/\s+/g, " ").trim();
}