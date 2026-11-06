import type { CompatibilityContext } from '../../context.ts';

export const spec =
	'https://html.spec.whatwg.org/multipage/interactive-elements.html#the-details-element';

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('reflects open as a boolean attribute', (fixture) => {
		const document = fixture.document;
		const details = document.createElement('details');
		expect(details.open).toBe(false);
		details.open = true;
		expect(details.hasAttribute('open')).toBe(true);
		details.setAttribute('open', 'false');
		expect(details.open).toBe(true);
		details.open = false;
		expect(details.hasAttribute('open')).toBe(false);
	});

	context.test('reflects open presence rather than attribute spelling', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('details');
		expect(e.open).toBe(false);
		e.setAttribute('open', 'false');
		expect(e.open).toBe(true);
		e.open = false;
		expect(e.hasAttribute('open')).toBe(false);
		e.open = true;
		expect(e.getAttribute('open')).toBe('');
	});
}
