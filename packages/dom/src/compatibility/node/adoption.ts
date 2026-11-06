import type { CompatibilityContext } from '../context.ts';

export const spec = 'https://dom.spec.whatwg.org/#concept-node-adopt';
const requiredGlobals = ['Document'] as const;
export { requiredGlobals as globals };
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'adopts descendants and attributes while preserving their identity',
		({ document, globals }) => {
			const other = new (globals('Document'))();
			const parent = document.createElement('div');
			const child = document.createElement('span');
			const text = document.createTextNode('kept');
			child.setAttribute('title', 'value');
			const attr = child.getAttributeNode('title');
			child.appendChild(text);
			parent.appendChild(child);
			expect(other.adoptNode(child)).toBe(child);
			expect(child.parentNode).toBeNull();
			expect(child.ownerDocument).toBe(other);
			expect(text.ownerDocument).toBe(other);
			expect(attr?.ownerDocument).toBe(other);
			expect(attr?.ownerElement).toBe(child);
			expect(child.firstChild).toBe(text);
		},
	);

	context.test('adopts descendants and attributes while preserving identity', (fixture) => {
		const document = fixture.document as unknown as Document;
		const other = document.implementation.createHTMLDocument('');
		const p = other.createElement('div'),
			child = other.createElement('i');
		p.setAttribute('title', 'x');
		p.append(child);
		other.body.append(p);
		expect(document.adoptNode(p)).toBe(p);
		expect(p.parentNode).toBeNull();
		expect(child.ownerDocument).toBe(document);
		expect(p.getAttributeNode('title')!.ownerDocument).toBe(document);
	});

	context.test('rejects Document adoption without changing ownership', (fixture) => {
		const document = fixture.document as unknown as Document;
		expect(() => document.adoptNode(document)).toThrow(
			expect.objectContaining({ name: 'NotSupportedError' }),
		);
		expect(document.ownerDocument).toBeNull();
	});
}
