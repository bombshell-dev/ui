import type { CompatibilityContext } from '../../context.ts';
export const spec = 'https://dom.spec.whatwg.org/#dom-range-extractcontents';
export const requires = ['selection.range.boundaries'] as const;
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('moves wholly contained nodes while cloning partial ancestors', ({ document }) => {
		const root = document.createElement('div');
		const a = document.createElement('b');
		const middle = document.createElement('span');
		const b = document.createElement('i');
		const first = document.createTextNode('abc');
		const last = document.createTextNode('xyz');
		a.append(first);
		middle.textContent = 'middle';
		b.append(last);
		root.append(a, middle, b);
		const range = document.createRange();
		range.setStart(first, 1);
		range.setEnd(last, 2);
		const fragment = range.extractContents();
		expect(fragment.textContent).toBe('bcmiddlexy');
		expect(fragment.childNodes[1]).toBe(middle);
		expect(fragment.firstChild).not.toBe(a);
		expect(root.textContent).toBe('az');
		expect(range.collapsed).toBe(true);
	});

	context.test('extracts partial text and collapses the range', (fixture) => {
		const document = fixture.document as unknown as Document;
		const t = document.createTextNode('abcdef'),
			r = document.createRange();
		r.setStart(t, 1);
		r.setEnd(t, 4);
		expect(r.extractContents().textContent).toBe('bcd');
		expect(t.data).toBe('aef');
		expect(r.collapsed).toBe(true);
		expect(r.startOffset).toBe(1);
	});
}
