---
'@clack/ui': minor
---

Require an AbortSignal when creating a UI. Stop the UI by aborting the signal and await main() for in-flight output and terminal restoration; UI instances no longer implement AsyncDisposable. Terminal settings are applied only when main() starts.
