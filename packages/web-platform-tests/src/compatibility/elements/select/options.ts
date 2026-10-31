import type { CompatibilityContext } from '../../context.ts';

export const spec = 'https://html.spec.whatwg.org/multipage/form-elements.html#dom-select-options';

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('keeps options live and excludes nested selects', (fixture) => {
		const document = fixture.document;
		const select = document.createElement('select');
		const options = select.options;
		const first = document.createElement('option');
		first.id = 'first-option';
		const group = document.createElement('optgroup');
		const second = document.createElement('option');
		group.appendChild(second);
		select.append(first, group);
		expect(select.options).toBe(options);
		expect(Array.from(options)).toEqual([first, second]);
		expect(select.item(0)).toBe(first);
		expect(select.item(99)).toBeNull();
		expect(select.namedItem('first-option')).toBe(first);
		expect(second.index).toBe(1);
		first.remove();
		expect(Array.from(options)).toEqual([second]);
		expect(second.index).toBe(0);
	});

	context.test('adds before a reference and removes by index', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('select'),
			a = document.createElement('option'),
			b = document.createElement('option');
		e.add(a);
		e.add(b, a);
		expect(Array.from(e.options)).toEqual([b, a]);
		e.remove(0);
		expect(Array.from(e.options)).toEqual([a]);
		e.remove(99);
		expect(e.options.length).toBe(1);
	});
}
