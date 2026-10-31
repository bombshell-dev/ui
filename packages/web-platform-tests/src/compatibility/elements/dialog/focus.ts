import type { DOMElement as DOMElementContract } from '../../contracts/nodes.ts';
import type { CompatibilityContext } from '../../context.ts';

export const spec =
	'https://html.spec.whatwg.org/multipage/interactive-elements.html#dialog-focusing-steps';
export const requires = ['elements.dialog.modal', 'focus.transitions'] as const;

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'focuses autofocus content and restores the previously focused control',
		(fixture) => {
			const document = fixture.document;
			const root = document.createElement('div');
			const outside = document.createElement('button');
			const dialog = document.createElement('dialog');
			const preferred = document.createElement('button');
			preferred.setAttribute('autofocus', '');
			dialog.appendChild(preferred);
			root.append(outside, dialog);
			fixture.connect(root);
			outside.focus();
			dialog.showModal();
			fixture.cleanup(() => dialog.close());
			expect(document.activeElement).toBe(preferred);
			dialog.close();
			expect(document.activeElement).toBe(outside);
		},
	);

	context.test('showModal focuses an autofocus control inside the dialog', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('dialog'),
			input = document.createElement('input');
		input.autofocus = true;
		e.append(input);
		fixture.connect(e as unknown as DOMElementContract);
		e.showModal();
		expect(document.activeElement).toBe(input);
		e.close();
	});
}
