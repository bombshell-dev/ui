import type { CompatibilityContext } from '../context.ts';
export const spec = 'https://html.spec.whatwg.org/multipage/scripting.html#the-template-element';
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('keeps template content in an inert separate document fragment', ({ document }) => {
		const template = document.createElement('template');
		const child = document.createElement('span');
		template.content.append(child);
		expect(template.childNodes.length).toBe(0);
		expect(template.content.firstChild).toBe(child);
		expect(template.content.nodeType).toBe(11);
		expect(template.content.parentNode).toBeNull();
		expect(child.isConnected).toBe(false);
		expect(child.ownerDocument).toBe(template.content.ownerDocument);
		expect(template.content.ownerDocument).not.toBe(document);
	});

	context.test('keeps template contents outside ordinary children and textContent', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('template');
		e.innerHTML = '<i>x</i>';
		expect(e.childNodes.length).toBe(0);
		expect(e.textContent).toBe('');
		expect(e.content.firstChild!.textContent).toBe('x');
		expect(e.content.parentNode).toBeNull();
		expect(e.content.ownerDocument).not.toBe(document);
	});
}
