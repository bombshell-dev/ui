import type { CompatibilityContext } from '../context.ts';
export const spec = 'https://html.spec.whatwg.org/multipage/scripting.html#the-template-element';
export const requires = ['templates.content', 'parsing.fragments'] as const;
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'parses markup into template content, including nested templates',
		({ document }) => {
			const template = document.createElement('template');
			template.innerHTML = '<b>one &amp; two</b><template><i>nested</i></template>';
			expect(template.childNodes.length).toBe(0);
			expect(template.content.childNodes.length).toBe(2);
			expect(template.content.firstChild?.textContent).toBe('one & two');
			expect(template.innerHTML).toBe('<b>one &amp; two</b><template><i>nested</i></template>');
		},
	);

	context.test('parses nested templates into separate content fragments', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('template');
		e.innerHTML = '<template><i>x</i></template>';
		const nested = e.content.firstChild as HTMLTemplateElement;
		expect(nested.childNodes.length).toBe(0);
		expect(nested.content.firstChild!.textContent).toBe('x');
		expect(e.innerHTML).toBe('<template><i>x</i></template>');
	});
}
