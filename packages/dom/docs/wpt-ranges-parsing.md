# Range, selection, traversal, and parsing references

These compatibility tests adapt selected Web Platform Tests (WPT) at commit
[`b719612f963a05ece9c89a7dd7598c1c59618874`](https://github.com/web-platform-tests/wpt/tree/b719612f963a05ece9c89a7dd7598c1c59618874).
Copyright © web-platform-tests contributors. The upstream BSD-3-Clause terms are
retained in [the WPT license](../test/wpt/LICENSE.txt).

The parser data retains the original html5lib notice: Copyright (c) 2006-2013
James Graham, Geoffrey Sneddon, and other contributors. Its
[MIT license](../test/wpt/HTML5LIB-LICENSE.txt) is preserved from
[html5lib-tests at `c777c408b61078ea2eb4acefc2535f54dbc8b28a`](https://github.com/html5lib/html5lib-tests/blob/c777c408b61078ea2eb4acefc2535f54dbc8b28a/LICENSE).
The historical
[WebKit TreeWalker script](https://github.com/WebKit/WebKit/blob/fd948ebbdca8cea5652815e432d911db953146b9/LayoutTests/fast/dom/TreeWalker/script-tests/acceptNode-filter.js)
and its companion HTML file contain no additional copyright or license notice;
the WPT attribution to that script is retained in the local module.

| Local module | Inspected upstream sources and credits | Adaptation |
| --- | --- | --- |
| `selection/document/change-events.ts` | [onselectionchange-on-document.html](https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/selection/onselectionchange-on-document.html) | Asynchronous delivery, coalescing, delivery after subsequent changes, and listener-triggered scheduling. Adds event fields and retained-range mutation checks. |
| `selection/document/mutation.ts` | [selectAllChildren.html](https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/selection/selectAllChildren.html), [removeRange.html](https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/selection/removeRange.html), [deleteFromDocument.html](https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/selection/deleteFromDocument.html) (Aryeh Gregor) | Range identity, invalid arguments, disconnected targets, deletion, and no-op behavior. Uses small explicit fixtures in place of the complete generated endpoint matrix. |
| `selection/range/mutation.ts` | [Range-insertNode.html](https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/dom/ranges/Range-insertNode.html), [Range-surroundContents.html](https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/dom/ranges/Range-surroundContents.html) (Aryeh Gregor) | Fragment insertion, adoption, invalid boundaries, wrapper replacement, exception ordering, and resulting tree/range identity. |
| `traversal/tree-walker.ts` | [TreeWalker-acceptNode-filter.html](https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/dom/traversal/TreeWalker-acceptNode-filter.html), whose upstream header credits WebKit `LayoutTests/fast/dom/TreeWalker/script-tests/acceptNode-filter.js` | Callback objects, getter lookup, callable filters, exception identity, and recovery. Adds recursive filtering and unsigned-short result conversion checks from the DOM filtering algorithm. |
| `parsing/recovery.ts` | [adoption01.dat](https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/html/syntax/parsing/resources/adoption01.dat), [tables01.dat](https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/html/syntax/parsing/resources/tables01.dat), originally the html5lib tree-construction corpus | Eight input/tree pairs are expressed as serialization assertions through both fragment and document parsing. Adds repaired-tree round trips and two template interactions. |
| `document/xml-serialization.ts` | [XMLSerializer-serializeToString.html](https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/domparsing/XMLSerializer-serializeToString.html) | Default namespace resets, prefix reuse/conflicts, declaration fixup, element end-tag consistency, fragments, escaping, and non-mutating serialization. |

The suite supplies fresh fixtures and the consumer's assertion runner. Browser
iframes and WPT harness helpers are replaced by those fixture boundaries. Event
listeners are removed during cleanup; selection notifications use task turns
rather than unbounded waits for an event that might never arrive.

This is a selected adaptation, not the complete WPT range/selection endpoint
matrix, traversal corpus, parser tree-construction corpus, or XML serializer
suite. Parser checker error counts, streaming `document.write`, scripting modes,
and XML serializer cases explicitly marked tentative upstream remain outside
these adaptations. NodeIterator filtering and mutation matrices need separate
expansion. Selection movement across visual lines, bidi layout, coordinate-based
drag selection, and selection painting require renderer integration; these
modules assert tree structure, API state, and event semantics only.

The XML cases expect redundant empty and nonempty default `xmlns` declarations
to be omitted and standalone `Attr` nodes to serialize as empty strings. These follow the
[XML serialization algorithm](https://w3c.github.io/DOM-Parsing/#xml-serialization-algorithm):
the `Attr` branch returns the empty string, and element serialization step 11
suppresses the default namespace declaration when the inherited and element
namespaces are equal. The pinned WPT file contains both expectations. The local
attribute case additionally uses a nonempty value so it can distinguish the
required result from serialization of the attribute's value. Known Chromium
disagreements are documented in the [README](../README.md#known-chromium-disagreements). Namespace
variants and character escaping are independent cases so a disagreement cannot
prevent those other assertions from running.
