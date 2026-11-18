# WPT provenance and execution

This package runs original upstream Web Platform Tests against consumer DOM
implementations. The sources live in the `wpt` git submodule; its revision must
match `WPT_REVISION`. Read that checkout when reviewing or enabling cases.

Do not copy, rewrite, or adapt upstream tests into this package. Do not invent
cases, add assertions, change fixtures or input matrices, or infer tests from the
specification. Keep upstream sources, helpers, authorship, and license notices
unchanged. Implementation-specific tests belong with the consumer.

The CLI transforms each selected upstream file into a Vitest test module. Execute
its scripts and static helpers in their original order, in one window context per
file. Execute all registered subtests, including unselected ones, so their shared
state and setup remain intact. Filter results only when reporting them. Never
hide source-loading, setup, or harness failures behind a subtest filter.

Consumer `wpt.config.ts` files supply document factories, global bindings, and
source/case selectors. Explicit includes override exclusions. Use original WPT
case names. Selecting some cases from a file does not establish coverage of the
whole file. Unmatched selectors must remain visible configuration errors.

Framework profiles and feature maps in `src/frameworks` are part of the public
selection API. Preserve them when changing the runner, and check their source
paths and case names against the original upstream files.

When enabling coverage or changing the harness:

1. Read the original source and any helpers at the pinned revision.
2. Preserve the complete upstream setup, operation order, assertions, exceptions,
   node identities, document ownership, and shared state between subtests.
3. Supply missing fixture capabilities without changing the behavior tested.
   Unsupported source features must fail explicitly rather than silently skip.
4. Keep genuine file errors observable even when every subtest is excluded.
   Any exception for a pending unsupported subtest must be narrow, documented,
   and disabled when that subtest is selected.
5. Verify the affected consumer cases, build, and typecheck. Format and lint the
   harness. When migrating coverage, compare cases and assertions; matching
   totals or passing against a browser alone does not establish correspondence.

Fix missing DOM behavior in the consumer or explicitly exclude unsupported cases
in its configuration. Never weaken upstream assertions to make an implementation
pass. Local harness code belongs in `src/node` and `src/vitest`; the consumer
should need only its configuration to integrate with this package.
