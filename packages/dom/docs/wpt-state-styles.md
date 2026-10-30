# State, selectors, and style references

These cases adapt selected Web Platform Tests at revision
[`b719612f963a05ece9c89a7dd7598c1c59618874`](https://github.com/web-platform-tests/wpt/tree/b719612f963a05ece9c89a7dd7598c1c59618874).
Copyright © web-platform-tests contributors. The upstream
[BSD 3-Clause license](../test/wpt/LICENSE.txt) applies to adapted code.

| Local coverage | Pinned source and authors | Adaptation |
| --- | --- | --- |
| `style.focusState`, `input.keyboard.focusStyles` | [focus-within-011.html](https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/css/selectors/focus-within-011.html), Ethan Lin and Mozilla | Focus movement between siblings and ancestors. The visual reference is replaced by selector and computed-color assertions. Additional cases cover blur, removal, retained styles, focus listeners, shadow hosts, navigation cancellation, and inert subtrees. |
| `style.relationalSelectors`, `input.mouse.stateStyles` | [user-action-pseudo-classes-in-has.html](https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/css/selectors/invalidation/user-action-pseudo-classes-in-has.html), Byungwoo Lee | Ancestor and sibling-descendant invalidation during hover, press/release, focus, and removal. Additional cases cover relative selectors, snapshots, errors, and checkbox cancellation rollback. |
| `input.keyboard.focusVisible` | [focus-visible-001.html](https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/css/selectors/focus-visible-001.html), Rob Dodson | Tab focus matches `:focus-visible` on buttons, tabindex elements, and checkboxes. |
| `input.mouse.focusVisible` | [focus-visible-002.html](https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/css/selectors/focus-visible-002.html), [focus-visible-003.html](https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/css/selectors/focus-visible-003.html), Alice Boxhall | Mouse focus indicates text-entry controls and does not indicate non-text controls. Cases use text/email/password inputs, textarea, button, checkbox, and tabindex span. |
| `style.controlSelectors` | [checked.html](https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/html/semantics/selectors/pseudo-classes/checked.html), [valid-invalid.html](https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/html/semantics/selectors/pseudo-classes/valid-invalid.html), [disabled.html](https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/html/semantics/selectors/pseudo-classes/disabled.html), Denis Ah-Kang | Live checkedness, selectedness/reset, input-type changes, value/pattern/custom validity, aggregate form/fieldset validity, disabled fieldsets and first-legend exemption. |
| `focus.inert` | [inert-node-is-unfocusable.html](https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/inert/inert-node-is-unfocusable.html), [inert-in-shadow-dom.html](https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/inert/inert-in-shadow-dom.html), Alice Boxhall; [inert-does-not-match-disabled-selector.html](https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/inert/inert-does-not-match-disabled-selector.html) | Explicit versus inherited inertness, dynamic enabling, nested restrictions, open/closed shadow and slotted focus, independence from disabled state. |

The two `focusVisible` flags select focus-indication policies independently of
ordinary focus selectors, keyboard/mouse delivery, and trusted events. Text-entry mouse cases can be selected independently of the non-text mouse-focus
policy; non-text cases additionally require `input.mouse.focus`. They do
not infer user preferences or silently detect selector support. Native input goes
through the supplied driver. Programmatic focus and property writes establish
fixtures or test the corresponding public API; they never substitute for the
input actions under test.

These are selected adaptations and additional assertions, not complete upstream
file runs. Remaining matrices include focus-visible script transfer and user
preferences, date/time and picker controls, `:user-valid`/`:user-invalid`,
`:indeterminate`, deeper slotted focus styling, and inert modal exceptions.
Color assertions validate computed state without pixel snapshots or geometry
expectations. Visual outlines, occlusion, and geometric hit-testing require
renderer integration.
