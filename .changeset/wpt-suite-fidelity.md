---
'@bomb.sh/web-platform-tests': patch
---

Align the DOM compatibility suite with upstream WPT cases at a shared revision, mirror upstream source paths for tests and helpers, and remove locally authored scenarios and unused code. Keep local harness code in `src/shared`. Expose typed document and global bindings through the test fixture. Configure global bindings alongside upstream file and case selection in `wpt.config.ts`, with includes taking precedence over exclusions instead of requiring other test groups to be enabled. Register a todo when every case is excluded.

Complete supported upstream matrices and record the concrete fixture limitations behind remaining omissions.
