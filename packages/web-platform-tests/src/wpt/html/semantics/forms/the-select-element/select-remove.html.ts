import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	for (const [desc, getter] of [
		['select.remove(n) should work', (select: HTMLSelectElement) => select],
		['select.options.remove(n) should work', (select: HTMLSelectElement) => select.options],
	] as const) {
		context.test(desc, ({ document }) => {
			let div = document.createElement('div');
			let select = document.createElement('select');
			div.appendChild(select);
			expect(select.parentNode).toBe(div);

			let options = [];
			for (let i = 0; i < 3; ++i) {
				let option = document.createElement('option');
				option.textContent = String(i);
				select.appendChild(option);
				options.push(option);
			}

			getter(select).remove(-1);
			{
				const actual = select.options;
				const expected = options;
				expect(actual.length, 'After remove(-1)').toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index], 'After remove(-1)').toBe(expected[index]);
			}
			expect(select.parentNode).toBe(div);

			getter(select).remove(3);
			{
				const actual = select.options;
				const expected = options;
				expect(actual.length, 'After remove(3)').toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index], 'After remove(3)').toBe(expected[index]);
			}
			expect(select.parentNode).toBe(div);

			getter(select).remove(0);
			expect(select.options, 'After remove(0)').toHaveLength(2);
			expect(select.options[0], 'After remove(0)').toBe(options[1]);
			expect(select.options[1], 'After remove(0)').toBe(options[2]);
			expect(select.parentNode).toBe(div);
		});
	}
	context.test('remove() should work on select elements.', ({ document }) => {
		let div = document.createElement('div');
		let select = document.createElement('select');
		div.appendChild(select);
		expect(select.parentNode).toBe(div);
		expect(div.firstChild).toBe(select);

		select.remove();
		expect(select.parentNode).toBe(null);
		expect(div.firstChild).toBe(null);
	});
	context.test('Element#remove() should work on select elements.', ({ document, Element }) => {
		let div = document.createElement('div');
		let select = document.createElement('select');
		div.appendChild(select);
		expect(select.parentNode).toBe(div);
		expect(div.firstChild).toBe(select);

		Element.prototype.remove.call(select);
		expect(select.parentNode).toBe(null);
		expect(div.firstChild).toBe(null);
	});
}
