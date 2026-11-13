import { describe, expect, it } from 'vitest';
import { features, type DOMFeature } from '../src/frameworks/features.ts';
import {
	frameworks,
	frameworkSelectors,
	featureSelectors,
	uncoveredFeatures,
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
	for (const [framework, profile] of Object.entries(frameworks)) {
		it(`${framework} resolves against the registry`, () => {
			expect(selected(frameworkSelectors(framework as Framework)).length).toBeGreaterThan(0);
			for (const module of Object.keys(profile.optional))
				selected(frameworkSelectors(framework as Framework, [module]));
		});
	}

	it('rejects unknown optional modules', () => {
		expect(() => frameworkSelectors('preact', ['hydration'])).toThrow(
			CompatibilityConfigurationError,
		);
	});

	it('reports required features without WPT coverage', () => {
		expect(uncoveredFeatures('preact')).toEqual([
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
