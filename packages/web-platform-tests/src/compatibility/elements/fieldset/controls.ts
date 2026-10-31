import type { CompatibilityContext } from '../../context.ts';

export const spec =
	'https://html.spec.whatwg.org/multipage/form-elements.html#dom-fieldset-elements';

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('collects listed descendants in a live collection', (fixture) => {
		const document = fixture.document;
		const fieldset = document.createElement('fieldset');
		const controls = fieldset.elements;
		const input = document.createElement('input');
		const nested = document.createElement('fieldset');
		const button = document.createElement('button');
		nested.appendChild(button);
		fieldset.append(input, nested);
		expect(fieldset.elements).toBe(controls);
		expect(Array.from(controls)).toEqual([input, nested, button]);
		input.remove();
		expect(Array.from(controls)).toEqual([nested, button]);
	});

	context.test('exposes descendant controls as a live collection', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('fieldset'),
			a = document.createElement('input'),
			b = document.createElement('button'),
			elements = e.elements;
		e.append(a);
		expect(elements.item(0)).toBe(a);
		e.append(b);
		expect(Array.from(elements)).toEqual([a, b]);
		a.remove();
		expect(elements.length).toBe(1);
	});
}
