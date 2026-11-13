---
'@bomb.sh/web-platform-tests': patch
---

Adds framework profiles that map the DOM features React 19.3, Preact 11.2, Vue 3.5, Solid 1.9, and Svelte 5.57 use to the WPT cases covering them. `framework()` returns selectors for a framework and its optional modules, and `uncoveredByWPT()` lists required features without adapted WPT coverage.
