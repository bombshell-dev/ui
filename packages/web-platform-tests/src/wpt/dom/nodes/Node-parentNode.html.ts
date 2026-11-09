import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	{
		const { expect } = context.runner;

		context.test('sets the parent of an appended element', ({ document }) => {
			let el = document.createElement('div');
			expect(el.parentNode).toBe(null);
			document.body.appendChild(el);
			expect(el.parentNode).toBe(document.body);
		});
	}

	{
		const { expect } = context.runner;

		context.test('Document', ({ document }) => {
			expect(document.parentNode).toBe(null);
		});
		context.test('Doctype', ({ document }) => {
			expect(document.doctype!.parentNode).toBe(document);
		});
		context.test('Root element', ({ document }) => {
			expect(document.documentElement.parentNode).toBe(document);
		});
	}
}
