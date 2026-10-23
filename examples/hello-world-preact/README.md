# Hello Preact

A Preact component mounted on a nested Clack element, without styles or a global
`document`. It keeps `Hello ` on screen while erasing and typing `World!`, `DOM!`,
`Preact!`, and `Clack!` in a repeating loop.

From the workspace root:

```sh
pnpm install
pnpm build
pnpm --filter @examples/hello-world-preact start
```

Press Ctrl+C to exit. Unmounting cancels the animation timer, and disposing the UI
restores the terminal buffer and cursor.
