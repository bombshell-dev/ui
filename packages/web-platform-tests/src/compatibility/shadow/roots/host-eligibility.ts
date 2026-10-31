import type { CompatibilityContext } from '../../context.ts';
export const spec = 'https://dom.spec.whatwg.org/#dom-element-attachshadow';
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('rejects HTML elements that cannot be shadow hosts', ({ document }) => {
		const input = document.createElement('input');
		expect(() => input.attachShadow({ mode: 'open' })).toThrow(
			expect.objectContaining({ name: 'NotSupportedError' }),
		);
	});

	context.test('rejects SVG elements and standard HTML non-host elements', (fixture) => {
		const document = fixture.document as unknown as Document;
		for (const host of [
			document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
			document.createElement('input'),
			document.createElement('a'),
			document.createElement('br'),
		])
			expect(() => host.attachShadow({ mode: 'open' })).toThrow(
				expect.objectContaining({ name: 'NotSupportedError' }),
			);
	});
}
