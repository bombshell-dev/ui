import type { CompatibilityContext } from '../context.ts';

export const spec = 'https://dom.spec.whatwg.org/#dom-childnode-remove';
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'distinguishes harmless ChildNode.remove from wrong-parent removeChild',
		({ document }) => {
			const parent = document.createElement('div');
			const other = document.createElement('div');
			const child = document.createElement('span');
			parent.appendChild(child);
			expect(() => other.removeChild(child)).toThrow(
				expect.objectContaining({ name: 'NotFoundError' }),
			);
			expect(child.parentNode).toBe(parent);
			expect(parent.removeChild(child)).toBe(child);
			expect(child.parentNode).toBeNull();
			child.remove();
			child.remove();
			expect(parent.childNodes.length).toBe(0);
		},
	);

	context.test('throws on removing an absent child and detaches sibling links', (fixture) => {
		const document = fixture.document as unknown as Document;
		const p = document.createElement('div'),
			a = document.createElement('i'),
			b = document.createElement('b');
		p.append(a, b);
		expect(p.removeChild(a)).toBe(a);
		expect(a.parentNode).toBeNull();
		expect(a.previousSibling).toBeNull();
		expect(a.nextSibling).toBeNull();
		expect(b.previousSibling).toBeNull();
		expect(() => p.removeChild(a)).toThrow(expect.objectContaining({ name: 'NotFoundError' }));
		expect(p.firstChild).toBe(b);
	});
}
