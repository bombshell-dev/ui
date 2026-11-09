# @bomb.sh/web-platform-tests

Private workspace package containing reusable DOM compatibility assertions. It contains no DOM implementation. Only `@clack/ui` tests consume its package API; browser validation is development tooling.

The suite includes adaptations of [Web Platform Tests (WPT)](https://github.com/web-platform-tests/wpt) covering DOM operations, state/style interactions, input, shadow DOM, forms, CSSOM, selection, traversal, and parsing.

Each adapted file records its upstream sources and original author attribution in comments or source metadata. The original WPT BSD-3-Clause notice and the html5lib parsing corpus MIT notice are retained. See [standards references and licenses](docs/references.md) for the pinned sources, attribution, and applicable licenses.

```ts
import { testDOMCompatibility, type DOMFeatures } from '@bomb.sh/web-platform-tests';
import { describe, it, expect } from 'vitest';
import { features, createDocument, globals, dispose } from './implementation-fixture.ts';

testDOMCompatibility({
  runner: { describe, it, expect },
  features,
  create: createDocument,
  globals,
  dispose,
  // input: document => createHostInputSession(document),
});
```

### Selecting features to verify

Supply a runner with `describe`, `it`, and Vitest-compatible `expect` matchers, plus a set of `features` conforming to the `DOMFeatures` interface. Every feature must be explicitly declared supported or unsupported. The suite registers cases for enabled features and checks their prerequisites before registration.

### Harness

* `create(options?)`: A synchronous or asynchronous factory for a fresh `Document`. When a case supplies `DOMDocumentOptions`, honor its markup, MIME type, and URL fragment; the selector matrix uses these to test HTML, XHTML, and `:target`.
* `globals`: An object containing the implementation's global bindings, or a function that returns them for a document. For example, a test looks up `HTMLInputElement` on this object.
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

The automation CLI uses Playwright's Chromium with an isolated browser context and fresh standards-mode iframe per case.

The [selector WPT omission check](docs/wpt-selectors.md) compares the adapted registrations with actual pinned upstream case names. Its cache is ignored, and results are printed rather than committed.

The suite asserts resulting DOM behavior, never browser pixel values. Browser target resolution uses the browser's own rectangles and iframe coordinate offsets; a terminal adapter must use its own renderer.

#### Known Chromium disagreements

The following eight cases are allowed to fail when validating the suite in Chromium. They remain enabled, and the runner reports their failures and returns a nonzero exit code. Other failures require investigation.

| Feature and case | Chromium behavior | Retained expectation/reference |
| --- | --- | --- |
| [`document.xmlSerialization`](src/compatibility/document/xml-serialization.ts): omits a redundant empty default namespace declaration | Retains the child's `xmlns=""` when the inherited namespace is already empty. | [XML serialization](https://w3c.github.io/DOM-Parsing/#xml-serialization-algorithm) omits the redundant declaration; [pinned WPT](https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/domparsing/XMLSerializer-serializeToString.html). |
| [`document.xmlSerialization`](src/compatibility/document/xml-serialization.ts): omits a redundant nonempty default namespace declaration | Retains the child's declaration when it repeats the inherited namespace. | Same XML serialization rule and pinned WPT. |
| [`document.xmlSerialization`](src/compatibility/document/xml-serialization.ts): emits attribute nodes as empty strings even when their values are nonempty | Serializes the attribute's escaped value. | The [Attr serialization branch](https://w3c.github.io/DOM-Parsing/#xml-serializing-a-node) returns an empty string. The local case extends WPT's empty-valued Attr with a nonempty value. |
| [`focus.removal`](src/compatibility/focus/removal.ts): removing a focused node clears focus without firing blur | Fires `blur` during removal. | [HTML removing steps](https://html.spec.whatwg.org/multipage/infrastructure.html#html-element-removing-steps). |
| [`elements.input.radioGroups`](src/compatibility/elements/input/radio-groups.ts): groups radios by tree and nonempty name | The previous group member stays checked after a checked detached radio changes name. | [Radio group updates](https://html.spec.whatwg.org/multipage/input.html#radio-button-state-(type=radio)); [WPT disconnected groups](https://github.com/web-platform-tests/wpt/blob/master/html/semantics/forms/the-input-element/radio-disconnected-group-owner.html). |
| [`elements.input.labels`](src/compatibility/elements/input/labels.ts): keeps retained labels live when a detached control moves under a label | Retained labels stay empty. | [Live labels in the same tree](https://html.spec.whatwg.org/multipage/forms.html#dom-lfe-labels). |
| [`elements.textarea.labels`](src/compatibility/elements/textarea/labels.ts): keeps retained labels live when a detached control moves under a label | Retained labels stay empty. | Same live-label rule. |
| [`element.selectors`](src/compatibility/element/selectors/grammar.ts): WPT `querySelector-mixed-case.html`, mixed HTML/SVG/MathML tree with various mixed-case attributes | `[viewbox]` matches four elements where WPT expects two HTML elements. | The [pinned upstream case](https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/dom/nodes/querySelector-mixed-case.html) produces the same failure in Chromium; its assertions remain unchanged. |

### Coverage boundaries

The [feature catalogue](src/compatibility/features.ts) and [registry](src/compatibility/registry.ts) describe the executable coverage. Harness tests check that every feature has a module, registered cases, and specification references. The [UI feature manifest](../ui/test/dom-features.ts) declares its implementation's supported features; the [UI test README](../ui/test/README.md) explains the integration and how to update those decisions. [WPT references and licenses](docs/references.md) identify the selected upstream adaptations. Passing selected cases does not imply complete standards conformance.

Remaining test gaps include:

- DOM mutation validity and adoption permutations, Web IDL conversions and brands, collection descriptors and iteration mutations, complete selector grammar and HTML reflection, and XML namespace/entity/PI/CDATA cases.
- The full HTML tree-construction and contextual parsing corpora, malformed foreign markup, sanitization, and Trusted Types.
- Legacy event initialization and listener-option conversions; overlapping observer registrations and custom-element/slotchange/promise ordering; complete Range endpoint and mutation matrices, NodeIterator filtering/mutations, and text-control selectionchange scheduling.
- Complete control-type value/validity/stepping matrices, files and pickers, FormData and submission interleavings, network submission, and select UI policies.
- Customized built-ins, scoped custom-element registries, ElementInternals and form-state restoration, reaction ordering, nested-slot redistribution, focus navigation scopes, focus-visible preferences, and modal/inert exceptions.
- Full CSS property grammar and computed values, revert/revert-layer, layer/import interactions, stylesheet loading/CORS/grouping and cross-document adoption, media/container queries, and animation/transition timelines.
- IME/composition, clipboard, repeat timing, drag/drop, touch/pen/wheel, multi-click selection, editing history and input target ranges, further textarea/contenteditable editing, nested-shadow navigation, and platform command bindings.

Exact geometry, visual-line navigation, caret painting, scroll positioning, occlusion, hit-testing geometry matrices, and visual-output assertions require additional renderer integration. Shared input tests assert resulting behavior without assuming browser-equivalent pixels. Platform interaction policies and trusted-event support remain independently selectable.
