# CSS and form behavior references

The cases below adapt assertions from web-platform-tests (WPT), pinned to
[`b719612f963a05ece9c89a7dd7598c1c59618874`](https://github.com/web-platform-tests/wpt/tree/b719612f963a05ece9c89a7dd7598c1c59618874).
Copyright © web-platform-tests contributors. Adapted code is distributed under
the upstream [BSD 3-Clause license](../test/wpt/LICENSE.txt). Authors named in the
upstream files are credited below; the other listed files do not declare an
individual author.

| Local coverage | Upstream files and authors | Assertions adapted |
| --- | --- | --- |
| `style.constructedStylesheets` | [CSSStyleSheet-constructable-replace-cssRules.html](https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/css/cssom/CSSStyleSheet-constructable-replace-cssRules.html), Emilio Cobos Álvarez and Mozilla; [CSSStyleSheet-constructable.html](https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/css/cssom/CSSStyleSheet-constructable.html), Rakina Zata Amni | Constructor defaults, replacement and rule-list identity, adoption, ordering, disabled sheets, nonconstructed-sheet errors and shared shadow adopters. |
| `style.layers` | [layer-basic.html](https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/css/css-cascade/layer-basic.html), Antti Koivisto; [layer-important.html](https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/css/css-cascade/layer-important.html), Romain Menke | Anonymous and named ordering, reopened and nested layers, statement ordering, specificity and reversed importance order. |
| `style.mutationObservation` | [MutationObserver-style.html](https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/css/cssom/MutationObserver-style.html) | Same-value declaration assignment versus repeated `cssText`; additional local cases cover batching, serialized old values and invalid/no-op declaration changes. |
| `elements.form.dataEvents` | [constructing-form-data-set.html](https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/html/semantics/forms/form-submission-0/constructing-form-data-set.html) | Synchronous bubbling in connected and detached trees, noncancelability, ordered listener modifications and newline preservation. An additional case checks entry construction before listener-driven control changes. |
| `elements.form.reset` | [reset-form.html](https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/html/semantics/forms/resetting-a-form/reset-form.html), Intel | Single/multiple select defaults through `reset()`, reset-button activation and reset-input activation, extended with cancellation, disabled activation and post-reset default changes. |

`customElements.formAssociation` adapts the following files in
[`custom-elements/form-associated`](https://github.com/web-platform-tests/wpt/tree/b719612f963a05ece9c89a7dd7598c1c59618874/custom-elements/form-associated):

- [form-associated-callback.html](https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/custom-elements/form-associated/form-associated-callback.html) and [ElementInternals-form.html](https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/custom-elements/form-associated/ElementInternals-form.html): ownership, form collections and association callbacks.
- [ElementInternals-setFormValue.html](https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/custom-elements/form-associated/ElementInternals-setFormValue.html): string, null and multiple-entry form values. Local assertions inspect `FormData` entry lists without network submission.
- [ElementInternals-validation.html](https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/custom-elements/form-associated/ElementInternals-validation.html): live validity, invalid-event delivery, clearing errors and missing-message errors.
- [form-disabled-callback.html](https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/custom-elements/form-associated/form-disabled-callback.html): effective disabled state, callback suppression, validation and successful-control filtering.
- [form-reset-callback.html](https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/custom-elements/form-associated/form-reset-callback.html): reset reactions after built-in control reset, extended with reset-event cancellation.
- [ElementInternals-labels.html](https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/custom-elements/form-associated/ElementInternals-labels.html): explicit and wrapping label association.
- [ElementInternals-NotSupportedError.html](https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/custom-elements/form-associated/ElementInternals-NotSupportedError.html): form API rejection on non-form-associated elements.

These are selected adaptations with additional local assertions. They do not run
the complete upstream files or establish complete coverage of their directories.
Computed color checks require no browser pixel geometry. Network submission,
file-upload transport, visual validation messages, state restoration and broader
stylesheet/import matrices remain separate coverage gaps. Reset activation here
tests the public `click()` API; host-input activation belongs to the input cases.
