---
'@clack/ui': minor
---

Makes every `createUI()` option optional. With no options, a UI renders to `process.stdout` at the terminal's size, follows resizes, and stops on SIGINT or SIGTERM. Passing a `signal` still stops it, and SIGINT is left to the caller. Bun and Deno use the same defaults.

In the browser, pass an xterm.js terminal as `output`:

```js
const ui = await createUI({ output: terminal, signal });
```
