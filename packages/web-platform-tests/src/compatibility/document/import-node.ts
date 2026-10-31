import type { CompatibilityContext } from '../context.ts';

export const spec = 'https://dom.spec.whatwg.org/#dom-document-importnode';
const requiredGlobals = ['Document'] as const;
export { requiredGlobals as globals };
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('imports a deep copy while retaining the source tree', ({ document, globals }) => {
		const other = new (globals('Document'))();
		const source = document.createElement('div');
		source.appendChild(document.createTextNode('kept'));
		const copy = other.importNode(source, true);
		expect(copy).not.toBe(source);
		expect(copy.ownerDocument).toBe(other);
		expect(copy.firstChild?.ownerDocument).toBe(other);
		expect(copy.firstChild).not.toBe(source.firstChild);
		expect(copy.textContent).toBe('kept');
		expect(source.firstChild?.parentNode).toBe(source);
	});

	context.test('imports shallow elements without moving originals or listeners', (fixture) => {
		const document = fixture.document as unknown as Document;
		const other = new (fixture.globals('Document'))();
		const source = other.createElement('div');
		source.setAttribute('id', 'x');
		source.appendChild(other.createTextNode('text'));
		const copy = document.importNode(source as unknown as Node, false) as Element;
		expect(copy.ownerDocument).toBe(document);
		expect(copy.childNodes.length).toBe(0);
		expect(copy.getAttribute('id')).toBe('x');
		expect(source.childNodes.length).toBe(1);
	});

	context.test('rejects importing a document', (fixture) => {
		const document = fixture.document as unknown as Document;
		expect(() => document.importNode(document, true)).toThrow(
			expect.objectContaining({ name: 'NotSupportedError' }),
		);
	});
}
