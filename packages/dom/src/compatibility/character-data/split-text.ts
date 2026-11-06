import type { CompatibilityContext } from '../context.ts';

export const spec = 'https://dom.spec.whatwg.org/#dom-text-splittext';
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'splits into an adjacent text node without replacing the original',
		({ document }) => {
			const parent = document.createElement('div');
			const text = document.createTextNode('A😀B');
			parent.appendChild(text);
			const split = text.splitText(3);
			expect(text.data).toBe('A😀');
			expect(split.data).toBe('B');
			expect(parent.firstChild).toBe(text);
			expect(text.nextSibling).toBe(split);
			expect(split.ownerDocument).toBe(document);
			expect(() => text.splitText(4)).toThrow(expect.objectContaining({ name: 'IndexSizeError' }));
		},
	);

	context.test('splits detached text at zero and length', (fixture) => {
		const document = fixture.document as unknown as Document;
		const a = document.createTextNode('abc'),
			b = a.splitText(0);
		expect(a.data).toBe('');
		expect(b.data).toBe('abc');
		expect(b.parentNode).toBeNull();
		const c = b.splitText(3);
		expect(c.data).toBe('');
		expect(b.data).toBe('abc');
		expect(c.ownerDocument).toBe(document);
	});

	context.test('rejects offsets beyond the text length atomically', (fixture) => {
		const document = fixture.document as unknown as Document;
		const t = document.createTextNode('abc');
		expect(() => t.splitText(4)).toThrow(expect.objectContaining({ name: 'IndexSizeError' }));
		expect(t.data).toBe('abc');
	});
}
