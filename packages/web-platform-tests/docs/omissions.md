# WPT omissions

Known omissions at [WPT_REVISION](../WPT_REVISION). Source paths are relative to
the upstream WPT root. Consumer exclusions in `wpt.config.ts` are separate.

## DOM and selectors

| Upstream source | Omitted cases | Reason |
| --- | --- | --- |
| `dom/nodes/Element-webkitMatchesSelector.html` | Entire file. | Vendor-prefixed alias; coverage targets standard `matches`. |
| `dom/nodes/Element-matches-namespaced-elements.html` | The `webkitMatchesSelector` rows. | Vendor-prefixed alias. |
| `dom/nodes/ParentNode-querySelector-All.html`, `dom/nodes/ParentNode-querySelector-All-xht.xht`, `dom/nodes/Element-matches.html` | Unnamed iframe-loader cases. | The consumer's document factory replaces upstream fixture loading; behavioral subtests remain. |
| `dom/nodes/attributes.html` | `setAttributeNode, if it fires mutation events, should fire one with the new node when resetting an existing attribute`, and its ` (outer shell)` companion. | Legacy `DOMAttrModified` coverage is outside the current event scope; both the listener assertions and their outer-shell setup remain omitted. |
| `dom/events/EventListener-handleEvent.html` | `` rethrows errors when getting `handleEvent` ``, ``throws if `handleEvent` is falsy and not callable``, and ``throws if `handleEvent` is thruthy and not callable``. | Require asynchronous window error reporting and the upstream `EventWatcher` harness. |
| `domparsing/createContextualFragment.html` | `<script>s should be run when appended to the document (but not before)`. | Requires a script realm installed before parsing. |
| `html/dom/documents/dom-tree-accessors/Document.body.html` | All cases except `existing document's body`. | Remaining getter and setter cases require document factories, document-tree mutation, or body replacement semantics. |

## Forms

| Upstream source | Omitted cases | Reason |
| --- | --- | --- |
| `html/semantics/forms/form-submission-0/constructing-form-data-set.html` | Navigation and encoding cases beyond bubbling, listener-added entries, and newline checks. | Require the upstream submission server. |
| `html/semantics/forms/the-form-element/form-requestsubmit.html` | Navigation and the asynchronous disabled-button navigation case. | Require upstream submission server resources. |
| `html/semantics/interactive-elements/the-details-element/toggleEvent.html` | Initially-open parser fixture. | Requires a listener installed before parsing. |
| `html/semantics/forms/the-select-element/customizable-select/selectedcontent.html` | Native picker case. | The input driver does not support picker interaction. |

## Custom elements

| Upstream source | Omitted cases | Reason |
| --- | --- | --- |
| `custom-elements/resources/custom-elements-helpers.js` | XHR document row used by connection, disconnection, adoption, and upgrading tests. | Requires an upstream network fixture. |

## Shadow DOM and input

| Upstream source | Omitted cases | Reason |
| --- | --- | --- |
| `shadow-dom/declarative/declarative-shadow-dom-basic.html` | `Declarative Shadow DOM: explicit test that exceptions are not thrown`. | Requires an error listener installed before parsing; fixture parsing finishes before the test callback. |
| `input-events/input-events-typing.html` | `It triggers beforeinput and input events on typing Undo and Redo key combinations without an existing history`. | Depends on native undo history retained from earlier upstream cases. Our per-case document fixtures discard that history; the original case also fails when run alone. |

## CSSOM

| Upstream source | Omitted cases | Reason |
| --- | --- | --- |
| `css/cssom/css-style-attr-decl-block.html` | `Changes to CSS declaration block after a base URL change`. | The fixture URL belongs to the consumer. |
| `css/cssom/CSSStyleSheet-constructable.html` | `CSSStyleSheet.replaceSync should not trigger any loads from @import rules`. | Requires a served `support/constructable-import.css` resource and its exact resource-timing entry; embedding the stylesheet would change the assertion. |
| `css/cssom/CSSStyleSheet-constructable.html` | `Constructing a sheet with the default base URL uses the constructor document's base URL for CSS rules`. | Resolves a relative URL against the fixture location. The browser adapter loads markup through blob URLs, which have no relative URL hierarchy. |
