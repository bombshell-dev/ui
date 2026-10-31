import type { CompatibilityContext } from '../context.ts';

export const spec = 'https://dom.spec.whatwg.org/#old-style-collections';
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('retains live childNodes and children views across mutations', ({ document }) => {
		const parent = document.createElement('div');
		const nodes = parent.childNodes;
		const elements = parent.children;
		const child = document.createElement('span');
		const text = document.createTextNode('text');
		parent.append(text, child);
		expect(nodes.length).toBe(2);
		expect(nodes[0]).toBe(text);
		expect(elements.length).toBe(1);
		expect(elements[0]).toBe(child);
		child.remove();
		expect(nodes.length).toBe(1);
		expect(elements.length).toBe(0);
	});

	context.test(
		'keeps childNodes live and supplies standard item and iteration methods',
		(fixture) => {
			const document = fixture.document as unknown as Document;
			const p = document.createElement('div'),
				nodes = p.childNodes,
				a = document.createTextNode('a');
			expect(nodes.item(0)).toBeNull();
			p.append(a);
			expect(nodes.item(0)).toBe(a);
			expect([...nodes.values()]).toEqual([a]);
			expect([...nodes.keys()]).toEqual([0]);
			expect([...nodes.entries()]).toEqual([[0, a]]);
			const seen: unknown[] = [];
			nodes.forEach((n, i, list) => seen.push([n, i, list]));
			expect(seen).toEqual([[a, 0, nodes]]);
			a.remove();
			expect(nodes.length).toBe(0);
		},
	);

	context.test('updates HTMLCollection named lookups after name and id changes', (fixture) => {
		const document = fixture.document as unknown as Document;
		const p = document.createElement('div'),
			e = document.createElement('input');
		const children = p.children;
		p.append(e);
		e.id = 'first';
		expect(children.namedItem('first')).toBe(e);
		e.id = 'second';
		expect(children.namedItem('first')).toBeNull();
		expect(children.namedItem('second')).toBe(e);
		e.remove();
		expect(children.item(0)).toBeNull();
	});
}
