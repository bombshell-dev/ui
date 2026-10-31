# Shadow DOM and input WPT references

The shadow and input modules adapt selected Web Platform Tests at commit
[`b719612f963a05ece9c89a7dd7598c1c59618874`](https://github.com/web-platform-tests/wpt/tree/b719612f963a05ece9c89a7dd7598c1c59618874).
Copyright © web-platform-tests contributors. The upstream
[BSD-3-Clause license](../test/wpt/LICENSE) applies to these adaptations.

| Shared module | Pinned upstream source | Attribution and assertions |
| --- | --- | --- |
| `shadow/events/composed-path.ts` | [event-composed-path.html](https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/shadow-dom/event-composed-path.html) | Hayato Ito. Nested open/closed roots and nested slots expose different paths to inside/outside listeners while preserving or retargeting the event target. |
| `shadow/slots/observer-ordering.ts` | [slotchange-event.html](https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/shadow-dom/slotchange-event.html) | Ryosuke Niwa and Hayato Ito. Observer delivery precedes slot signals; observer mutations enqueue another signal. Covers connected/detached open/closed roots, pending signals after slot removal, and first-change ordering of distinct slots. |
| `input/keyboard/multiline-editing.ts` | [input-events-typing.html](https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/input-events/input-events-typing.html) | WPT contributors; no individual author is declared in the file. Textarea/contenteditable typing, event order, paragraph/line-break input types. Additional cases assert cancellation and multiline selection replacement. |
| `input/keyboard/number-stepping.ts` | [input-events-arrow-key-on-number-input.html](https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/input-events/input-events-arrow-key-on-number-input.html), [input-events-arrow-key-on-number-input-prevent-default.html](https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/input-events/input-events-arrow-key-on-number-input-prevent-default.html) | WPT contributors; no individual authors are declared in the files. Native arrow stepping delivers beforeinput/input/change; cancellation prevents mutation and subsequent editing events. |
| `input/keyboard/shadow.ts` | [focus-navigation-slot-fallback-default-tabindex.html](https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/shadow-dom/focus-navigation/focus-navigation-slot-fallback-default-tabindex.html), [event-composed-path.html](https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/shadow-dom/event-composed-path.html) | WPT contributors; event-path author Hayato Ito. Slot-scope navigation, assigned versus fallback content, and native key event retargeting. Additional cases cover cancellation across the boundary and keyup after a focus change. |
| `input/mouse/shadow.ts` | [event-composed-path.html](https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/shadow-dom/event-composed-path.html), [event-with-related-target.html](https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/shadow-dom/event-with-related-target.html), [mouseover-out.html](https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/uievents/order-of-events/mouse-events/mouseover-out.html) | WPT contributors; shadow test authors Hayato Ito and Ryosuke Niwa. Native mouse event paths, internal hover transition trimming, and related-target retargeting on exit. Additional activation case cancels a host click and checks rollback of the shadow checkbox. |

Each fixture uses the consumer's document and input session. Input cases exercise
key down/up, host text insertion, pointer movement, and mouse down/up. Focus and selection APIs establish the test
preconditions. The assertions examine event targets, order, cancellation, DOM
state, focus, and selection without asserting pixel values or a particular
contenteditable paragraph element name.

`input.keyboard.multilineEditing` explicitly selects Enter for a paragraph in
contenteditable, Enter for a line break in textarea, and Shift+Enter for a line
break in contenteditable. `input.keyboard.numberStepping` selects ArrowUp and
ArrowDown stepping with immediate change events. Neither policy is inferred from
the environment. Trusted-event checks remain separate feature leaves. Shadow keyboard navigation and editing cases are conditional on their respective input policies; shadow mouse hover and checkbox activation cases likewise declare their own prerequisites.

These adaptations cover selected assertions, not whole upstream files. Remaining
gaps include the full positive/negative tabindex scope matrix, editing history,
clipboard and IME composition, deletion across editing hosts, and the complete
slot redistribution matrix. `InputEvent.getTargetRanges()` lifetime and changes
to selection during dispatch remain tracked separately: the relevant WPT file
[is tentative](https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/input-events/input-events-get-target-ranges-during-and-after-dispatch.tentative.html),
and its expectations are not part of these policy flags. Visual-line navigation,
caret geometry, and geometric hit-testing still require renderer integration.
