---
'@bomb.sh/web-platform-tests': patch
---

Allow runners to filter configured WPT cases before test registration. Provide a Vitest integration and a Router-based `wpt` command that accepts literal search text, so focused runs omit unrelated cases instead of reporting them as skipped.
