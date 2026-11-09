import type { CompatibilityContext } from '../../../../../shared/context.ts';
import { submitImage } from './resources/submit.jpg.ts';

export const input = ['mouse'] as const;

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	const content = `<!DOCTYPE html>
<meta charset=urf-8>
<meta name=viewport content="width=device-width,initial-scale=1">
<title>Test dialog form submission</title>






<body>
<dialog id="favDialog">
  <form id="dialogForm" method="dialog">
    <button id="confirmBtn" value="default">Confirm</button>
    <input id="confirmImgBtn" src="${submitImage}" width="41"
    height="41" type="image" alt="Hello">
  </form>
  <form method="post">
    <input id="confirmImgBtn2" src="${submitImage}" width="41"
    formmethod="dialog" height="41" type="image" alt="Hello">
  </form>
</dialog>

</body>
`;
	context.test(
		'click the form submission button should close the dialog',
		async ({ document, cleanup }) => {
			const dialog = document.querySelector('dialog')!;
			const button = document.querySelector('button')!;
			cleanup(() => {
				dialog.close();
				dialog.returnValue = '';
				button.removeAttribute('value');
			});
			dialog.showModal();

			button.click();

			expect(dialog.open, 'dialog should be closed now').toBe(false);
			expect(dialog.returnValue, 'Return the default value').toBe('default');
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'form submission should return correct value',
		async ({ document, cleanup }) => {
			const dialog = document.querySelector('dialog')!;
			const button = document.querySelector('button')!;
			cleanup(() => {
				dialog.close();
				dialog.returnValue = '';
				button.removeAttribute('value');
			});
			dialog.returnValue = 'initial';
			dialog.showModal();

			button.value = 'sushi';
			button.click();

			expect(dialog.open, 'dialog should be closed now').toBe(false);
			expect(dialog.returnValue, 'Return the updated value').toBe('sushi');
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		"returnValue doesn't update when there's no value attribute.",
		async ({ document, cleanup }) => {
			const dialog = document.querySelector('dialog')!;
			const button = document.querySelector('button')!;
			cleanup(() => {
				dialog.close();
				dialog.returnValue = '';
				button.removeAttribute('value');
			});
			dialog.returnValue = 'initial';
			dialog.showModal();

			button.removeAttribute('value');
			button.click();
			expect(dialog.open, 'dialog should be closed now').toBe(false);
			expect(dialog.returnValue, 'returnValue should not be updated').toBe('initial');
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		"returnValue does update when there's an empty value attribute.",
		async ({ document, cleanup }) => {
			const dialog = document.querySelector('dialog')!;
			const button = document.querySelector('button')!;
			cleanup(() => {
				dialog.close();
				dialog.returnValue = '';
				button.removeAttribute('value');
			});
			dialog.returnValue = 'initial';
			dialog.showModal();

			button.setAttribute('value', '');
			button.click();
			expect(dialog.open, 'dialog should be closed now').toBe(false);
			expect(dialog.returnValue, 'returnValue should be updated').toBe('');
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'closing the dialog while submitting should stop the submission',
		async ({ document, cleanup, step }) => {
			const dialog = document.querySelector('dialog')!;
			cleanup(() => {
				dialog.close();
				dialog.returnValue = '';
				button.removeAttribute('value');
			});
			dialog.returnValue = '';
			dialog.showModal();

			const button = document.querySelector('button')!;
			button.value = 'sushi';

			const dialogForm = document.getElementById('dialogForm') as HTMLFormElement;
			dialogForm.onsubmit = step(function () {
				dialog.close();
			});

			button.click();
			expect(dialog.open, 'dialog should be closed now').toBe(false);
			// If the submission request got processed, the returnValue should change
			// to "sushi" because that's the value of the submitter
			expect(dialog.returnValue, "dialog's returnValue remains the same").toBe('');
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'calling form.submit() in click handler of submit button should start the submission synchronously',
		async ({ document, cleanup, step }) => {
			const dialog = document.querySelector('dialog')!;
			cleanup(() => {
				dialog.close();
				dialog.returnValue = '';
				button.removeAttribute('value');
			});
			dialog.returnValue = undefined as unknown as string;
			dialog.showModal();

			let submitEvent = false;
			const dialogForm = document.getElementById('dialogForm') as HTMLFormElement;
			dialogForm.onsubmit = step(function () {
				submitEvent = true;
				expect(dialog.open, 'dialog should be closed').toBe(false);
				expect(dialog.returnValue, "dialog's returnValue remains the same").toBe('');
			});

			const button = document.querySelector('button')!;
			button.value = 'sushi';
			button.onclick = step(function () {
				dialogForm.submit();
				expect(dialog.open, 'dialog should be closed now').toBe(false);
				// The returnValue should be "" because there is no submitter
				expect(dialog.returnValue, 'returnValue shouldn be empty string').toBe('');
			});

			button.click();
			expect(submitEvent, 'Should have submit event').toBe(true);
			expect(dialog.open, 'dialog should be closed').toBe(false);
			expect(dialog.returnValue, "dialog's returnValue remains the same").toBe('');
		},
		{ document: { contentType: 'text/html', content } },
	);

	context.test(
		'input image button should return the coordinates',
		async ({ document, cleanup, input, step }) => {
			const dialog = document.querySelector('dialog')!;
			const button = document.querySelector('input')!;
			cleanup(() => {
				dialog.close();
				dialog.returnValue = '';
				button.removeAttribute('value');
			});
			dialog.showModal();
			let expectedReturnValue = '';
			button.addEventListener(
				'click',
				step((event) => {
					expectedReturnValue = event.offsetX + ',' + event.offsetY;
				}),
			);
			await input.click(button);
			expect(dialog.open, 'dialog should be closed now').toBe(false);
			expect(dialog.returnValue, "returnValue shouldn't be empty string").not.toBe('');
			expect(dialog.returnValue, 'returnValue should be the offsets of the click').toBe(
				expectedReturnValue,
			);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'formmethod attribute should use dialog form submission',
		async ({ document, cleanup, input }) => {
			const dialog = document.querySelector('dialog')!;
			cleanup(() => {
				dialog.close();
				dialog.returnValue = '';
				button.removeAttribute('value');
			});
			dialog.showModal();
			const button = document.getElementById('confirmImgBtn2')!;
			await input.click(button);
			expect(dialog.open, 'dialog should be closed now').toBe(false);
		},
		{ document: { contentType: 'text/html', content } },
	);
}
