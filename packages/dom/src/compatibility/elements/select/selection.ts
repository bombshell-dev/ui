import type { CompatibilityContext } from '../../context.ts';

export const spec =
	'https://html.spec.whatwg.org/multipage/form-elements.html#dom-select-selectedindex';
export const requires = ['elements.select.options'] as const;

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('selects by value and permits an explicit empty selection', (fixture) => {
		const document = fixture.document;
		const select = document.createElement('select');
		const first = document.createElement('option');
		const second = document.createElement('option');
		first.value = 'first';
		second.value = 'second';
		select.append(first, second);
		expect(select.selectedIndex).toBe(0);
		const selected = select.selectedOptions;
		select.value = 'second';
		expect(select.selectedIndex).toBe(1);
		expect(Array.from(selected)).toEqual([second]);
		select.value = 'missing';
		expect(select.selectedIndex).toBe(-1);
		expect(selected.length).toBe(0);
		expect(select.value).toBe('');
		select.multiple = true;
		first.selected = second.selected = true;
		expect(select.type).toBe('select-multiple');
		expect(Array.from(selected)).toEqual([first, second]);
	});

	context.test('sets selectedIndex and clears selection for missing values', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('select');
		e.innerHTML = '<option value=a>A</option><option value=b>B</option>';
		expect(e.selectedIndex).toBe(0);
		e.value = 'b';
		expect(e.selectedIndex).toBe(1);
		expect(e.options[1]!.selected).toBe(true);
		e.value = 'missing';
		expect(e.selectedIndex).toBe(-1);
		expect(e.value).toBe('');
		e.selectedIndex = 0;
		expect(e.value).toBe('a');
	});
}
