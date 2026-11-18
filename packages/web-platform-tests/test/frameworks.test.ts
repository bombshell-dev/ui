import { statSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
	CompatibilityConfigurationError,
	features,
	featureSelectors,
	framework,
	frameworks,
	uncoveredByWPT,
	type DOMFeature,
	type Framework,
} from '../src/index.ts';

describe('framework profiles', () => {
	for (const [name, profile] of Object.entries(frameworks)) {
		it(`${name} selects required coverage without optional modules`, () => {
			const selected = framework(name as Framework);
			expect(profile.required.length).toBeGreaterThan(0);
			expect(Object.keys(selected).length).toBeGreaterThan(0);
			expect(selected['dom/nodes/Document-createTextNode.html']).toBe(true);
			expect(selected['dom/events/Event-dispatch-bubbles-true.html']).toBe(true);
		});

		for (const module of Object.keys(profile.optional)) {
			it(`${name}/${module} preserves required selections`, () => {
				const required = framework(name as Framework);
				const selected = framework(name as Framework, [module]);
				for (const [source, cases] of Object.entries(required)) {
					if (cases === true || selected[source] === true) {
						expect(selected[source]).toBe(true);
					} else {
						expect(selected[source]).toEqual(expect.arrayContaining([...cases]));
					}
				}
			});
		}
	}

	it.each([
		['react', 'selection', 'dom/ranges/Range-constructor.html'],
		['preact', 'hydration', 'dom/nodes/Node-childNodes.html'],
		['vue', 'hydration', 'dom/traversal/TreeWalker-basic.html'],
		['vue', 'transitions', 'dom/nodes/Element-classlist.html'],
		['vue', 'customElements', 'shadow-dom/Element-interface-attachShadow.html'],
		['solid', 'hydration', 'dom/nodes/DocumentFragment-querySelectorAll-after-modification.html'],
		['svelte', 'hydration', 'dom/nodes/DocumentFragment-querySelectorAll-after-modification.html'],
	] as const)('%s/%s adds its optional coverage', (name, module, source) => {
		expect(framework(name)[source]).toBeUndefined();
		expect(framework(name, [module])[source]).toBe(true);
	});

	it.each([
		['react', 'resources'],
		['preact', 'moveBefore'],
	] as const)('%s/%s can be selected while its features have no WPT mapping', (name, module) => {
		expect(framework(name, [module])).toEqual(framework(name));
	});

	it('combines multiple optional modules', () => {
		const selected = framework('vue', ['hydration', 'transitions', 'customElements']);
		expect(selected['dom/traversal/TreeWalker-basic.html']).toBe(true);
		expect(selected['dom/nodes/Element-classlist.html']).toBe(true);
		expect(selected['shadow-dom/Element-interface-attachShadow.html']).toBe(true);
	});

	it('rejects an optional module belonging to another framework', () => {
		expect(() => framework('preact', ['transitions'])).toThrow(
			new CompatibilityConfigurationError('preact has no optional module transitions'),
		);
	});

	it('reports required features without WPT coverage', () => {
		expect(uncoveredByWPT('preact')).toEqual([
			'Node#nodeType',
			'Node#firstChild',
			'Node#nextSibling',
			'Node#ownerDocument',
			'Element#id',
		]);
	});
});

describe('feature selectors', () => {
	it('merges case selectors without duplicating repeated features', () => {
		const selected = featureSelectors([
			'Element#setAttribute',
			'Element#getAttribute',
			'Element#setAttribute',
			'Element#getAttribute',
		]);
		expect(selected['dom/nodes/attributes.html']).toEqual([
			/\bsetAttribute\b/,
			'Unset attributes return null',
			'First set attribute is returned by getAttribute',
			'Only lowercase attributes are returned on HTML elements (upper case attribute)',
			'Only lowercase attributes are returned on HTML elements (mixed case attribute)',
		]);
	});

	it.each([
		['HTMLInputElement#checked', 'HTMLInputElement#value'],
		['HTMLInputElement#value', 'HTMLInputElement#checked'],
	] satisfies DOMFeature[][])('whole-file selection wins when merging %s then %s', (...names) => {
		expect(
			featureSelectors(names)['html/semantics/forms/the-input-element/input-value-dirty-flag.html'],
		).toBe(true);
	});

	it('leaves unmapped features empty', () => {
		expect(featureSelectors(['Node#nodeType', 'Node#firstChild'])).toEqual({});
	});
});

// This checks source paths only. Generated subtest names require running the original tests.
describe('upstream feature sources', () => {
	const sources = new Set(Object.values(features).flatMap((selectors) => Object.keys(selectors)));
	it.each([...sources])('%s exists in the upstream checkout', (source) => {
		const info = statSync(new URL(`../wpt/${source}`, import.meta.url));
		expect(info.isFile()).toBe(true);
		expect(info.size).toBeGreaterThan(0);
	});
});
