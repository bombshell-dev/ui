# DOM compatibility integration

`src/dom.compatibility.test.ts` imports the private `@bomb.sh/dom` package. Its synchronous factory supplies the real `src/dom.ts` classes and a no-op render notification callback; every case owns a fresh document. No parser, browser global, proxy, or replacement DOM is installed. This factory owns no external resources, so it needs no disposal callback. Renderer scheduling, terminal output, lifecycle/disposal failures, and notification behavior remain in the implementation-specific tests.

The exhaustive [manifest](dom-features.ts) enables the following features:

| Enabled feature | Evidence tested |
| --- | --- |
| `document.basicCreation` | Distinct element/text identity, uppercase element nodeName, text nodeName, independent empty/Unicode text. |
| `node.basicAppend` | appendChild return identity, insertion order, detached nested construction. |
| `characterData.stringStorage` | String read/write, empty/Unicode replacement, identity and independent sibling values. |
| `element.childElements` | Immediate elements in order, excluding text and nested descendants. |

These deliberately granular leaves preserve supported behavior without claiming the larger interfaces work. The broader leaves remain unchanged in intent: e.g. `node.append` additionally requires moving nodes and rejecting cycles. Passing `basicAppend` cannot be read as passing `append`.

Every other leaf is explicitly false in the manifest. The reasons below apply to every false leaf under each listed branch. The [suite registry](../../dom/src/compatibility/registry.ts) maps each feature to its test module.

| False capability group | Implementation evidence/reason |
| --- | --- |
| `document.creation`, `lookup`, `importNode`, `xml`, `parsing`, `xmlSerialization` | Document is a container with documentElement, createElement and createTextNode. It has no nodeType/ownerDocument, comments, fragments, Attr creation, lookup, import/adopt, DOMImplementation, parser, or serializer. |
| Other `node.*` | appendChild only pushes into an array. No parent/sibling/owner/connectivity tracking, move/removal/replacement/fragment validity, cloning, comparison, normalization, textContent, or standard live collection interface. |
| Other `characterData.*` | Only the data getter/setter is present. No Web IDL string conversion, length, nodeValue/textContent, editing methods or splitText. |
| Other `element.*` | No attributes, namespaces, token lists, selectors, dataset or reflected HTML properties. `children` is a freshly filtered array, not a retained live HTMLCollection. |
| All `events.*` and `focus.*` | No event constructors, EventTarget/listener dispatch, focus APIs, cancellation, error reporting, or activeElement. |
| All `mutationObserver.*`, `selection.*`, `traversal.*` | No observer, range, selection, TreeWalker or NodeIterator implementation. |
| All `elements.*` | createElement produces generic elements. There are no form/control subclasses, ownership, values, validation, reset, submission, FormData, selection, activation, dialog/disclosure state or associated event algorithms. |
| All `templates.*`, `parsing.*` | No HTML parser, markup mutation, serialization or template content owner document. |
| All `customElements.*`, `shadow.*` | No registry, upgrades/reactions, shadow attachment, slot assignment, or boundary behavior. |
| All `style.*` | No style declarations, style attribute, sheets/rules, cascade, inheritance or computed-style API. |
| All `input.*` | createUI accepts an input stream but currently never consumes it. There is no host event/input pipeline or target hit-testing API to adapt. Keyboard/mouse behavior and trusted events therefore remain independently false. |

A compliant UI input adapter cannot yet be supplied. Calling dispatchEvent, `.click()`, assigning values, or choosing arbitrary targets in a driver would fabricate the behavior the suite must test. Future input adapters belong here and must consume the normal terminal host path, resolve mouse targets through `Layout` coordinates, await operation completion, and release held input on failure. The development browser adapter validates these contracts using Playwright keyboard and mouse input.

Rendering, scheduling, notification, and lifecycle regressions remain in the UI tests. Portable data/tree cases run through the shared suite.
