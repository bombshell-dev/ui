import type { CompatibilityContext } from '../context.ts';

export const spec =
	'https://html.spec.whatwg.org/multipage/form-elements.html#the-datalist-element';

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('exposes a live collection of descendant options', (fixture) => {
		const document = fixture.document;
		const datalist = document.createElement('datalist');
		const options = datalist.options;
		const option = document.createElement('option');
		const wrapper = document.createElement('div');
		wrapper.appendChild(option);
		datalist.appendChild(wrapper);
		expect(datalist.options).toBe(options);
		expect(Array.from(options)).toEqual([option]);
		option.remove();
		expect(options.length).toBe(0);
	});

	context.test('keeps option collection live and excludes non-option descendants', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('datalist'),
			options = e.options,
			a = document.createElement('option'),
			div = document.createElement('div');
		div.append(a);
		e.append(div);
		expect(options.length).toBe(1);
		expect(options.item(0)).toBe(a);
		e.append(document.createElement('span'));
		expect(options.length).toBe(1);
		a.remove();
		expect(options.length).toBe(0);
	});
}
