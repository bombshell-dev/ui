// Framework profiles select WPT cases by source path and case name, but nothing resolves those
// selectors until a consumer calls `framework()`. Resolving every profile here keeps renamed or
// removed upstream cases from leaving stale selectors behind.
import { describe, expect, it } from 'vitest';
import { features, type DOMFeature } from '../src/frameworks/features.ts';
import {
	frameworks,
	framework,
	featureSelectors,
	uncoveredByWPT,
	type Framework,
} from '../src/frameworks/frameworks.ts';
import { registry } from '../src/shared/registry.ts';
import { CompatibilityConfigurationError, selectTests } from '../src/shared/selection.ts';

const cases = Object.entries(registry).flatMap(([source, module]) => {
	const names: { source: string; name: string }[] = [];
	module.register({
		runner: {} as never,
		test(name) {
			names.push({ source, name });
		},
	});
	return names;
});

function selected(
	include: ReturnType<typeof featureSelectors>,
): { source: string; name: string }[] {
	return selectTests(cases, { include, exclude: { '**': true } });
}

describe('feature selectors', () => {
	for (const [name, selectors] of Object.entries(features)) {
		if (Object.keys(selectors).length === 0) continue;
		it(`${name} matches registered cases`, () => {
			expect(selected(featureSelectors([name as DOMFeature])).length).toBeGreaterThan(0);
		});
	}
});

describe('framework profiles', () => {
	for (const [name, profile] of Object.entries(frameworks)) {
		it(`${name} resolves against the registry`, () => {
			expect(selected(framework(name as Framework)).length).toBeGreaterThan(0);
			for (const module of Object.keys(profile.optional))
				selected(framework(name as Framework, [module]));
		});
	}

	it('rejects unknown optional modules', () => {
		expect(() => framework('preact', ['hydration'])).toThrow(CompatibilityConfigurationError);
	});

	it('reports required features without WPT coverage', () => {
		expect(uncoveredByWPT('preact')).toEqual([
			'Node#nodeType',
			'Node#firstChild',
			'Node#nextSibling',
			'Node#ownerDocument',
		]);
	});

	it('merges whole-source selection over case lists', () => {
		expect(
			featureSelectors(['Element#setAttribute', 'Element#getAttribute'])[
				'dom/nodes/attributes.html'
			],
		).toHaveLength(5);
		expect(
			featureSelectors(['HTMLInputElement#checked', 'HTMLInputElement#value'])[
				'html/semantics/forms/the-input-element/input-value-dirty-flag.html'
			],
		).toBe(true);
	});
});
