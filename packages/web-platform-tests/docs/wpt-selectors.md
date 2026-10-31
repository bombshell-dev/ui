# Selector WPT adaptations

The selector cases use Web Platform Tests at
[`b719612f963a05ece9c89a7dd7598c1c59618874`](https://github.com/web-platform-tests/wpt/tree/b719612f963a05ece9c89a7dd7598c1c59618874).
Copyright © web-platform-tests contributors; the upstream BSD-3-Clause license
is retained in [LICENSE](../test/wpt/LICENSE). File-specific author credits
are retained in the adapted modules.

All cases register through [`element.selectors`](../src/compatibility/element/selectors.ts).
The supporting modules group cases by behavior. Each exports `sourceFiles`, the
exact upstream paths it adapts, and retains the original case titles after a
`WPT <source filename>:` prefix.

| Module | Upstream coverage |
| --- | --- |
| [Matrix](../src/compatibility/element/selectors/matrix.ts) | `ParentNode-querySelector-All.html`, its XHTML counterpart, and `Element-matches.html`, including their shared `selectors.js` corpus and content documents. |
| [Roots and mutations](../src/compatibility/element/selectors/roots.ts) | Document, element, fragment, shadow-root and detached scopes; ordering, duplicate IDs, string conversion, static lists, and mutations. |
| [Matching](../src/compatibility/element/selectors/matching.ts) | `matches`, `closest`, default `:active` state, disabled controls, and structural pseudo-classes. |
| [Namespaces](../src/compatibility/element/selectors/namespaces.ts) | HTML/XML case sensitivity, namespaced attributes and elements, SVG, and template contents. |
| [Grammar](../src/compatibility/element/selectors/grammar.ts) | Escapes, attribute operators and flags, nested structural and logical selectors, mixed HTML/SVG/MathML, and CSS `is-where-basic.html` / `has-basic.html`. |

The matrix retains every upstream data row, API mask, expected ID list, and
document/root exclusion. Query results are checked in order, including first-match
identity and exclusion of the cloned sibling tree. The HTML and XHTML markup is
the upstream fixture content, supplied to a fresh document factory with its MIME
type and `#target` fragment. It contains no WPT runner scripts. Constructors used
for exception and collection assertions come from the implementation's globals.

Original assertions are preserved when adapting the harness. Global named-element
bindings become explicit node references, and mutations shared between upstream
tests are repeated in each fresh fixture. CSS escape and mixed-namespace data are
retained in full. Rendering output is not asserted.

The following exclusions concern the upstream API and harness, not browser failures:

- `Element-webkitMatchesSelector.html` and the three `webkitMatchesSelector` cases
  in `Element-matches-namespaced-elements.html` test a vendor-prefixed alias outside
  the standard `matches` API.
- The unnamed asynchronous iframe-loader cases in the three matrix wrappers are
  replaced by the consumer's document factory. Their behavioral subtests remain.
- Rows marked only `TEST_FIND` are for the obsolete `find`/`findAll` proposal. As in
  the upstream query-selector and matches wrappers, those API masks do not register
  tests here. Rows also marked `TEST_MATCH` do register.

## Checking for omissions

`pnpm --filter @bomb.sh/web-platform-tests test:wpt-selectors` compares registered case names with
the pinned upstream tests. The check discovers selector API pages in `dom/nodes`
and includes the two CSS grammar files above. Missing or extra cases fail the
check; the exclusions above are explicit. Downloaded upstream resources are cached
under the package's ignored `node_modules/.cache` directory. Reports go to stdout.
The check also compares the complete selector data, API masks, and fixture bytes
with their pinned sources, and rejects unclassified files in the selected scope.
The repository's `dom-wpt` CI job runs this check, package type checks, and native
input validation on pull requests.

When changing this coverage, update the upstream pin and source mapping together,
review every new upstream case and its assertions, then run both the omission
check and browser validation. Matching names protects against omitted registrations;
reviewing assertion adaptations and running the cases protects their meaning.
Neither check establishes coverage of all WPT directories: CSS rendering tests,
other CSS selector files, and the broader suite's documented gaps remain separate
work. Keep those boundaries explicit rather than treating a passing case count
as complete coverage.
