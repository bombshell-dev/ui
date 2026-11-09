import type { CompatibilityContext } from '../../context.ts';

export const spec =
	'https://html.spec.whatwg.org/multipage/common-dom-interfaces.html#htmlformcontrolscollection';
export const wpt =
	'https://github.com/web-platform-tests/wpt/tree/master/html/semantics/forms/the-form-element';
export const requires = ['elements.form.controls'] as const;

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('looks up controls through item and namedItem', (fixture) => {
		const document = fixture.document;
		const form = document.createElement('form');
		const input = document.createElement('input');
		input.id = 'control-id';
		input.name = 'control-name';
		form.appendChild(input);
		const controls = form.elements;
		expect(controls.item(0)).toBe(input);
		expect(controls.item(1)).toBeNull();
		expect(controls.namedItem('control-id')).toBe(input);
		expect(controls.namedItem('control-name')).toBe(input);
		expect(controls.namedItem('missing')).toBeNull();
	});

	context.test('resolves id and name changes in a retained controls collection', (fixture) => {
		const document = fixture.document as unknown as Document;
		const form = document.createElement('form'),
			e = document.createElement('input'),
			elements = form.elements;
		form.append(e);
		e.name = 'first';
		expect(elements.namedItem('first')).toBe(e);
		e.name = 'second';
		expect(elements.namedItem('first')).toBeNull();
		expect(elements.namedItem('second')).toBe(e);
		e.id = 'identifier';
		expect(elements.namedItem('identifier')).toBe(e);
	});

	context.test('returns a RadioNodeList for repeated named controls', (fixture) => {
		const document = fixture.document as unknown as Document;
		const form = document.createElement('form');
		form.innerHTML = '<input type=radio name=x value=a><input type=radio name=x value=b checked>';
		const named = form.elements.namedItem('x') as RadioNodeList;
		expect(named.length).toBe(2);
		expect(named.value).toBe('b');
		named.value = 'a';
		expect((form.elements[0] as HTMLInputElement).checked).toBe(true);
		expect((form.elements[1] as HTMLInputElement).checked).toBe(false);
	});
}
