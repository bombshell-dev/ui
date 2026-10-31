import type { CompatibilityContext } from '../../context.ts';
export const spec = 'https://dom.spec.whatwg.org/#dom-range-deletecontents';
export const requires = ['selection.range.boundaries'] as const;
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'deletes selected text and nodes while retaining partial ancestors',
		({ document }) => {
			const root = document.createElement('div');
			const a = document.createElement('b');
			const b = document.createElement('i');
			const first = document.createTextNode('abc');
			const last = document.createTextNode('xyz');
			a.append(first);
			b.append(last);
			root.append(a, document.createElement('hr'), b);
			const range = document.createRange();
			range.setStart(first, 1);
			range.setEnd(last, 2);
			range.deleteContents();
			expect(root.textContent).toBe('az');
			expect(root.childNodes.length).toBe(2);
			expect(root.childNodes[0]).toBe(a);
			expect(root.childNodes[1]).toBe(b);
			expect(range.collapsed).toBe(true);
		},
	);

	context.test('deletes complete children without destroying removed node identity', (fixture) => {
		const document = fixture.document as unknown as Document;
		const p = document.createElement('div'),
			a = document.createElement('i'),
			b = document.createElement('b');
		p.append(a, b);
		const r = document.createRange();
		r.selectNode(a);
		r.deleteContents();
		expect(p.firstChild).toBe(b);
		expect(a.parentNode).toBeNull();
		expect(r.collapsed).toBe(true);
		expect(r.startContainer).toBe(p);
		expect(r.startOffset).toBe(0);
	});
}
