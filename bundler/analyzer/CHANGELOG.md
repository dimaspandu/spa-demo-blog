# Changelog

All notable changes to this project will be documented in this file.

# [1.2.0] - 2026-01-25

## Added

- SAFE mode whitespace normalization:
  - Collapses consecutive or long whitespace tokens into a single space.
  - Automatically trims leading and trailing whitespace in SAFE output.
- Regression tests for CSS token adjacency handling, including:
  - `dimension + hash` (e.g. `1px #fff`)
  - Integration coverage for SAFE vs DEEP behavior.

## Changed

- SAFE minification behavior updated:
  - No longer preserves original indentation or excessive spacing.
  - Guarantees clean, single-space normalized output without re-stringification.
- SAFE mode output is now deterministic and idempotent.

## Fixed

- Fixed invalid CSS output in DEEP mode where `dimension` followed by `hash`
  could merge without required whitespace (e.g. `1px#fff`).
- Prevent leading and trailing whitespace artifacts in SAFE mode output.

---

# [1.1.0] - 2026-01-23

## Added

- CSS minifier enhanced with three levels:
  - `DEEP` (default): fully aggressive minification; removes comments, newlines, and all whitespace, then re-stringifies tokens.
  - `SMART`: removes comments and newlines; collapses consecutive whitespace into a single space; preserves single-space readability.
  - `SAFE`: removes comments and newlines only; preserves all original whitespace to avoid risky re-stringification.
- Leading and trailing newlines ignored in `SMART` mode to prevent extra spaces.
- Comprehensive test coverage added for all three levels, including:
  - Basic declarations, selectors, pseudo-classes, combinators.
  - Functions (`calc`, `linear-gradient`) and URL/string values.
  - Nested rules, media queries, and edge-case whitespace handling.

## Changed

- Default minification level changed from `SAFE` → `DEEP`.
- `minifyCSS` implementation refactored for clarity and maintainability.

## Fixed

- Prevent extra whitespace at start/end of minified CSS in `SMART` mode.
- Preserve spacing for single whitespace between values in `SMART` mode.

---

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

# [1.0.0] - 2026-01-12

## Added

- Initial release of **JS Analyzer**.
- Core modules:
  - `lib/tokenizer` for JS, CSS, HTML, JSON.
  - `lib/stringifyTokens` for JS, CSS, HTML, JSON.
  - `lib/minifier` for JS, CSS, HTML, JSON.
  - `lib/extractModules` for module detection.
  - `transpileImportTokensToCJS` and `transpileExportTokensToCJS`.
  - `convertESMToCJSWithMeta` for full JS pipeline orchestration.
- Deterministic, token-based processing model.
- Test harness with aggregated test runner.
- Minifier supports safe operator spacing, comments, whitespace, and newline removal.
- Example minification:  
  `const percent = total === 0 ? 0 : ((passed/total) * 100).toFixed(2);` consistently minified.
- Explicit test coverage ensuring **multiline template literal whitespace and empty lines are preserved** during minification.

## Changed

- N/A (initial release).

## Deprecated

- N/A

## Removed

- N/A

## Fixed

- N/A

## Security

- N/A
