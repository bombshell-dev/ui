import type { CompatibilityContext } from '../context.ts';
export const spec = 'https://html.spec.whatwg.org/multipage/scripting.html#the-template-element';
const requiredGlobals = ['HTMLTemplateElement', 'Document'] as const;
export { requiredGlobals as globals };
export const requires = ['templates.content', 'node.cloning', 'document.importNode'] as const;
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('clones and imports template contents independently', ({ document, globals }) => {
		const HTMLTemplateElement = globals('HTMLTemplateElement');
		const Document = globals('Document');
		const template = document.createElement('template');
		template.content.append(document.createTextNode('contents'));
		const clone = template.cloneNode(true);
		if (!(clone instanceof HTMLTemplateElement))
			return expect.fail('Template clone must be a template');
		expect(clone.content.textContent).toBe('contents');
		expect(clone.content.firstChild).not.toBe(template.content.firstChild);
		const other = new Document();
		const imported = other.importNode(template, true);
		if (!(imported instanceof HTMLTemplateElement))
			return expect.fail('Imported template must be a template');
		expect(imported.ownerDocument).toBe(other);
		expect(imported.content.ownerDocument).not.toBe(other);
		expect(imported.content.firstChild?.ownerDocument).toBe(imported.content.ownerDocument);
	});

	context.test('deep cloning duplicates template content without sharing nodes', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('template');
		e.innerHTML = '<i>x</i>';
		const shallow = e.cloneNode(false) as HTMLTemplateElement,
			deep = e.cloneNode(true) as HTMLTemplateElement;
		expect(shallow.content.childNodes.length).toBe(0);
		expect(deep.content.firstChild).not.toBe(e.content.firstChild);
		expect(deep.innerHTML).toBe('<i>x</i>');
		deep.content.firstChild!.textContent = 'changed';
		expect(e.content.firstChild!.textContent).toBe('x');
	});
}
