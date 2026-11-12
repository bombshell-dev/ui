# UI tests

Tests live alongside the implementation in `src/`; this directory contains their
terminal fixtures. Run the UI tests from the workspace root:

```sh
pnpm --filter @clack/ui test
```

The script builds the private WPT harness, runs local Vitest tests, and runs the
upstream cases selected by [`wpt.config.ts`](../wpt.config.ts). Use `pnpm test`
from the workspace root to run all workspace tests.

[`preact.test.tsx`](preact.test.tsx) checks direct Preact rendering, updates, events, cleanup, and terminal repainting.

## Terminal fixtures

[`createTestUI`](ui.ts) starts the real UI with an in-process
[Termless terminal](terminal.ts). It supplies application-facing input/output
streams and exposes the document and terminal screen. Use `await using` to dispose
the UI and terminal together, and `expect.poll` to wait for rendered output, as in
[`ui.test.ts`](../src/ui.test.ts).

[`createTestTerminal`](terminal.ts) can also be used independently. Its `type` and
`press` helpers write to the application's input stream, and terminal responses
return through that same stream. It is an async disposable resource.

Rendering, scheduling, notifications, and lifecycle behavior belong in the UI
tests. [`render.test.ts`](../src/render.test.ts) exercises render requests and
cancellation; [`ui.lifecycle.test.ts`](../src/ui.lifecycle.test.ts) exercises
terminal restoration, pending writes, and failure propagation.

## DOM conformance

[`wpt.config.ts`](../wpt.config.ts) supplies the document factory and global
bindings used by original Web Platform Test files. Add source paths and original
case names there while implementing DOM behavior. The
[WPT harness README](../../web-platform-tests/README.md) describes selection,
whole-file execution, and fixture capabilities.

After building the harness once, run selected cases without rebuilding:

```sh
pnpm --filter @clack/ui exec wpt Node-parentNode -t 'Root element'
```

Read the upstream source and helpers under
[`packages/web-platform-tests/wpt`](../../web-platform-tests/wpt) when working
through failures. All subtests in selected files execute; only configured and
name-filtered results are reported. Implementation-specific rendering and
lifecycle checks remain in the local UI tests.
