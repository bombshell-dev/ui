import type { CompatibilityContext } from '../../../../shared/context.ts';

const markup = `<!DOCTYPE html>
<meta charset="utf-8" />
<title>CSS Selectors Invalidation: input pseudo classes in :has() argument</title>




<style>
  .ancestor:has(#checkme:checked) { color: green }
  .ancestor:has(#checkme:indeterminate) { color: yellowgreen }
  .ancestor:has(#checkme:disabled) { color: blue }
  .ancestor:has(#textinput:read-only) { color: skyblue }
  .ancestor:has(#textinput:placeholder-shown) { color: navy }
  .ancestor:has(#radioinput:default) { color: lightblue }
  .ancestor:has(#textinput:valid) { color: lightgreen }
  .ancestor:has(#numberinput:out-of-range) { color: darkgreen }
  .ancestor:has(#numberinput:required) { color: pink }
  .ancestor:has(#progress:indeterminate) { color: orange }
  .ancestor:has(#checkboxinput:default) { color: purple; }
</style>
<div id=subject class=ancestor>
  <input type="checkbox" name="my-checkbox" id="checkme">
  <label for="checkme">Check me!</label>
  <input type="text" id="textinput" required>
  <input id="radioinput" checked>
  <input id="numberinput" type="number" min="1" max="10" value="5">
  <progress id="progress" value="50" max="100"></progress>
  <input id="checkboxinput" type="checkbox">
</div>

`;

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		':checked & :indeterminate invalidation on <input>',
		({ document, getComputedStyle, cleanup }) => {
			const subject = document.getElementById('subject') as HTMLElement;
			const checkme = document.getElementById('checkme') as HTMLInputElement;
			const textinput = document.getElementById('textinput') as HTMLInputElement;
			const radioinput = document.getElementById('radioinput') as HTMLInputElement;
			const numberinput = document.getElementById('numberinput') as HTMLInputElement;
			const progress = document.getElementById('progress') as HTMLProgressElement;
			const checkboxinput = document.getElementById('checkboxinput') as HTMLInputElement;

			let input: HTMLInputElement | null = null;
			cleanup(() => {
				if (input) {
					// Need to put the input back for the rest of the tests.
					subject.prepend(input);
				}
				checkme.checked = false;
			});
			checkme.checked = false;
			expect(getComputedStyle(subject).color, 'ancestor should be black').toBe('rgb(0, 0, 0)');
			checkme.checked = true;
			expect(getComputedStyle(subject).color, 'ancestor should be green').toBe('rgb(0, 128, 0)');
			checkme.indeterminate = true;
			expect(getComputedStyle(subject).color, 'ancestor should be yellowgreen').toBe(
				'rgb(154, 205, 50)',
			);
			input = checkme;
			checkme.remove();
			input.indeterminate = false;
			expect(getComputedStyle(subject).color, 'ancestor should be black').toBe('rgb(0, 0, 0)');

			subject.prepend(input);
			input = null;
			checkme.checked = true;
			expect(getComputedStyle(subject).color, 'ancestor should be green').toBe('rgb(0, 128, 0)');
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		':indeterminate invalidation on <progress>',
		({ document, getComputedStyle, cleanup }) => {
			const subject = document.getElementById('subject') as HTMLElement;
			const checkme = document.getElementById('checkme') as HTMLInputElement;
			const textinput = document.getElementById('textinput') as HTMLInputElement;
			const radioinput = document.getElementById('radioinput') as HTMLInputElement;
			const numberinput = document.getElementById('numberinput') as HTMLInputElement;
			const progress = document.getElementById('progress') as HTMLProgressElement;
			const checkboxinput = document.getElementById('checkboxinput') as HTMLInputElement;

			cleanup(() => {
				progress.setAttribute('value', '50');
			});
			expect(getComputedStyle(subject).color, 'ancestor should be black').toBe('rgb(0, 0, 0)');
			progress.removeAttribute('value');
			expect(getComputedStyle(subject).color, 'ancestor should be orange').toBe('rgb(255, 165, 0)');
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		':disabled invalidation',
		({ document, getComputedStyle, cleanup }) => {
			const subject = document.getElementById('subject') as HTMLElement;
			const checkme = document.getElementById('checkme') as HTMLInputElement;
			const textinput = document.getElementById('textinput') as HTMLInputElement;
			const radioinput = document.getElementById('radioinput') as HTMLInputElement;
			const numberinput = document.getElementById('numberinput') as HTMLInputElement;
			const progress = document.getElementById('progress') as HTMLProgressElement;
			const checkboxinput = document.getElementById('checkboxinput') as HTMLInputElement;

			cleanup(() => {
				checkme.disabled = false;
			});
			expect(getComputedStyle(subject).color, 'ancestor should be black').toBe('rgb(0, 0, 0)');
			checkme.disabled = true;
			expect(getComputedStyle(subject).color, 'ancestor should be blue').toBe('rgb(0, 0, 255)');
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		':read-only invalidation',
		({ document, getComputedStyle, cleanup }) => {
			const subject = document.getElementById('subject') as HTMLElement;
			const checkme = document.getElementById('checkme') as HTMLInputElement;
			const textinput = document.getElementById('textinput') as HTMLInputElement;
			const radioinput = document.getElementById('radioinput') as HTMLInputElement;
			const numberinput = document.getElementById('numberinput') as HTMLInputElement;
			const progress = document.getElementById('progress') as HTMLProgressElement;
			const checkboxinput = document.getElementById('checkboxinput') as HTMLInputElement;

			cleanup(() => {
				textinput.readOnly = false;
			});
			expect(getComputedStyle(subject).color, 'ancestor should be black').toBe('rgb(0, 0, 0)');
			textinput.readOnly = true;
			expect(getComputedStyle(subject).color, 'ancestor should be skyblue').toBe(
				'rgb(135, 206, 235)',
			);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		':valid invalidation',
		({ document, getComputedStyle, cleanup }) => {
			const subject = document.getElementById('subject') as HTMLElement;
			const checkme = document.getElementById('checkme') as HTMLInputElement;
			const textinput = document.getElementById('textinput') as HTMLInputElement;
			const radioinput = document.getElementById('radioinput') as HTMLInputElement;
			const numberinput = document.getElementById('numberinput') as HTMLInputElement;
			const progress = document.getElementById('progress') as HTMLProgressElement;
			const checkboxinput = document.getElementById('checkboxinput') as HTMLInputElement;

			cleanup(() => {
				textinput.value = '';
			});
			expect(getComputedStyle(subject).color, 'ancestor should be black').toBe('rgb(0, 0, 0)');
			textinput.value = 'text input';
			expect(getComputedStyle(subject).color, 'ancestor should be lightgreen').toBe(
				'rgb(144, 238, 144)',
			);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		':default invalidation with input[type=radio]',
		({ document, getComputedStyle, cleanup }) => {
			const subject = document.getElementById('subject') as HTMLElement;
			const checkme = document.getElementById('checkme') as HTMLInputElement;
			const textinput = document.getElementById('textinput') as HTMLInputElement;
			const radioinput = document.getElementById('radioinput') as HTMLInputElement;
			const numberinput = document.getElementById('numberinput') as HTMLInputElement;
			const progress = document.getElementById('progress') as HTMLProgressElement;
			const checkboxinput = document.getElementById('checkboxinput') as HTMLInputElement;

			cleanup(() => {
				radioinput.removeAttribute('type');
			});
			expect(getComputedStyle(subject).color, 'ancestor should be black').toBe('rgb(0, 0, 0)');
			radioinput.type = 'radio';
			expect(getComputedStyle(subject).color, 'ancestor should be lightblue').toBe(
				'rgb(173, 216, 230)',
			);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		':required invalidation',
		({ document, getComputedStyle, cleanup }) => {
			const subject = document.getElementById('subject') as HTMLElement;
			const checkme = document.getElementById('checkme') as HTMLInputElement;
			const textinput = document.getElementById('textinput') as HTMLInputElement;
			const radioinput = document.getElementById('radioinput') as HTMLInputElement;
			const numberinput = document.getElementById('numberinput') as HTMLInputElement;
			const progress = document.getElementById('progress') as HTMLProgressElement;
			const checkboxinput = document.getElementById('checkboxinput') as HTMLInputElement;

			cleanup(() => {
				numberinput.required = false;
			});
			expect(getComputedStyle(subject).color, 'ancestor should be black').toBe('rgb(0, 0, 0)');
			numberinput.required = true;
			expect(getComputedStyle(subject).color, 'ancestor should be pink').toBe('rgb(255, 192, 203)');
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		':out-of-range invalidation',
		({ document, getComputedStyle, cleanup }) => {
			const subject = document.getElementById('subject') as HTMLElement;
			const checkme = document.getElementById('checkme') as HTMLInputElement;
			const textinput = document.getElementById('textinput') as HTMLInputElement;
			const radioinput = document.getElementById('radioinput') as HTMLInputElement;
			const numberinput = document.getElementById('numberinput') as HTMLInputElement;
			const progress = document.getElementById('progress') as HTMLProgressElement;
			const checkboxinput = document.getElementById('checkboxinput') as HTMLInputElement;

			cleanup(() => {
				numberinput.value = 5 as unknown as string;
			});
			expect(getComputedStyle(subject).color, 'ancestor should be black').toBe('rgb(0, 0, 0)');
			numberinput.value = 12 as unknown as string;
			expect(getComputedStyle(subject).color, 'ancestor should be darkgreen').toBe(
				'rgb(0, 100, 0)',
			);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		':placeholder-shown invalidation',
		({ document, getComputedStyle, cleanup }) => {
			const subject = document.getElementById('subject') as HTMLElement;
			const checkme = document.getElementById('checkme') as HTMLInputElement;
			const textinput = document.getElementById('textinput') as HTMLInputElement;
			const radioinput = document.getElementById('radioinput') as HTMLInputElement;
			const numberinput = document.getElementById('numberinput') as HTMLInputElement;
			const progress = document.getElementById('progress') as HTMLProgressElement;
			const checkboxinput = document.getElementById('checkboxinput') as HTMLInputElement;

			cleanup(() => {
				textinput.removeAttribute('placeholder');
			});
			expect(getComputedStyle(subject).color, 'ancestor should be black').toBe('rgb(0, 0, 0)');
			textinput.placeholder = 'placeholder text';
			expect(getComputedStyle(subject).color, 'ancestor should be navy').toBe('rgb(0, 0, 128)');
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		':default invalidation with input[type=checkbox] and assignment to .checked',
		({ document, getComputedStyle, cleanup }) => {
			const subject = document.getElementById('subject') as HTMLElement;
			const checkme = document.getElementById('checkme') as HTMLInputElement;
			const textinput = document.getElementById('textinput') as HTMLInputElement;
			const radioinput = document.getElementById('radioinput') as HTMLInputElement;
			const numberinput = document.getElementById('numberinput') as HTMLInputElement;
			const progress = document.getElementById('progress') as HTMLProgressElement;
			const checkboxinput = document.getElementById('checkboxinput') as HTMLInputElement;

			cleanup(() => {
				checkboxinput.checked = false;
				checkboxinput.removeAttribute('checked');
			});
			expect(getComputedStyle(subject).color, 'ancestor should be black').toBe('rgb(0, 0, 0)');
			checkboxinput.checked = true;
			expect(getComputedStyle(subject).color, 'ancestor should still be black').toBe(
				'rgb(0, 0, 0)',
			);
			checkboxinput.setAttribute('checked', '');
			expect(getComputedStyle(subject).color, 'ancestor should be purple').toBe('rgb(128, 0, 128)');
			checkboxinput.checked = false;
			expect(getComputedStyle(subject).color, 'ancestor should still be purple').toBe(
				'rgb(128, 0, 128)',
			);
			checkboxinput.removeAttribute('checked');
			expect(getComputedStyle(subject).color, 'ancestor should be black').toBe('rgb(0, 0, 0)');
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
}
