import type { CompatibilityContext } from '../../context.ts';

export const spec = 'https://html.spec.whatwg.org/multipage/forms.html#dom-form-elements';

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('keeps the collection live and in tree order', (fixture) => {
		const document = fixture.document;
		const form = document.createElement('form');
		const controls = form.elements;
		const first = document.createElement('input');
		const second = document.createElement('button');
		form.append(first, second);
		expect(form.elements).toBe(controls);
		expect(Array.from(controls)).toEqual([first, second]);
		expect(form.length).toBe(2);
		first.remove();
		expect(Array.from(controls)).toEqual([second]);
	});

	context.test('retains live controls across insertion and removal in tree order', (fixture) => {
		const document = fixture.document as unknown as Document;
		const form = document.createElement('form'),
			a = document.createElement('input'),
			b = document.createElement('button'),
			elements = form.elements;
		form.append(a, b);
		expect(Array.from(elements)).toEqual([a, b]);
		form.insertBefore(b, a);
		expect(Array.from(elements)).toEqual([b, a]);
		a.remove();
		expect(elements.length).toBe(1);
		expect(elements.item(0)).toBe(b);
	});
}
