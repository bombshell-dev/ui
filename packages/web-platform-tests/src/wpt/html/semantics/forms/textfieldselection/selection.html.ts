import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	{
		const { expect } = context.runner;

		context.test('test if selection text is correct for input', ({ document }) => {
			const body = document.getElementsByTagName('body').item(0)!;
			const dirs = ['forward', 'backward', 'none'];
			const sampleText = '0123456789';
			function createInputElement(value: string, append = true) {
				const el = document.createElement('input');
				el.type = 'text';
				el.value = value;
				el.id = 'input' + (append ? '-appended' : '-not-appended');
				if (append) body.appendChild(el);
				return el;
			}

			let text = 'a';
			for (let i = 0; i < 255; i++) {
				let el = createInputElement(text);
				el.select();
				let selectionText = el.value.substring(el.selectionStart!, el.selectionEnd!);
				expect(selectionText, 'Selection text mismatched').toBe(text);
				el.parentNode!.removeChild(el);
				text += 'a';
			}
		});
		context.test('test if non-ascii selection text is correct for input', ({ document }) => {
			const body = document.getElementsByTagName('body').item(0)!;
			const dirs = ['forward', 'backward', 'none'];
			const sampleText = '0123456789';
			function createInputElement(value: string, append = true) {
				const el = document.createElement('input');
				el.type = 'text';
				el.value = value;
				el.id = 'input' + (append ? '-appended' : '-not-appended');
				if (append) body.appendChild(el);
				return el;
			}

			let text = 'あ';
			for (let i = 0; i < 255; i++) {
				let el = createInputElement(text);
				el.select();
				let selectionText = el.value.substring(el.selectionStart!, el.selectionEnd!);
				expect(selectionText, 'Selection text mismatched').toBe(text);
				el.parentNode!.removeChild(el);
				text += 'あ';
			}
		});
		for (const append of [true, false]) {
			context.test(
				'test SelectionStart offset for input that is ' + (append ? 'appended' : ' not appended'),
				({ document }) => {
					const body = document.getElementsByTagName('body').item(0)!;
					const dirs = ['forward', 'backward', 'none'];
					const sampleText = '0123456789';
					function createInputElement(value: string, append = true) {
						const el = document.createElement('input');
						el.type = 'text';
						el.value = value;
						el.id = 'input' + (append ? '-appended' : '-not-appended');
						if (append) body.appendChild(el);
						return el;
					}

					let el = createInputElement(sampleText, append);
					// If there is no selection, then it must return the offset(in logical order)
					// to the character that immediately follows the text entry cursor.
					expect(el.selectionStart, 'SelectionStart offset without selection in ' + el.id).toBe(
						el.value.length,
					);
					el.select();
					expect(el.selectionStart, 'SelectionStart offset').toBe(0);
					el.remove();
				},
			);
		}
		for (const append of [true, false]) {
			context.test(
				'test SelectionEnd offset for input that is ' + (append ? 'appended' : ' not appended'),
				({ document }) => {
					const body = document.getElementsByTagName('body').item(0)!;
					const dirs = ['forward', 'backward', 'none'];
					const sampleText = '0123456789';
					function createInputElement(value: string, append = true) {
						const el = document.createElement('input');
						el.type = 'text';
						el.value = value;
						el.id = 'input' + (append ? '-appended' : '-not-appended');
						if (append) body.appendChild(el);
						return el;
					}

					let el = createInputElement(sampleText, append);
					// If there is no selection, then it must return the offset(in logical order)
					// to the character that immediately follows the text entry cursor.
					expect(el.selectionEnd, 'SelectionEnd offset without selection in ' + el.id).toBe(
						el.value.length,
					);
					el.select();
					expect(el.selectionEnd, 'SelectionEnd offset').toBe(el.value.length);
					el.remove();
				},
			);
		}
		context.test('test SelectionDirection for input', ({ document }) => {
			const body = document.getElementsByTagName('body').item(0)!;
			const dirs = ['forward', 'backward', 'none'];
			const sampleText = '0123456789';
			function createInputElement(value: string, append = true) {
				const el = document.createElement('input');
				el.type = 'text';
				el.value = value;
				el.id = 'input' + (append ? '-appended' : '-not-appended');
				if (append) body.appendChild(el);
				return el;
			}

			let el = createInputElement(sampleText);
			expect(dirs, 'SelectionDirection').toContain(el.selectionDirection);
			el.select();
			expect(dirs, 'SelectionDirection').toContain(el.selectionDirection);
			el.parentNode!.removeChild(el);
		});
	}
	{
		const { expect } = context.runner;

		context.test('test if selection text is correct for textarea', ({ document }) => {
			const body = document.getElementsByTagName('body').item(0)!;
			const dirs = ['forward', 'backward', 'none'];
			const sampleText = '0123456789';
			function createTextareaElement(value: string, append = true) {
				const el = document.createElement('textarea');

				el.value = value;
				el.id = 'textarea' + (append ? '-appended' : '-not-appended');
				if (append) body.appendChild(el);
				return el;
			}

			let text = 'a';
			for (let i = 0; i < 255; i++) {
				let el = createTextareaElement(text);
				el.select();
				let selectionText = el.value.substring(el.selectionStart!, el.selectionEnd!);
				expect(selectionText, 'Selection text mismatched').toBe(text);
				el.parentNode!.removeChild(el);
				text += 'a';
			}
		});
		context.test('test if non-ascii selection text is correct for textarea', ({ document }) => {
			const body = document.getElementsByTagName('body').item(0)!;
			const dirs = ['forward', 'backward', 'none'];
			const sampleText = '0123456789';
			function createTextareaElement(value: string, append = true) {
				const el = document.createElement('textarea');

				el.value = value;
				el.id = 'textarea' + (append ? '-appended' : '-not-appended');
				if (append) body.appendChild(el);
				return el;
			}

			let text = 'あ';
			for (let i = 0; i < 255; i++) {
				let el = createTextareaElement(text);
				el.select();
				let selectionText = el.value.substring(el.selectionStart!, el.selectionEnd!);
				expect(selectionText, 'Selection text mismatched').toBe(text);
				el.parentNode!.removeChild(el);
				text += 'あ';
			}
		});
		for (const append of [true, false]) {
			context.test(
				'test SelectionStart offset for textarea that is ' +
					(append ? 'appended' : ' not appended'),
				({ document }) => {
					const body = document.getElementsByTagName('body').item(0)!;
					const dirs = ['forward', 'backward', 'none'];
					const sampleText = '0123456789';
					function createTextareaElement(value: string, append = true) {
						const el = document.createElement('textarea');

						el.value = value;
						el.id = 'textarea' + (append ? '-appended' : '-not-appended');
						if (append) body.appendChild(el);
						return el;
					}

					let el = createTextareaElement(sampleText, append);
					// If there is no selection, then it must return the offset(in logical order)
					// to the character that immediately follows the text entry cursor.
					expect(el.selectionStart, 'SelectionStart offset without selection in ' + el.id).toBe(
						el.value.length,
					);
					el.select();
					expect(el.selectionStart, 'SelectionStart offset').toBe(0);
					el.remove();
				},
			);
		}
		for (const append of [true, false]) {
			context.test(
				'test SelectionEnd offset for textarea that is ' + (append ? 'appended' : ' not appended'),
				({ document }) => {
					const body = document.getElementsByTagName('body').item(0)!;
					const dirs = ['forward', 'backward', 'none'];
					const sampleText = '0123456789';
					function createTextareaElement(value: string, append = true) {
						const el = document.createElement('textarea');

						el.value = value;
						el.id = 'textarea' + (append ? '-appended' : '-not-appended');
						if (append) body.appendChild(el);
						return el;
					}

					let el = createTextareaElement(sampleText, append);
					// If there is no selection, then it must return the offset(in logical order)
					// to the character that immediately follows the text entry cursor.
					expect(el.selectionEnd, 'SelectionEnd offset without selection in ' + el.id).toBe(
						el.value.length,
					);
					el.select();
					expect(el.selectionEnd, 'SelectionEnd offset').toBe(el.value.length);
					el.remove();
				},
			);
		}
		context.test('test SelectionDirection for textarea', ({ document }) => {
			const body = document.getElementsByTagName('body').item(0)!;
			const dirs = ['forward', 'backward', 'none'];
			const sampleText = '0123456789';
			function createTextareaElement(value: string, append = true) {
				const el = document.createElement('textarea');

				el.value = value;
				el.id = 'textarea' + (append ? '-appended' : '-not-appended');
				if (append) body.appendChild(el);
				return el;
			}

			let el = createTextareaElement(sampleText);
			expect(dirs, 'SelectionDirection').toContain(el.selectionDirection);
			el.select();
			expect(dirs, 'SelectionDirection').toContain(el.selectionDirection);
			el.parentNode!.removeChild(el);
		});
	}

	const { expect } = context.runner;
	context.test('test scrollLeft for input', async ({ document }) => {
		const el = document.createElement('input');
		el.type = 'text';
		el.value = '0123456789'.repeat(100);
		el.id = 'input-appended';
		document.getElementsByTagName('body').item(0)!.appendChild(el);
		el.selectionEnd = 0;
		await new Promise(document.defaultView!.requestAnimationFrame.bind(document.defaultView));
		expect(el.scrollLeft).toBe(0);
		el.select();
		await new Promise(document.defaultView!.requestAnimationFrame.bind(document.defaultView));
		expect(el.scrollLeft).toBe(0);
		el.remove();
	});
	context.test('test scrollLeft preservation for input', async ({ document }) => {
		const el = document.createElement('input');
		el.type = 'text';
		el.value = '0123456789'.repeat(100);
		el.id = 'input-appended';
		document.getElementsByTagName('body').item(0)!.appendChild(el);
		el.scrollLeft = 33;
		el.select();
		await new Promise(document.defaultView!.requestAnimationFrame.bind(document.defaultView));
		expect(el.scrollLeft).toBe(33);
		el.remove();
	});
	for (const localName of ['input', 'textarea'] as const) {
		context.test(`test container.scrollTop for ${localName}`, async ({ document }) => {
			const container = document.createElement('div');
			container.style.height = '100px';
			container.style.overflow = 'scroll';
			const element = document.createElement(localName);
			element.style.marginTop = '120px';
			container.append(element);
			document.body.append(container);
			element.select();
			await new Promise(document.defaultView!.requestAnimationFrame.bind(document.defaultView));
			expect(container.scrollTop).toBe(0);
			container.remove();
		});
	}
}
