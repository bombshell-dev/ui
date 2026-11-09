import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test('<textarea> validity state should be preserved after a clone', ({ document }) => {
		let form = document.createElement('form');
		let textarea = document.createElement('textarea');
		textarea.required = true;

		textarea.appendChild(document.createTextNode('A'));
		form.appendChild(textarea);

		expect(textarea.validity.valid).toBe(true);

		let formClone = form.cloneNode(true) as HTMLFormElement;
		expect(
			formClone.querySelector('textarea')!.validity.valid,
			'Validity state should be preserved after a clone',
		).toBe(textarea.validity.valid);
	});
}
