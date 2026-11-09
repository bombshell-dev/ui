import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test('simple append of foreign div with text', ({ document }) => {
		const old = document.implementation.createHTMLDocument('');
		const div = old.createElement('div');
		div.appendChild(old.createTextNode('text'));
		expect(div.ownerDocument).toBe(old);
		expect(div.firstChild!.ownerDocument).toBe(old);
		document.body.appendChild(div);
		expect(div.ownerDocument).toBe(document);
		expect(div.firstChild!.ownerDocument).toBe(document);
	});
	context.test(
		"Adopting an element into a different document update's the element's owner doc as well as the owner docs of it's attributes",
		({ document }) => {
			let div = document.createElement('div');
			div.id = 'foobar';

			expect(div.ownerDocument).toBe(document);
			expect(div.attributes[0]!.ownerDocument).toBe(document);

			let other_doc = document.implementation.createHTMLDocument();
			other_doc.body.appendChild(div);

			expect(div.ownerDocument).toBe(other_doc);
			expect(div.attributes[0]!.ownerDocument).toBe(other_doc);
		},
	);
}
