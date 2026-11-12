# UI tests

Tests live alongside the implementation in `src/`; this directory contains their shared fixtures and WPT configuration. Run the UI tests from the workspace root:

```sh
pnpm --filter @clack/ui test
```

The test script builds the private `@bomb.sh/web-platform-tests` package before running Vitest. Use `pnpm test` from the workspace root to run the workspace tests.

## Terminal fixtures

[`createTestUI`](ui.ts) starts the real UI with an in-process [Termless terminal](terminal.ts). It supplies application-facing input/output streams and exposes the document and terminal screen. Use `await using` to dispose the UI and terminal together, and `expect.poll` to wait for rendered output, as in [`ui.test.ts`](../src/ui.test.ts).

[`createTestTerminal`](terminal.ts) can also be used independently. Its `type` and `press` helpers write to the application's input stream, and terminal responses return through that same stream. It is an async disposable resource.

Rendering, scheduling, notifications, and lifecycle behavior belong in the UI tests. [`render.test.ts`](../src/render.test.ts) exercises render requests and cancellation; [`ui.lifecycle.test.ts`](../src/ui.lifecycle.test.ts) exercises terminal restoration, pending writes, and failure propagation.

## DOM compatibility

[`dom.compatibility.test.ts`](../src/dom.compatibility.test.ts) registers the shared compatibility suite with Vitest. Its synchronous factory creates a fresh instance of the real [`Document`](../src/dom.ts) for each case, with a no-op render notification callback. This fixture owns no external resources, so it needs no disposal callback.

[`dom.test.ts`](dom.test.ts) explicitly holds local DOM coverage missing from the enabled WPT cases. This is usually because getting the WPT test prequisites set up is too onerous a task. For example, testing node properties like nextSibling and previousSibling require things like `document.implementation.createDocumentType()`

[`wpt.config.ts`](wpt.config.ts) supplies the implementation's `globals` and selects the upstream files and cases enforced by this integration. Add new global bindings there. Omitting `config` runs all adapted cases; `exclude` removes matches and explicit `include` rules take precedence. Source keys support `*` and `**`; values are `true` for a whole source or arrays of exact case names and regular expressions. Unmatched rules are configuration errors. No other test groups must be enabled to run a case.

The configuration explicitly excludes unsupported directories. Add includes or narrow exclusions as cases pass. Selecting a source runs all of our adapted cases from that file; it does not imply complete coverage of the upstream file or interface.

Include the source or case in the configuration while implementing it. Vitest's `-t` can narrow the configured selection by source path and case name:

```sh
pnpm --filter @clack/ui test src/dom.compatibility.test.ts -t 'Document-createElement.html.*createElement\(foo\)'
```

If the shared package is already built, avoid rebuilding by using `pnpm --filter @clack/ui exec bsh test src/dom.compatibility.test.ts` with the same name filter.

When implementing behavior, read the source-named file under [`src/wpt`](../../web-platform-tests/src/wpt), implement its operations, and update the configuration once its cases pass. Extend the fixture when cases need document parsing, host input, or cleanup. Implementation-specific rendering, notification, and lifecycle checks remain in the UI tests.

## Host input

Host input cases require a [`DOMInputDriver`](../../web-platform-tests/src/shared/input-driver.ts) that delivers input through the normal terminal input pipeline. A terminal adapter must resolve mouse targets through the UI's layout, await operation completion, and release held input during cleanup, including after failures. Calling `dispatchEvent`, invoking `.click()`, or directly assigning control values does not exercise that host behavior.

Select keyboard/mouse delivery, platform interaction policies, and trusted-event cases independently as the implementation and its adapter support them. The shared suite's [browser tooling](../../web-platform-tests/README.md#development) validates the input contract with Playwright; the UI adapter must use terminal layout and input semantics.
