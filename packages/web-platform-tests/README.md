# @bomb.sh/web-platform-tests

Run original [Web Platform Tests (WPT)](https://github.com/web-platform-tests/wpt)
against a DOM implementation. This private workspace package supplies a CLI,
HTML fixtures, and a Vitest transform. Each upstream source appears as a separate
test file, with individually reported subtests.

The [`wpt`](wpt) submodule pins the upstream sources at the revision recorded in
[WPT_REVISION](WPT_REVISION). Upstream authorship and licenses remain in the
checkout; see [WPT's license](wpt/LICENSE.md). The local harness uses the package's
[MIT license](LICENSE).

## Running tests

From the workspace root:

```sh
git submodule update --init packages/web-platform-tests/wpt
pnpm --filter @bomb.sh/web-platform-tests build
pnpm --filter @clack/ui exec wpt
```

Subsequent runs need no rebuild unless the harness changes. The CLI accepts
`--config path/to/wpt.config.ts`, optional filename filters, and `-t`/`--name` for
subtest names:

```sh
pnpm --filter @clack/ui exec wpt Node-parentNode -t 'Root element'
pnpm --filter @clack/ui exec wpt --config wpt.config.ts Document-createElementNS
```

`pnpm test` and `pnpm --filter @clack/ui test` build the harness, run the local
implementation tests, and run the configured WPT cases.

## Configuration

A consumer needs only a `wpt.config.ts`. It supplies a document factory and the
implementation's global bindings, then selects upstream source paths and original
case names. See the [UI configuration](../ui/wpt.config.ts).

```ts
import type { WPTConfig } from '@bomb.sh/web-platform-tests/config';
import { createHTMLDocument, Node, Document, Element } from './dom.ts';

export default {
  createDocument: () => createHTMLDocument(),
  globals: { Node, Document, Element },
  include: {
    'dom/nodes/Node-parentNode.html': ['Document', 'Root element'],
  },
  exclude: { '**': true },
} satisfies WPTConfig;
```

`createDocument()` returns a fresh document for each upstream file. The harness
populates it with that file's HTML and installs `document.defaultView`.
`globals` supplies the constructors and other bindings the tests use. `timeout`
sets the maximum execution time per file in milliseconds; the default is 15,000.

Source keys support `*` within a path segment and `**` across directories. Values
are `true` for every subtest in a source or arrays of exact names and regular
expressions. Explicit includes override exclusions; otherwise cases are included
unless excluded. Use `exclude: { '**': true }` to enable cases incrementally.
Invalid or unmatched selectors fail configuration.

## Execution and limitations

The harness parses HTML with parse5, populates the implementation's document,
and executes the original inline scripts and static local helpers in source
order within one window context per file. It loads upstream `testharness.js` in
its shell environment and delivers window `load` after the scripts finish.
Script elements are fixture nodes; parsing them does not execute their contents.

Entire selected files execute, including their unselected subtests. Configuration
and CLI name filters select the results reported by Vitest. This preserves
upstream shared state and setup. Source-loading, setup, and harness errors remain
failures regardless of subtest selection.

The excluded `Removed iframe` case in `Node-parentNode.html` is explicitly forced
to time out after window load and the selected cases finish. Selecting that case
disables this exception. It depends on an iframe load the fixture cannot deliver.

The runner supports HTML sources and window `.any.js`/`.window.js` sources with
static helpers. It does not implement iframe navigation, parser-driven script
timing, module/async/defer scripts, server substitutions, or remote helpers.
Unsupported source features fail explicitly. Selecting part of a file does not
claim coverage of its remaining subtests or complete standards conformance.

## Development

```sh
pnpm --filter @bomb.sh/web-platform-tests build
pnpm --filter @bomb.sh/web-platform-tests typecheck
pnpm lint --warnings
pnpm format:check
pnpm --filter @clack/ui exec wpt
```

Read the original source and its helpers before enabling a case. Keep upstream
inputs, assertions, and execution order intact. Extend the harness only to supply
fixture capabilities; implement missing DOM behavior in the consumer.
