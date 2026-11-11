# WPT provenance and correspondence

This package is the long-term source of upstream WPT coverage for the UI.

Every shared DOM conformance case must faithfully reflect an existing, inspected
upstream Web Platform Test. Do not invent cases, add local assertions to upstream
cases, extend their inputs or matrices, or infer new tests from the specification.
Independent subtleties, regressions, and implementation-specific checks belong in
tests outside this package's WPT suite, even when they test standards behavior.
A citation to a related upstream test does not make a local addition a WPT case.

This requirement applies to all adapted cases, including excluded cases.
Tests of the runner and fixtures are infrastructure tests, separate from WPT cases.

The suite shares one upstream revision in `WPT_REVISION`. Use that revision
for source review; do not choose a separate revision for each case or file.

Files under `src/wpt` mirror the exact upstream path, spelling, and capitalization
with `.ts` appended. For example, `src/wpt/dom/nodes/Document-createElement.html.ts`
corresponds to `dom/nodes/Document-createElement.html`. The registry derives source
identity from that convention; do not repeat it in runtime metadata or per-case
annotations. Keep each file's cases together. Upstream helpers and data also use
their natural paths under `src/wpt`. Only test entrypoints export `register`;
support files are imported by those tests. Local harness code belongs in
`src/shared`. Keep setup used by a single source in that source file.

Keep ordinary `context.test` and `expect` calls with readable case names. Do not
introduce per-case registration wrappers. Destructure document and global bindings
from the typed fixture; their expected types are asserted once at the fixture
boundary. Wrap callback assertions with `fixture.step` so the runner observes
failures. Shared attribution and license information belong in `test/wpt`.

When adding or migrating a case:

1. Read the upstream source at the suite revision. Use its path for the adapted
   filename and identify any helper/data sources in comments. Run `pnpm generate`
   after adding, moving, or removing source files.
2. Preserve the upstream inputs, setup, operation order, assertions, exceptions,
   node identities, document ownership, and matrix rows. Separate documents,
   detached trees, and retained collections are meaningful test conditions.
3. Limit adaptations to integration with the consumer's runner, fixtures, and
   input driver. Comment only on non-obvious adaptations, preserving the
   tested behavior without adding or removing behavioral checks. Keep the code
   close enough to upstream for a side-by-side review.
4. Record omitted upstream cases and their reasons in [docs/omissions.md](docs/omissions.md).
   Selecting a subset of a file does not establish coverage of the entire file.
   Do not merge several upstream cases into a smaller example or drop assertions
   to accommodate an incomplete implementation.
5. Keep upstream authorship and license notices. A specification URL, a directory
   link, or a reference to a merely similar test is insufficient provenance.
   Do not claim that an existing local case was derived from WPT
   without establishing that correspondence; replace it with a verified
   adaptation when necessary.
6. Verify the source mapping and registered cases, review assertion correspondence,
   and run browser validation and the affected consumer tests. Matching names or
   passing against a browser alone does not establish correspondence.

Fix missing implementation behavior or explicitly exclude its cases in the consumer configuration.
Never weaken a shared case, change its fixture semantics, or silently omit it
just to make the UI implementation pass.

Test selection uses upstream source paths and original case names. All adapted
cases run by default; explicit includes override exclusions. Do not gate a case
on another test group's selection or silently omit cases based on API detection.
Supporting DOM behavior is exercised by the selected case itself. Document
creation options, global bindings, and input drivers remain fixture contracts,
checked when the selected case uses them.

The selector omission check is an existing example of
traceability, not a waiver for other features. The entire suite must meet this
requirement before it can be described as a fully traceable WPT adaptation.
