/**
 * Normalize string for comparison:
 * - Convert CRLF to LF
 * - Preserve newlines at start/end
 */
function normalize(str) {
  str = String(str ?? "");
  return str.replace(/\r\n/g, "\n").replace(/\s+/g, " ").trim();
}

// Setup mocks first
const testResults = [];

/**
 * runTest(name, input, expected, final)
 * 
 * Executes a single test case by comparing the provided `input` with the `expected` output.
 * Both values are normalized using `normalize()` to avoid false negatives caused by 
 * formatting differences (e.g., spacing, quotes, JSON formatting).
 * 
 * Parameters:
 * - name (string): A descriptive name for the test case.
 * - input (any): The actual value or result produced by the module/code.
 * - expected (any): The expected value to compare against.
 * - final (boolean, optional): If set to true, the function will print a summary table
 *   of all test results recorded in `testResults` so far. Defaults to false.
 * 
 * Behavior:
 * - Compares normalized input and expected values.
 * - Stores the result as { name, pass } in `testResults`.
 * - Prints PASS/FAIL for the current test.
 * - If the test fails, prints actual and expected values for debugging.
 * - If `final` is true, aggregates all test results and prints a summary table 
 *   with total tests, passed, failed, and pass percentage per test name.
 */
export default function runTest(name, input, expected, final = false) {
  const RED = "\x1b[31m";
  const GREEN = "\x1b[32m";
  const RESET = "\x1b[0m";

  const result = input;
  const pass = normalize(JSON.stringify(result)) === normalize(JSON.stringify(expected));

  testResults.push({ name, pass });

  console.log(`--- Test: ${name} ---`);
  console.log(pass ? `${GREEN}PASS${RESET}` : `${RED}FAIL${RESET}`);

  if (!pass) {
    console.log(`${RED}--- Output ---${RESET}`, result);
    console.log(`${RED}--- Expected ---${RESET}`, expected);
  }

  if (!final) return;

  // ---- Summary Table ----
  const grouped = {};
  for (const { name, pass } of testResults) {
    if (!grouped[name]) grouped[name] = [];
    grouped[name].push(pass);
  }

  const summary = Object.entries(grouped).map(([name, results]) => {
    const total = results.length;
    const passed = results.filter(r => r).length;
    const failed = total - passed;
    const percent = total === 0 ? 0 : ((passed / total) * 100).toFixed(2);

    return { name, total, passed, failed, "pass %": percent };
  });

  console.table(summary);

  // Print only failed rows with highlight
  const failedRows = summary.filter(r => r.failed > 0);

  if (failedRows.length > 0) {
    console.log(`\n${RED}Failed Tests:${RESET}`);
    failedRows.forEach(row => {
      console.log(
        `${RED}${row.name}${RESET} | total: ${row.total}, passed: ${row.passed}, failed: ${row.failed}, pass%: ${row["pass %"]}`
      );
    });
  }
}