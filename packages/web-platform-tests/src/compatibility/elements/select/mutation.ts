import type { CompatibilityContext } from '../../context.ts';

export const spec = 'https://html.spec.whatwg.org/multipage/form-elements.html#dom-select-add';
export const requires = ['elements.select.options'] as const;

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('adds options at indexed anchors and adjusts length', (fixture) => {
		const document = fixture.document;
		const select = document.createElement('select');
		const first = document.createElement('option');
		const second = document.createElement('option');
		select.add(second, null);
		select.add(first, 0);
		expect(Array.from(select.options)).toEqual([first, second]);
		select.remove(0);
		expect(Array.from(select.options)).toEqual([second]);
		select.length = 3;
		expect(select.options.length).toBe(3);
		const generated = select.options[2];
		if (!generated) return expect.fail('Expected a generated option');
		expect(generated.localName).toBe('option');
		select.length = 0;
		expect(select.options.length).toBe(0);
		expect(second.parentNode).toBeNull();
	});

	context.test(
		'updates selectedIndex after insertion and removal before the selected option',
		(fixture) => {
			const document = fixture.document as unknown as Document;
			const e = document.createElement('select');
			e.innerHTML = '<option value=a>A</option><option value=b>B</option>';
			e.value = 'b';
			const selected = e.options[1]!;
			e.insertBefore(document.createElement('option'), e.firstChild);
			expect(e.selectedIndex).toBe(2);
			expect(e.options[2]).toBe(selected);
			e.remove(0);
			expect(e.selectedIndex).toBe(1);
			expect(e.value).toBe('b');
		},
	);
}
