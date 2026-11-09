import type { CompatibilityContext } from '../../context.ts';

export const spec =
	'https://html.spec.whatwg.org/multipage/form-elements.html#concept-option-selectedness';
export const wpt =
	'https://github.com/web-platform-tests/wpt/blob/b4b303c8dca22989c43e2d76fce199c36d4b77a7/html/semantics/forms/the-option-element/option-selected.html';

// Adapted from WPT option-selected.html at b4b303c8dca22989c43e2d76fce199c36d4b77a7.
// Copyright © web-platform-tests contributors. Original author: Corey Farwell.
// BSD-3-Clause; see ../../../../test/wpt/LICENSE.

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('reflects selected attributes until selectedness becomes dirty', (fixture) => {
		const document = fixture.document;
		const option = document.createElement('option');
		expect(option.selected).toBe(false);
		option.setAttribute('selected', '');
		expect(option.selected).toBe(true);
		option.removeAttribute('selected');
		expect(option.selected).toBe(false);
		option.defaultSelected = true;
		expect(option.selected).toBe(true);
		option.defaultSelected = false;
		expect(option.selected).toBe(false);
	});
	for (const selected of [true, false]) {
		context.test(`preserves dirty ${selected} selectedness across default changes`, (fixture) => {
			const document = fixture.document;
			const option = document.createElement('option');
			option.selected = selected;
			option.setAttribute('selected', '');
			expect(option.selected).toBe(selected);
			option.removeAttribute('selected');
			expect(option.selected).toBe(selected);
			option.defaultSelected = true;
			expect(option.selected).toBe(selected);
			option.defaultSelected = false;
			expect(option.selected).toBe(selected);
		});
	}
	context.test('separates dirty selectedness from the selected attribute', (fixture) => {
		const document = fixture.document;
		const option = document.createElement('option');
		option.defaultSelected = true;
		expect(option.selected).toBe(true);
		option.selected = false;
		option.defaultSelected = false;
		option.defaultSelected = true;
		expect(option.hasAttribute('selected')).toBe(true);
		expect(option.selected).toBe(false);
	});
}
