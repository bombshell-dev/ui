import type { DOMElement as DOMElementContract } from '../../contracts/nodes.ts';
import type { CompatibilityContext } from '../../context.ts';

export const spec =
	'https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#form-submission-algorithm';
export const requires = [
	'elements.dialog.show',
	'elements.form.submission',
	'elements.button.activation',
] as const;

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'dialog submission closes with the submitter value without navigating',
		(fixture) => {
			const document = fixture.document;
			const dialog = document.createElement('dialog');
			const form = document.createElement('form');
			form.method = 'dialog';
			const button = document.createElement('button');
			button.value = 'accepted';
			form.appendChild(button);
			dialog.appendChild(form);
			fixture.connect(dialog);
			dialog.show();
			button.click();
			expect(dialog.open).toBe(false);
			expect(dialog.returnValue).toBe('accepted');
		},
	);

	context.test('canceled dialog form submit leaves dialog open', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('dialog'),
			form = document.createElement('form'),
			button = document.createElement('button');
		form.method = 'dialog';
		form.append(button);
		e.append(form);
		fixture.connect(e as unknown as DOMElementContract);
		form.addEventListener('submit', (event) => event.preventDefault());
		e.show();
		button.click();
		expect(e.open).toBe(true);
		e.close();
	});
}
