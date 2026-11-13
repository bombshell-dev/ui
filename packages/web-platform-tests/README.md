# @bomb.sh/web-platform-tests

Private workspace package containing reusable DOM compatibility assertions. It contains no DOM implementation. Only `@clack/ui` tests consume its package API; browser validation is development tooling.

The suite includes adaptations of [Web Platform Tests (WPT)](https://github.com/web-platform-tests/wpt) covering DOM operations, state/style interactions, input, shadow DOM, forms, CSSOM, selection, traversal, and parsing.

The suite uses one upstream WPT revision, recorded in [WPT_REVISION](WPT_REVISION). Browse that revision [here](https://github.com/web-platform-tests/wpt/tree/b719612f963a05ece9c89a7dd7598c1c59618874). Files under `src/wpt` mirror upstream paths with `.ts` appended; the revision applies to all files and cases. See [attribution and licenses](test/wpt/README.md).

### Required WPT correspondence

Each file under `src/wpt` corresponds to its upstream path with the final `.ts` removed. For example, `src/wpt/dom/nodes/Document-createElement.html.ts` adapts `dom/nodes/Document-createElement.html`. Keep upstream spelling and capitalization for tests, helpers, and data. Local harness code lives in `src/shared`; comments explain non-obvious adaptations.

Keep ordinary `context.test` and `expect` calls and readable case names. Preserve upstream inputs, setup, operation order, assertions, exceptions, node identities, and relationships between documents. A file's presence identifies the selected adaptations, not coverage of every upstream case. [Omissions](docs/omissions.md) records skipped upstream cases and why.

The WPT suite must contain only faithful adaptations of existing upstream cases. Do not invent scenarios, add local assertions, extend upstream input matrices, or create specification-derived cases here. Independently authored subtleties, regressions, and implementation-specific checks belong in separate tests outside this suite. Necessary harness adaptations must preserve the upstream behavior being tested. Tests of the harness itself are separate infrastructure tests.

The shared suite is the long-term home of upstream WPT coverage for the UI. Implementation-specific rendering, notification, and lifecycle checks belong in the corresponding UI integration tests.

```ts
import { testDOMCompatibility } from '@bomb.sh/web-platform-tests';
import { describe, it, expect } from 'vitest';
import { createDocument, dispose } from './implementation-fixture.ts';
import config from './wpt.config.ts';

testDOMCompatibility({
  runner: { describe, it, expect },
  config,
  create: createDocument,
  dispose,
  // input: document => createHostInputSession(document),
});
```

### Selecting tests

The `config` option is optional; omitting it runs all adapted cases. A `WPTConfig` supplies source-path selectors in `include` and `exclude`; an explicit include always wins. Each value is `true` for the entire source file or an array of exact case names and regular expressions matching case names.

When selection excludes every case, the harness registers a todo through `runner.it.todo` to start implementing DOM features and enable their WPT cases.

```ts
import type { WPTConfig } from '@bomb.sh/web-platform-tests';
import { globals } from './implementation-fixture.ts';

export default {
  globals,
  exclude: { 'dom/nodes/Node-insertBefore.html': true },
  include: { 'dom/nodes/Node-insertBefore.html': [/reference child/] },
} satisfies WPTConfig;
```

Source paths support `*` within a path segment and `**` across directories; `**/` also matches zero directories. Other characters are literal. Case-name strings match exactly. Empty, invalid, or unmatched selectors fail configuration before any cases register, so stale exclusions remain visible.

Cases have no test-to-test prerequisite gates. A selected case exercises its supporting DOM operations and reports failures normally. Globals and host input are resolved lazily when the case uses them. The runner can narrow selected cases further with its usual name filter.

Run `pnpm generate` after adding, moving, or removing source files. The build also regenerates the registry from filenames. Only files exporting `register` are test entrypoints; upstream support files are imported by those tests. `node scripts/generate-registry.mjs --check` verifies that the checked-in registry is current.

### Harness

* `create(options?)`: A synchronous or asynchronous factory for a fresh `Document`. Cases using the default HTML document expect its doctype, `html`, `head`, and `body` tree. When a case supplies `DOMDocumentOptions`, honor its markup, MIME type, and URL fragment; the selector matrix uses these to test HTML, XHTML, and `:target`.
* `config.globals`: An object containing the implementation's global bindings, or a function that returns them for each fresh document. Tests destructure typed bindings from the fixture, such as `({ document, Node, Text })`. Omitting globals supplies no bindings; accessing a missing binding throws.
* `input`: An optional factory for a `DOMInputDriver` session that delivers keyboard, text, and mouse input through the implementation's normal host input pipeline. This allows testing of default actions like focus on click, form submission on `Enter`, and trusted events.
* `dispose(document)`: Optional cleanup for implementation-owned resources after each case, including failures.

### Development

```sh
pnpm build
pnpm test
pnpm --filter @bomb.sh/web-platform-tests typecheck
pnpm --filter @bomb.sh/web-platform-tests exec playwright install chromium
pnpm --filter @bomb.sh/web-platform-tests test:browser:build
pnpm --filter @bomb.sh/web-platform-tests test:browser:input
pnpm --filter @bomb.sh/web-platform-tests test:browser:run
pnpm --filter @bomb.sh/web-platform-tests test:wpt-selectors
# Manual, without input: open /compatibility.html on the printed URL
pnpm --filter @bomb.sh/web-platform-tests test:browser
```
To validate the test suite itself, run it against an actual browser runtime. Browser dependencies are development-only.

The automation CLI uses Playwright's Chromium with a fresh iframe per case and a new browser context every 500 cases to bound memory use.

The [selector audit](scripts/check-wpt-selectors.mjs), run by `test:wpt-selectors` and CI, checks registered case names, matrix data, API masks, and fixture bytes against the pinned upstream sources. It covers selector API files in `dom/nodes` plus `is-where-basic.html` and `has-basic.html`; the script records exclusions. Downloads are cached in ignored `node_modules/.cache`, and reports go to stdout. After changing selector adaptations or the suite revision, run this audit and browser validation, and review the assertions against upstream.

The suite asserts resulting DOM behavior, never browser pixel values. Browser target resolution uses the browser's own rectangles and iframe coordinate offsets; a terminal adapter must use its own renderer.

#### Browser results

Browser validation keeps upstream expectations intact. Failures remain enabled
and produce a nonzero exit code.

Chromium 156 fails `css/cssom/cssstyledeclaration-properties.html` because it
exposes `color` as an own property. The pinned upstream test fails the same
assertion. This case remains enabled in both the browser and UI configurations.

The imported `css/css-display/parsing/display-valid.html` matrix also exposes
Chromium's unsupported `run-in` and `ruby-base` values. These cases fail
identically upstream and remain enabled in browser validation; the UI selects
its supported `inline` and `flex` cases.

### Coverage boundaries

The [adapted sources](src/wpt) and generated [registry](src/shared/registry.ts) describe the executable coverage. Harness tests check source identity, case selection, and reachability of every source module. The [UI configuration](../ui/test/wpt.config.ts) records the cases enforced by that integration; the [UI test README](../ui/test/README.md) explains how to select additional cases while implementing them. Passing selected cases does not imply complete standards conformance.

Remaining test gaps include:

- DOM mutation validity and adoption permutations, Web IDL conversions and brands, collection descriptors and iteration mutations, complete selector grammar and HTML reflection, and XML namespace/entity/PI/CDATA cases.
- The full HTML tree-construction and contextual parsing corpora, malformed foreign markup, sanitization, and Trusted Types.
- Legacy event initialization and listener-option conversions; overlapping observer registrations and custom-element/slotchange/promise ordering; complete Range endpoint and mutation matrices, NodeIterator filtering/mutations, and text-control selectionchange scheduling.
- Complete control-type value/validity/stepping matrices, files and pickers, FormData and submission interleavings, network submission, and select UI policies.
- Customized built-ins, scoped custom-element registries, ElementInternals and form-state restoration, reaction ordering, nested-slot redistribution, focus navigation scopes, focus-visible preferences, and modal/inert exceptions.
- Full CSS property grammar and computed values, revert/revert-layer, layer/import interactions, stylesheet loading/CORS/grouping and cross-document adoption, media/container queries, and animation/transition timelines.
- IME/composition, clipboard, repeat timing, drag/drop, touch/pen/wheel, multi-click selection, editing history and input target ranges, further textarea/contenteditable editing, nested-shadow navigation, and platform command bindings.

Exact geometry, visual-line navigation, caret painting, scroll positioning, occlusion, hit-testing geometry matrices, and visual-output assertions require additional renderer integration. Shared input tests assert resulting behavior without assuming browser-equivalent pixels. Platform interaction policies and trusted-event support remain independently selectable.
