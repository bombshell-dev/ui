import type { CompatibilityContext } from '../../context.ts';
export const spec = 'https://dom.spec.whatwg.org/#dom-range-clonecontents';
export const requires = ['selection.range.boundaries'] as const;
// Coverage reference; this leaf is independently authored, not an imported WPT file.
export const wpt =
	'https://github.com/web-platform-tests/wpt/blob/master/dom/ranges/Range-cloneContents.html';
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('clones partial ancestor shells without changing the source', ({ document }) => {
		const root = document.createElement('div');
		const a = document.createElement('b');
		const b = document.createElement('i');
		const first = document.createTextNode('abc');
		const last = document.createTextNode('xyz');
		a.append(first);
		b.append(last);
		root.append(a, b);
		const range = document.createRange();
		range.setStart(first, 1);
		range.setEnd(last, 2);
		const fragment = range.cloneContents();
		expect(fragment.textContent).toBe('bcxy');
		expect(fragment.childNodes.length).toBe(2);
		expect(fragment.firstChild?.nodeName).toBe(a.nodeName);
		expect(fragment.firstChild).not.toBe(a);
		expect(root.textContent).toBe('abcxyz');
	});

	context.test('clones a partial text selection without mutating boundaries or data', (fixture) => {
		const document = fixture.document as unknown as Document;
		const t = document.createTextNode('abcdef'),
			r = document.createRange();
		r.setStart(t, 1);
		r.setEnd(t, 4);
		const f = r.cloneContents();
		expect(f.textContent).toBe('bcd');
		expect(t.data).toBe('abcdef');
		expect(r.startOffset).toBe(1);
		expect(r.endOffset).toBe(4);
		expect(f.firstChild).not.toBe(t);
	});

	context.test('returns an empty fragment for a collapsed range', (fixture) => {
		const document = fixture.document as unknown as Document;
		const r = document.createRange(),
			t = document.createTextNode('abc');
		r.setStart(t, 1);
		expect(r.cloneContents().childNodes.length).toBe(0);
	});
}
