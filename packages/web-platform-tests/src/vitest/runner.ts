/* oxlint-disable bombshell-dev/exported-function-async -- Vitest test registration is synchronous. */
import { describe, it, expect, inject } from 'vitest';
import type { WPTNamePattern } from '../vitest.ts';
import {
	testDOMCompatibility as registerDOMCompatibility,
	type DOMCompatibilityOptions,
} from '../shared/test-dom-compatibility.ts';

/** Register configured WPT cases with Vitest's assertions and name filter. */
export function testDOMCompatibility<D>(options: Omit<DOMCompatibilityOptions<D>, 'runner'>): void {
	const selection: WPTNamePattern | null = inject('wptTestNamePattern');
	const pattern = selection ? new RegExp(selection.source, selection.flags) : undefined;
	let matched = false;

	registerDOMCompatibility({
		...options,
		runner: {
			describe,
			it,
			expect,
			filter(source, name) {
				if (pattern) {
					pattern.lastIndex = 0;
				}
				const matches = !pattern || pattern.test(`${source} > ${name}`);
				matched ||= matches;
				return matches;
			},
		},
	});

	// An empty skipped suite lets Vitest report no matches without inventing a test
	// or treating a filter for another test file as an empty-file failure.
	if (pattern && !matched) {
		describe.skip('No WPT cases match the test name filter', () => {});
	}
}
