---
'@bomb.sh/web-platform-tests': patch
---

Adds framework profiles that map the DOM features React, Preact, Vue, Solid, and Svelte use to the WPT cases covering them. `frameworkSelectors()` returns selectors for a framework and its optional modules, and `uncoveredFeatures()` lists required features without adapted WPT coverage.
