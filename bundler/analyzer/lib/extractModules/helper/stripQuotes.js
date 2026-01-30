export default function stripQuotes(str) {
  return str.replace(/^["'`]/, "").replace(/["'`]$/, "");
}