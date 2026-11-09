import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test(
		'Sets the owner document to the current global object associated document',
		({ document, DocumentFragment }) => {
			const fragment = new DocumentFragment();
			expect(fragment.ownerDocument).toBe(document);
		},
	);
	context.test('Create a valid document DocumentFragment', ({ document, DocumentFragment }) => {
		const fragment = new DocumentFragment();
		const text = document.createTextNode('');
		fragment.appendChild(text);
		expect(fragment.firstChild).toBe(text);
	});
}
