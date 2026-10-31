# Standards references and licenses

The compatibility suite tests behavior defined by the [DOM Standard](https://dom.spec.whatwg.org/), [HTML Standard](https://html.spec.whatwg.org/multipage/), [CSSOM](https://drafts.csswg.org/cssom/), and [CSS Cascade](https://drafts.csswg.org/css-cascade/). Each feature module links the relevant specification in its metadata; the [registry](../src/compatibility/registry.ts) maps features to those modules.

Web Platform Tests provide additional coverage references for [DOM](https://github.com/web-platform-tests/wpt/tree/master/dom), [HTML](https://github.com/web-platform-tests/wpt/tree/master/html), [CSSOM](https://github.com/web-platform-tests/wpt/tree/master/css/cssom), and [shadow DOM](https://github.com/web-platform-tests/wpt/tree/master/shadow-dom). A reference to WPT does not mean the entire upstream test file or directory runs here.

[Option selectedness cases](../src/compatibility/elements/option/selectedness.ts) adapt [option-selected.html](https://github.com/web-platform-tests/wpt/blob/b4b303c8dca22989c43e2d76fce199c36d4b77a7/html/semantics/forms/the-option-element/option-selected.html) at commit `b4b303c8dca22989c43e2d76fce199c36d4b77a7`. Copyright © web-platform-tests contributors; original author Corey Farwell. Attribution is retained in the module, with the BSD-3-Clause notice in [test/wpt/LICENSE](../test/wpt/LICENSE).

The suite and browser tooling use the repository's [MIT license](../LICENSE), copyright 2026-Present Bombshell contributors.

Additional WPT adaptations retain pinned sources, authors, license notices, and
their exact scope in the [state and style](wpt-state-styles.md),
[CSS and forms](wpt-css-forms.md), [shadow and input](wpt-shadow-input.md), and
[range, selection, traversal, and parsing](wpt-ranges-parsing.md) inventories.
The [selector adaptations](wpt-selectors.md) retain the complete shared selector
matrix and identify the upstream files, harness adaptations, and explicit exclusions.

[WPT implicit submission](https://github.com/web-platform-tests/wpt/blob/master/html/semantics/forms/form-submission-0/implicit-submission.optional.html) is optional. The suite keeps this interaction policy independently selectable from input delivery and trusted-event assertions.
