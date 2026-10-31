import type { CompatibilityContext } from '../context.ts';

export const spec = 'https://dom.spec.whatwg.org/#concept-node-ensure-pre-insertion-validity';
const requiredGlobals = ['Document'] as const;
export { requiredGlobals as globals };
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'transfers fragment children and validates document insertion before moving them',
		({ document, globals }) => {
			const fragment = document.createDocumentFragment();
			const a = document.createElement('div');
			const b = document.createElement('span');
			fragment.append(a, b);
			const target = document.createElement('section');
			expect(target.appendChild(fragment)).toBe(fragment);
			expect(fragment.childNodes.length).toBe(0);
			expect(target.childNodes[0]).toBe(a);
			expect(target.childNodes[1]).toBe(b);
			fragment.append(a, b);
			const empty = new (globals('Document'))();
			expect(() => empty.appendChild(fragment)).toThrow(
				expect.objectContaining({ name: 'HierarchyRequestError' }),
			);
			expect(fragment.childNodes[0]).toBe(a);
			expect(fragment.childNodes[1]).toBe(b);
			expect(empty.childNodes.length).toBe(0);
			for (const leaf of [
				document.createTextNode('text'),
				document.createComment('comment'),
				document.createAttribute('title'),
			]) {
				expect(() => leaf.appendChild(a)).toThrow(
					expect.objectContaining({ name: 'HierarchyRequestError' }),
				);
				expect(a.parentNode).toBe(fragment);
			}
		},
	);

	context.test('empties inserted fragments and preserves their child order', (fixture) => {
		const document = fixture.document as unknown as Document;
		const f = document.createDocumentFragment(),
			p = document.createElement('div'),
			a = document.createElement('i'),
			b = document.createTextNode('b');
		f.append(a, b);
		expect(p.appendChild(f)).toBe(f);
		expect(f.childNodes.length).toBe(0);
		expect(Array.from(p.childNodes)).toEqual([a, b]);
		expect(a.parentNode).toBe(p);
	});

	context.test('rejects invalid document fragments before removing any child', (fixture) => {
		const document = fixture.document as unknown as Document;
		const other = document.implementation.createDocument(null, 'root'),
			f = document.createDocumentFragment();
		f.append(document.createElement('a'), document.createElement('b'));
		expect(() => other.replaceChild(f, other.documentElement)).toThrow(
			expect.objectContaining({ name: 'HierarchyRequestError' }),
		);
		expect(f.childNodes.length).toBe(2);
		expect(other.documentElement.localName).toBe('root');
	});
}
