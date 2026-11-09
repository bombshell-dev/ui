import type { CompatibilityContext } from '../../context.ts';
export const spec = 'https://dom.spec.whatwg.org/#concept-live-range';
export const requires = [
	'selection.range.boundaries',
	'characterData.editing',
	'characterData.splitText',
] as const;
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'adjusts live boundaries during replacement, splitting, and removal',
		({ document }) => {
			const root = document.createElement('div');
			const text = document.createTextNode('A😀B');
			root.append(text);
			const range = document.createRange();
			range.setStart(text, 1);
			range.setEnd(text, 4);
			text.replaceData(1, 2, 'X');
			expect([range.startOffset, range.endOffset]).toEqual([1, 3]);
			const split = text.splitText(1);
			expect(range.startContainer).toBe(text);
			expect(range.endContainer).toBe(split);
			expect(range.endOffset).toBe(2);
			split.remove();
			expect(range.endContainer).toBe(root);
			expect(range.endOffset).toBe(1);
		},
	);
	context.test(
		'does not move a boundary when insertion occurs exactly at that boundary',
		({ document }) => {
			const root = document.createElement('div');
			const a = document.createElement('span');
			const b = document.createElement('span');
			root.append(a, b);
			const range = document.createRange();
			range.setStart(root, 1);
			range.setEnd(root, 2);
			root.insertBefore(document.createElement('span'), b);
			expect(range.startOffset).toBe(1);
			expect(range.endOffset).toBe(3);
		},
	);

	context.test('adjusts offsets after text insertion and deletion', (fixture) => {
		const document = fixture.document as unknown as Document;
		const t = document.createTextNode('abcdef'),
			r = document.createRange();
		r.setStart(t, 2);
		r.setEnd(t, 5);
		t.insertData(1, 'XX');
		expect(r.startOffset).toBe(4);
		expect(r.endOffset).toBe(7);
		t.deleteData(2, 3);
		expect(r.startOffset).toBe(2);
		expect(r.endOffset).toBe(4);
	});

	context.test('relocates boundaries to the old parent when a subtree is removed', (fixture) => {
		const document = fixture.document as unknown as Document;
		const p = document.createElement('div'),
			e = document.createElement('i'),
			t = document.createTextNode('abc');
		e.append(t);
		p.append(e);
		const r = document.createRange();
		r.setStart(t, 1);
		r.setEnd(t, 2);
		e.remove();
		expect(r.startContainer).toBe(p);
		expect(r.startOffset).toBe(0);
		expect(r.collapsed).toBe(true);
	});
}
