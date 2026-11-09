import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'Passing an element which is not a submit button should throw',
		({ document, TypeError }) => {
			document.body.insertAdjacentHTML(
				'afterbegin',
				'<form>' +
					'<input type="reset">' +
					'<input type="text">' +
					'<button type="reset"></button>' +
					'<button type="button"></button>' +
					'</form>',
			);
			let form = document.querySelector('form')!;
			expect(() => {
				form.requestSubmit(document.body);
			}).toThrow(expect.objectContaining({ constructor: TypeError }));
			for (let control of form.elements) {
				expect(() => {
					form.requestSubmit(control as HTMLElement);
				}).toThrow(expect.objectContaining({ constructor: TypeError }));
			}
		},
	);
	context.test(
		'Passing a submit button not owned by the context object should throw',
		({ document, DOMException }) => {
			document.body.insertAdjacentHTML(
				'afterbegin',
				`<form>
      <input form="" type="submit">
      <button form="form2" type="submit"></button>
      </form>
      <form id="form2"></form>`,
			);
			let form = document.querySelector('form')!;
			let submitButton = document.createElement('button');
			submitButton.type = 'submit';
			expect(() => {
				form.requestSubmit(submitButton);
			}).toThrow(
				expect.objectContaining({
					name: 'NotFoundError',
					code: 8,
					constructor: DOMException,
				}),
			);

			let buttons = form.querySelectorAll('input, button');
			expect(buttons.length).toBe(2);
			for (let control of buttons) {
				expect(() => {
					form.requestSubmit(control as HTMLElement);
				}, control.outerHTML).toThrow(
					expect.objectContaining({
						name: 'NotFoundError',
						code: 8,
						constructor: DOMException,
					}),
				);
			}
		},
	);
	context.test(
		'requestSubmit() should accept button[type=submit], input[type=submit], and input[type=image]',
		({ document }) => {
			document.body.insertAdjacentHTML(
				'afterbegin',
				`<input type=submit form="form1">
      <form id="form1" target="_blank">
      <button type="submit"></button>
      <button></button>
      <button type="invalid"></button>
      <input type="submit">
      <input type="image">
      </form>`,
			);
			let form = document.querySelector('form')!;
			let didDispatchSubmit = false;
			form.addEventListener('submit', (event) => {
				event.preventDefault();
				didDispatchSubmit = true;
			});

			expect(form.elements.length).toBe(5);
			for (let control of form.elements) {
				didDispatchSubmit = false;
				form.requestSubmit(control as HTMLElement);
				expect(didDispatchSubmit, `${control.outerHTML} should submit the form`).toBe(true);
			}
			// <input type=image> is not in form.elements.
			let control = form.querySelector<HTMLElement>('[type=image]')!;
			didDispatchSubmit = false;
			form.requestSubmit(control as HTMLElement);
			expect(didDispatchSubmit, `${control.outerHTML} should submit the form`).toBe(true);
		},
	);
	context.test('requestSubmit() should trigger interactive form validation', ({ document }) => {
		document.body.insertAdjacentHTML('afterbegin', '<form><input required></form>');
		let form = document.querySelector('form')!;
		let invalidControl = form.querySelector<HTMLElement>('input:invalid')!;
		let didDispatchInvalid = false;
		invalidControl.addEventListener('invalid', (e) => {
			didDispatchInvalid = true;
		});

		form.requestSubmit();
		expect(didDispatchInvalid).toBe(true);
	});
	context.test("requestSubmit() doesn't run form submission reentrantly", ({ document }) => {
		document.body.insertAdjacentHTML('afterbegin', '<form><input type=submit></form>');
		let form = document.querySelector('form')!;
		let submitButton = form.elements[0] as HTMLElement;
		let submitCounter = 0;
		form.addEventListener(
			'submit',
			(e) => {
				++submitCounter;
				form.requestSubmit();
				e.preventDefault();
			},
			{ once: true },
		);
		form.requestSubmit();
		expect(submitCounter, 'requestSubmit() + requestSubmit()').toBe(1);

		submitCounter = 0;
		form.addEventListener(
			'submit',
			(e) => {
				++submitCounter;
				submitButton.click();
				e.preventDefault();
			},
			{ once: true },
		);
		form.requestSubmit();
		expect(submitCounter, 'requestSubmit() + click()').toBe(1);

		submitCounter = 0;
		form.addEventListener(
			'submit',
			(e) => {
				++submitCounter;
				form.requestSubmit();
				e.preventDefault();
			},
			{ once: true },
		);
		submitButton.click();
		expect(submitCounter, 'click() + requestSubmit()').toBe(1);
	});
	context.test("requestSubmit() doesn't run interactive validation reentrantly", ({ document }) => {
		document.body.insertAdjacentHTML(
			'afterbegin',
			'<form><input type=submit><input required></form>',
		);
		let form = document.querySelector('form')!;
		let submitButton = form.elements[0] as HTMLElement;
		let invalidControl = form.elements[1] as HTMLElement;
		let invalidCounter = 0;
		invalidControl.addEventListener(
			'invalid',
			(e) => {
				++invalidCounter;
				if (invalidCounter < 10) form.requestSubmit();
			},
			{ once: true },
		);
		form.requestSubmit();
		expect(invalidCounter, 'requestSubmit() + requestSubmit()').toBe(1);

		invalidCounter = 0;
		invalidControl.addEventListener(
			'invalid',
			(e) => {
				++invalidCounter;
				if (invalidCounter < 10) submitButton.click();
			},
			{ once: true },
		);
		form.requestSubmit();
		expect(invalidCounter, 'requestSubmit() + click()').toBe(1);

		invalidCounter = 0;
		invalidControl.addEventListener(
			'invalid',
			(e) => {
				++invalidCounter;
				if (invalidCounter < 10) form.requestSubmit();
			},
			{ once: true },
		);
		submitButton.click();
		expect(invalidCounter, 'click() + requestSubmit()').toBe(1);
	});
	context.test(
		'requestSubmit() for a disconnected form should not submit the form',
		({ document }) => {
			let form = document.createElement('form');
			let submitCounter = 0;
			form.addEventListener('submit', (e) => {
				++submitCounter;
				e.preventDefault();
			});
			form.requestSubmit();
			expect(submitCounter).toBe(0);
		},
	);
	context.test(
		'The constructed FormData object should not contain an entry for the submit button that was used to submit the form.',
		({ document, FormData }) => {
			document.body.insertAdjacentHTML(
				'afterbegin',
				`<form>
      <input name="n1" value="v1">
      <button type="submit" name="n2" value="v2"></button>
      </form>
      <form id="form2"></form>`,
			);
			let form = document.querySelector('form')!;
			let formDataInEvent: FormData | null = null;
			let submitter = form.querySelector<HTMLElement>('button[type=submit]')!;
			form.addEventListener('submit', (e) => {
				e.preventDefault();
				formDataInEvent = new FormData(e.target as HTMLFormElement);
			});

			form.requestSubmit(submitter);
			expect((formDataInEvent as unknown as FormData).get('n1')).toBe('v1');
			expect((formDataInEvent as unknown as FormData).has('n2')).toBe(false);
		},
	);
}
