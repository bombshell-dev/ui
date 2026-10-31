# UI tests

Tests live alongside the implementation in `src/`; this directory contains their shared fixtures and the DOM feature manifest. Run the UI tests from the workspace root:

```sh
pnpm --filter @clack/ui test
```

The test script builds the private `@bomb.sh/web-platform-tests` package before running Vitest. Use `pnpm test` from the workspace root to run the workspace tests.

## Terminal fixtures

[`createTestUI`](ui.ts) starts the real UI with an in-process [Termless terminal](terminal.ts). It supplies application-facing input/output streams and exposes the document and terminal screen. Use `await using` to dispose the UI and terminal together, and `expect.poll` to wait for rendered output, as in [`ui.test.ts`](../src/ui.test.ts).

[`createTestTerminal`](terminal.ts) can also be used independently. Its `type` and `press` helpers write to the application's input stream, and terminal responses return through that same stream. It is an async disposable resource.

Rendering, scheduling, notifications, and lifecycle behavior belong in the UI tests. [`render.test.ts`](../src/render.test.ts) exercises render requests and cancellation; [`ui.lifecycle.test.ts`](../src/ui.lifecycle.test.ts) exercises terminal restoration, pending writes, and failure propagation.

## DOM compatibility

[`dom.compatibility.test.ts`](../src/dom.compatibility.test.ts) registers the shared compatibility suite with Vitest. Its synchronous factory creates a fresh instance of the real [`Document`](../src/dom.ts) for each case, with a no-op render notification callback. The supplied global bindings are the UI's `Document`, `Element`, `Node`, and `Text` classes. This fixture owns no external resources, so it needs no disposal callback.

[`dom-features.ts`](dom-features.ts) is the source of truth for the features this integration verifies. It satisfies the suite's `DOMFeatures` type and declares every leaf explicitly. The suite also validates the manifest at runtime: omitted, unknown, and non-boolean feature values are configuration errors.

A `true` leaf enables its registered cases; a `false` leaf leaves those cases unregistered. The suite does not infer support from available methods or turn disabled features into skipped tests. Required feature dependencies must also be enabled; missing dependencies fail configuration before any tests are registered. Individual cases with additional feature requirements run only when those requirements are enabled.

Feature names describe the behavior being asserted. For example, `node.basicAppend` covers detached tree construction, while `node.append` also requires moving nodes and rejecting cycles. Passing a narrow feature does not establish support for the broader interface or complete standards conformance. The shared [feature catalogue](../../web-platform-tests/src/compatibility/features.ts) and [registry](../../web-platform-tests/src/compatibility/registry.ts) lead to each feature's cases, prerequisites, and specification references.

When implementing a feature:

1. Read its registered cases and prerequisites to understand the behavior the flag promises.
2. Implement that behavior in the UI, then enable the relevant leaves in `dom-features.ts`.
3. Extend the compatibility fixture when the cases need additional constructors, document parsing options, host input, or resource cleanup.
4. Run the UI tests and add implementation-specific regressions for rendering, notifications, or lifecycle effects.

Keep support decisions in the manifest rather than duplicating flag values or test counts in documentation.

## Host input

Host input features require a [`DOMInputDriver`](../../web-platform-tests/src/compatibility/input-driver.ts) that delivers input through the normal terminal input pipeline. A terminal adapter must resolve mouse targets through the UI's layout, await operation completion, and release held input during cleanup, including after failures. Calling `dispatchEvent`, invoking `.click()`, or directly assigning control values does not exercise that host behavior.

Keyboard/mouse delivery, platform interaction policies, and trusted-event support are separate feature decisions. Enable each only when the implementation and its adapter can satisfy its cases. The shared suite's [browser tooling](../../web-platform-tests/README.md#development) validates the input contract with Playwright; the UI adapter must use terminal layout and input semantics.
