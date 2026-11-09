// WPT helper: html/semantics/forms/form-submission-0/resources/targetted-form.js
import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('"formdata" event bubbles, and is not cancelable.', ({ document, FormData }) => {
		let frameCounter = 0;

		function populateForm(optionalContentHtml?: string) {
			if (!optionalContentHtml) optionalContentHtml = '';
			const frameName = 'form-test-target-' + frameCounter++;
			document.body.insertAdjacentHTML(
				'afterbegin',
				`<iframe name="${frameName}"></iframe>` +
					`<form action="/common/blank.html" target="` +
					`${frameName}">${optionalContentHtml}</form>`,
			);
			return document.getElementsByName(frameName)[0]!.nextSibling as HTMLFormElement;
		}

		let didCallHandler = false;
		let wasBubbles = false;
		let wasCancelable = true;
		let form = populateForm();
		document.addEventListener('formdata', (e) => {
			didCallHandler = true;
			wasBubbles = e.bubbles;
			wasCancelable = e.cancelable;
		});
		new FormData(form);
		expect(didCallHandler).toBe(true);
		expect(wasBubbles).toBe(true);
		expect(wasCancelable).toBe(false);
	});
	context.test('"formdata" event bubbles in an orphan tree.', ({ document, FormData }) => {
		let frameCounter = 0;

		function populateForm(optionalContentHtml?: string) {
			if (!optionalContentHtml) optionalContentHtml = '';
			const frameName = 'form-test-target-' + frameCounter++;
			document.body.insertAdjacentHTML(
				'afterbegin',
				`<iframe name="${frameName}"></iframe>` +
					`<form action="/common/blank.html" target="` +
					`${frameName}">${optionalContentHtml}</form>`,
			);
			return document.getElementsByName(frameName)[0]!.nextSibling as HTMLFormElement;
		}

		let didCallHandler = false;
		let form = populateForm();
		let orphanRoot = document.createElement('div');
		orphanRoot.appendChild(form);
		orphanRoot.addEventListener('formdata', (e) => {
			didCallHandler = true;
		});
		new FormData(form);
		expect(didCallHandler).toBe(true);
	});
	context.test(
		'"formData" IDL attribute should have entries for form-associated elements' +
			' in the first event handler, and the second handler can read entries ' +
			'set by the first handler.',
		({ document }) => {
			let frameCounter = 0;

			function populateForm(optionalContentHtml?: string) {
				if (!optionalContentHtml) optionalContentHtml = '';
				const frameName = 'form-test-target-' + frameCounter++;
				document.body.insertAdjacentHTML(
					'afterbegin',
					`<iframe name="${frameName}"></iframe>` +
						`<form action="/common/blank.html" target="` +
						`${frameName}">${optionalContentHtml}</form>`,
				);
				return document.getElementsByName(frameName)[0]!.nextSibling as HTMLFormElement;
			}

			let listener1ok = false;
			let listener2ok = false;
			let form = populateForm('<input name=n1 value=v1>');
			form.addEventListener('formdata', (e) => {
				listener1ok = e.formData.get('n1') == 'v1';
				e.formData.append('h1', 'vh1');
				e.formData.append('h2', 'vh2');
			});
			form.addEventListener('formdata', (e) => {
				if (e.formData.get('h1') == 'vh1' && e.formData.get('h2') == 'vh2') listener2ok = true;
			});
			form.submit();
			expect(listener1ok).toBe(true);
			expect(listener2ok).toBe(true);
		},
	);
	context.test(
		'Entries added to the "formdata" IDL attribute shouldn\'t be newline normalized in the resulting FormData',
		({ document, FormData }) => {
			let frameCounter = 0;

			function populateForm(optionalContentHtml?: string) {
				if (!optionalContentHtml) optionalContentHtml = '';
				const frameName = 'form-test-target-' + frameCounter++;
				document.body.insertAdjacentHTML(
					'afterbegin',
					`<iframe name="${frameName}"></iframe>` +
						`<form action="/common/blank.html" target="` +
						`${frameName}">${optionalContentHtml}</form>`,
				);
				return document.getElementsByName(frameName)[0]!.nextSibling as HTMLFormElement;
			}

			const form = populateForm('');
			form.addEventListener('formdata', (e) => {
				e.formData.append('a\nb', 'c\rd');
			});
			const formData = new FormData(form);
			const [name, value] = [...formData][0]!;
			expect(name).toBe('a\nb');
			expect(value).toBe('c\rd');
		},
	);
}
