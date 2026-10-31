import type { CompatibilityContext } from '../context.ts';

export const spec = 'https://dom.spec.whatwg.org/#interface-document';
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('creates distinct standard node kinds owned by the document', ({ document }) => {
		expect(document.nodeType).toBe(9);
		expect(document.ownerDocument).toBeNull();
		const element = document.createElement('section');
		const text = document.createTextNode('hello');
		const comment = document.createComment('note');
		const fragment = document.createDocumentFragment();
		const attr = document.createAttribute('title');
		for (const [node, type, name] of [
			[element, 1, element.tagName],
			[text, 3, '#text'],
			[comment, 8, '#comment'],
			[fragment, 11, '#document-fragment'],
			[attr, 2, 'title'],
		] as const) {
			expect(node.nodeType).toBe(type);
			expect(node.nodeName).toBe(name);
			expect(node.ownerDocument).toBe(document);
			expect(node.parentNode).toBeNull();
		}
		expect(document.createElement('section')).not.toBe(element);
	});

	context.test('validates names before creating nodes', (fixture) => {
		const document = fixture.document as unknown as Document;
		for (const name of ['', 'a b', '<x>', '1bad'])
			expect(() => document.createElement(name)).toThrow(
				expect.objectContaining({ name: 'InvalidCharacterError' }),
			);
	});

	context.test('normalizes HTML tag and attribute names', (fixture) => {
		const document = fixture.document as unknown as Document;
		expect(document.createElement('DiV').localName).toBe('div');
		expect(document.createAttribute('TiTle').name).toBe('title');
		expect(document.createComment('x').data).toBe('x');
		expect(document.createDocumentFragment().childNodes.length).toBe(0);
	});
}
