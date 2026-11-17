---
'@bomb.sh/web-platform-tests': patch
---

Run original upstream Web Platform Tests from a pinned submodule through a package CLI and Vitest transform. Consumers supply a document factory, global bindings, and source/case selection in `wpt.config.ts`. Execute whole files with their upstream helpers and shared state, then report selected subtests individually. Replace the adapted suite, generated registry, framework profiles, and browser adaptation tooling.
