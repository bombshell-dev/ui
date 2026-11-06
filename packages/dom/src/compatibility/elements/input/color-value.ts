import type { CompatibilityContext } from '../../context.ts';

export const spec = 'https://html.spec.whatwg.org/multipage/input.html#color-state-(type=color)';
export const wpt =
	'https://github.com/web-platform-tests/wpt/tree/master/html/semantics/forms/the-input-element';

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('accepts CSS color values and serializes opaque limited-sRGB colors', (fixture) => {
		const document = fixture.document;
		const input = document.createElement('input');
		input.type = 'color';
		input.value = 'red';
		expect(input.value).toBe('#ff0000');
		input.value = '#AABBCC';
		expect(input.value).toBe('#aabbcc');
		input.value = 'not a color';
		expect(input.value).toBe('#000000');
	});
}
