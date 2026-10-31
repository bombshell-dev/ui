import type { CompatibilityContext } from '../context.ts';

export const spec = 'https://dom.spec.whatwg.org/#concept-node-pre-insert';
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('moves existing nodes and rejects cycles before changing a tree', ({ document }) => {
		const parent = document.createElement('div');
		const other = document.createElement('div');
		const child = document.createElement('span');
		const text = document.createTextNode('state');
		child.appendChild(text);
		parent.appendChild(child);
		expect(other.appendChild(child)).toBe(child);
		expect(parent.childNodes.length).toBe(0);
		expect(child.firstChild).toBe(text);
		expect(other.appendChild(child)).toBe(child);
		expect(other.childNodes.length).toBe(1);
		expect(() => child.appendChild(other)).toThrow(
			expect.objectContaining({ name: 'HierarchyRequestError' }),
		);
		expect(() => child.appendChild(child)).toThrow(
			expect.objectContaining({ name: 'HierarchyRequestError' }),
		);
		expect(child.parentNode).toBe(other);
		expect(child.firstChild).toBe(text);
	});

	context.test('moves a same-parent node to the end without duplication', (fixture) => {
		const document = fixture.document as unknown as Document;
		const p = document.createElement('div'),
			a = document.createElement('i'),
			b = document.createElement('b');
		p.appendChild(a);
		p.appendChild(b);
		p.appendChild(a);
		expect(Array.from(p.childNodes)).toEqual([b, a]);
		expect(a.previousSibling).toBe(b);
		expect(b.nextSibling).toBe(a);
	});

	context.test(
		'rejects a second document element and text under Document atomically',
		(fixture) => {
			const document = fixture.document as unknown as Document;
			const other = document.implementation.createHTMLDocument('');
			const before = Array.from(other.childNodes);
			expect(() => other.appendChild(other.createElement('i'))).toThrow(
				expect.objectContaining({ name: 'HierarchyRequestError' }),
			);
			expect(() => other.appendChild(other.createTextNode('x'))).toThrow(
				expect.objectContaining({ name: 'HierarchyRequestError' }),
			);
			expect(Array.from(other.childNodes)).toEqual(before);
		},
	);
}
