// WPT helper: html/semantics/forms/the-input-element/input-types.js
import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	const inputTypes = [
		'button',
		'checkbox',
		'color',
		'date',
		'datetime-local',
		'email',
		'file',
		'hidden',
		'image',
		'month',
		'number',
		'password',
		'radio',
		'range',
		'reset',
		'search',
		'submit',
		'tel',
		'text',
		'time',
		'url',
		'week',
	];

	context.test("input element's value should be cloned", ({ document }) => {
		let input = document.createElement('input');
		input.value = 'foo bar';

		let copy = input.cloneNode() as HTMLInputElement;
		expect(copy.value).toBe('foo bar');
	});
	context.test(
		"input element's dirty value flag should be cloned, so setAttribute doesn't affect the cloned input's value",
		({ document }) => {
			let input = document.createElement('input');
			input.value = 'foo bar';

			let copy = input.cloneNode() as HTMLInputElement;
			copy.setAttribute('value', 'something else');

			expect(copy.value).toBe('foo bar');
		},
	);
	for (const inputType of inputTypes) {
		context.test(
			`input[type=${inputType}] element's indeterminateness should be cloned`,
			({ document }) => {
				let input = document.createElement('input');
				input.setAttribute('type', inputType);
				input.indeterminate = true;

				let copy = input.cloneNode() as HTMLInputElement;
				expect(copy.indeterminate).toBe(true);
			},
		);
		context.test(
			`input[type=${inputType}] element's checkedness should be cloned`,
			({ document }) => {
				let input = document.createElement('input');
				input.setAttribute('type', inputType);
				input.checked = true;

				let copy = input.cloneNode() as HTMLInputElement;
				expect(copy.checked).toBe(true);
			},
		);
		context.test(
			`input[type=${inputType}] element's dirty checkedness should be cloned, so setAttribute doesn't affect the cloned input's checkedness`,
			({ document }) => {
				let input = document.createElement('input');
				input.setAttribute('type', inputType);
				input.checked = false;

				let copy = input.cloneNode() as HTMLInputElement;
				copy.setAttribute('checked', 'checked');

				expect(copy.checked).toBe(false);
			},
		);
	}
}
