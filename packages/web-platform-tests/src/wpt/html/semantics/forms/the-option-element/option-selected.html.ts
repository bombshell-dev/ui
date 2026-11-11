import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('reflects selected attributes until selectedness becomes dirty', ({ document }) => {
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
		context.test(
			`preserves dirty ${selected} selectedness across default changes`,
			({ document }) => {
				const option = document.createElement('option');
				// Upstream testDirty checks both values on the same dirty option.
				for (const value of [selected, !selected]) {
					option.selected = value;
					expect(option.selected).toBe(value);
					option.setAttribute('selected', '');
					expect(option.selected).toBe(value);
					option.removeAttribute('selected');
					expect(option.selected).toBe(value);
					option.defaultSelected = true;
					expect(option.selected).toBe(value);
					option.defaultSelected = false;
					expect(option.selected).toBe(value);
				}
			},
		);
	}
}
