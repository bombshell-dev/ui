import type { CompatibilityContext } from '../../../../../shared/context.ts';

export const input = ['keyboard'] as const;

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('Submit event with a submit button', async ({ document, SubmitEvent, input }) => {
		let frameCounter = 0;
		function populateForm(optionalContentHtml = '') {
			const frameName = 'form-test-target-' + frameCounter++;
			document.body.insertAdjacentHTML(
				'afterbegin',
				`<iframe name="${frameName}"></iframe><form action="/common/blank.html" target="${frameName}">${optionalContentHtml}</form>`,
			);
			return document.getElementsByName(frameName)[0]!.nextSibling as HTMLFormElement & {
				text: HTMLInputElement;
				submitButton: HTMLInputElement;
			};
		}

		let form = populateForm('<input name=text value=abc><input name=submitButton type=submit>');
		let event!: SubmitEvent;
		form.text.focus();
		form.addEventListener('submit', (e) => {
			event = e as SubmitEvent;
		});
		form.text.focus();
		await input.press('Enter');
		expect(event.bubbles).toBe(true);
		expect(event.cancelable).toBe(true);
		expect(event.submitter).toBe(form.submitButton);
		expect(event instanceof SubmitEvent).toBe(true);
	});
	context.test('Submit event with no submit button', async ({ document, SubmitEvent, input }) => {
		let frameCounter = 0;
		function populateForm(optionalContentHtml = '') {
			const frameName = 'form-test-target-' + frameCounter++;
			document.body.insertAdjacentHTML(
				'afterbegin',
				`<iframe name="${frameName}"></iframe><form action="/common/blank.html" target="${frameName}">${optionalContentHtml}</form>`,
			);
			return document.getElementsByName(frameName)[0]!.nextSibling as HTMLFormElement & {
				text: HTMLInputElement;
				submitButton: HTMLInputElement;
			};
		}

		let form = populateForm('<input name=text value=abc>');
		let event!: SubmitEvent;
		form.text.focus();
		form.addEventListener('submit', (e) => {
			event = e as SubmitEvent;
		});
		form.text.focus();
		await input.press('Enter');
		expect(event.bubbles).toBe(true);
		expect(event.cancelable).toBe(true);
		expect(event.submitter).toBe(null);
		expect(event instanceof SubmitEvent).toBe(true);
	});
	context.test('Submit event with disabled submit button', async ({ document, step, input }) => {
		let frameCounter = 0;
		function populateForm(optionalContentHtml = '') {
			const frameName = 'form-test-target-' + frameCounter++;
			document.body.insertAdjacentHTML(
				'afterbegin',
				`<iframe name="${frameName}"></iframe><form action="/common/blank.html" target="${frameName}">${optionalContentHtml}</form>`,
			);
			return document.getElementsByName(frameName)[0]!.nextSibling as HTMLFormElement & {
				text: HTMLInputElement;
				submitButton: HTMLInputElement;
			};
		}

		let form = populateForm(
			'<input name=text value=abc><input name=submitButton type=submit disabled>',
		);
		form.text.focus();
		form.addEventListener(
			'submit',
			step(() => expect.unreachable('submit event should not be dispatched')),
		);
		form.text.focus();
		await input.press('Enter');
	});
}
