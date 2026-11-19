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
pnpm --filter @clack/ui exec wpt --watch Node-parentNode -t 'Root element'
```

In an interactive terminal, the CLI watches by default similar to `vitest`. Using
`--watch` (or `-w`) forces watch mode in a non-interactive terminal. It reruns the
selected upstream files when `wpt.config.ts` or a local implementation module imported
by that config changes, including transitive imports. Config edits reload source and
case selection. Each rerun starts fresh Vitest and WPT workers, so implementation
changes take effect and upstream scripts execute again. The watcher ignores the
pinned WPT checkout, package helpers, dependencies, and generated output. Press
Ctrl+C to stop. In CI or when passing `--run`, it forces a single run and exits
on completion.

`pnpm test` and `pnpm --filter @clack/ui test` build the harness, run the local
implementation tests, and run the configured WPT cases.

## Configuration

A consumer needs only a `wpt.config.ts`. It supplies a document factory and the
implementation's global bindings, then selects upstream source paths and original
case names. See the [UI configuration](../ui/wpt.config.ts).

```ts
import type { WPTConfig } from "@bomb.sh/web-platform-tests/config";
import { createHTMLDocument, Node, Document, Element } from "./dom.ts";

export default {
  createDocument: () => createHTMLDocument(),
  globals: { Node, Document, Element },
  include: {
    "dom/nodes/Node-parentNode.html": ["Document", "Root element"],
  },
  exclude: { "**": true },
  // excluded cases that run for their shared state, but we don't wait for
  forceTimeout: {
    // Waits on an iframe load the fixture cannot deliver.
    "dom/nodes/Node-parentNode.html": ["Removed iframe"],
  },
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

`forceTimeout` lists excluded cases that run for their shared state, but we don't
wait for. It maps exact source paths to arrays of original case names. Source
paths must exist; case names are checked when their file runs. List only cases
whose unfinished work isn't needed by the selected tests.

### Framework selections

`framework()` returns selectors for the DOM features used by React, Preact, Vue,
Solid, or Svelte. Pass them to `include` with `exclude: { '**': true }` to run
that profile against the consumer's document factory and globals:

```ts
import { framework, type WPTConfig } from "@bomb.sh/web-platform-tests";
import { createDocument, globals } from "./dom.ts";

export default {
  createDocument,
  globals,
  include: framework("preact"),
  exclude: { "**": true },
} satisfies WPTConfig;
```

Pass optional modules as a second argument, such as
`framework('vue', ['transitions'])` or `framework('preact', ['hydration'])`.
`frameworks` exposes the required features and optional modules for each profile.
`features` maps individual DOM members to upstream cases, and
`featureSelectors(['Document#createElement', 'Node#textContent'])` combines their
selections. Unknown optional modules throw `CompatibilityConfigurationError`.

`uncoveredByWPT('preact')` lists required features that have no mapped cases yet.
It describes gaps in the profile's mappings, not missing DOM support. A profile
selects conformance work; passing the currently enabled UI cases does not mean
the full profile passes. These selections use the same original sources and
whole-file execution as explicit selectors.

The package tests check profile selection, optional modules, merging, and all
mapped source paths. As with the former registry-based tests, every mapped feature,
framework, and optional module must resolve to real upstream cases. Playwright runs
each original source once to collect its case names, including names generated by
helpers. JavaScript `.any.js` sources use the window wrapper from the pinned
upstream server. Missing required resources, harness errors, and unmatched selectors
fail the checks. These tests run with `pnpm test` and in CI.

## Execution and limitations

The harness parses HTML with parse5, populates the implementation's document,
and executes the original inline scripts and static local helpers in source
order within one fresh Node worker per file. It loads upstream `testharness.js` in
its shell environment and delivers window `load` after the scripts finish.
Script elements are fixture nodes; parsing them does not execute their contents.

The worker loads the consumer configuration before installing its fixture globals,
then executes the harness and test scripts in that same JavaScript realm. Consumer
methods, native Node APIs, and fixture scripts therefore share the built-in error
constructors and prototypes; no error-prototype patches or error-constructor
bindings in `globals` are needed. Each worker is terminated after its file, so
script globals, top-level lexical declarations, and module state cannot leak into
the next file. The file's `timeout` includes worker startup and configuration
loading. The harness reports ordinary timeouts at that shared deadline; a parent
watchdog allows 250 ms for those results to arrive before terminating an
unresponsive worker, including one blocked in an asynchronous callback.

Entire selected files execute, including their unselected subtests. Configuration
and CLI name filters select the results reported by Vitest. This preserves
upstream shared state and setup. Source-loading, setup, and harness errors remain
failures regardless of subtest selection.

Once scripts, window load, and all selected cases finish, the runner forces any
pending excluded cases in `forceTimeout` to time out. If a listed case is included,
the runner waits for it normally. The UI lists `Removed iframe` in
`Node-parentNode.html` because it waits for an iframe load the fixture cannot deliver.

The runner supports HTML sources and window `.any.js`/`.window.js` sources with
static helpers. It does not implement iframe navigation, parser-driven script
timing, module/async/defer scripts, server substitutions, or remote helpers.
Window event delegation currently requires extensible event objects.
Unsupported source features fail explicitly. Selecting part of a file does not
claim coverage of its remaining subtests or complete standards conformance.

Window named access resolves a single element by its nonempty `id`, or an HTML
`embed`, `form`, `img`, or `object` by its nonempty `name`. Lookup follows the
associated document's current tree, so insertion, removal, and attribute changes
take effect immediately. Existing globals and inherited properties take priority;
assignments shadow named access, and names are not enumerated. The worker installs
this lookup in its global prototype chain and restores that chain during cleanup.
Multiple matching elements and child browsing-context names fail explicitly:
live `HTMLCollection` results and iframe windows are not implemented. An iframe's
`id` can still expose the element itself. Window prototype descriptors and the
full named-properties object are outside this fixture's supported scope.

Parsed `<template>` and `<frameset>` fixtures are currently rejected. This blocks
`shadow-dom/event-composed-path.html`, selected by the React, Solid, and Svelte
profiles, even for its case without shadow roots. These profiles describe the
coverage to work toward; they can select cases needing further harness or DOM
support.

## Development

Install Chromium once before running the package's own tests (CI installs it
automatically):

```sh
pnpm --filter @bomb.sh/web-platform-tests exec playwright install chromium
```

```sh
pnpm --filter @bomb.sh/web-platform-tests build
pnpm --filter @bomb.sh/web-platform-tests typecheck
pnpm --filter @bomb.sh/web-platform-tests test
pnpm lint --warnings
pnpm format:check
pnpm --filter @clack/ui exec wpt
```

Read the original source and its helpers before enabling a case. Keep upstream
inputs, assertions, and execution order intact. Extend the harness only to supply
fixture capabilities; implement missing DOM behavior in the consumer.
