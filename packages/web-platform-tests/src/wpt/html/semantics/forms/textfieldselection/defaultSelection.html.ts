import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	{
		const { expect } = context.runner;
		{
			const content =
				'<!doctype html>\n<meta charset="utf-8">\n<title></title>\n\n\n<textarea>foo</textarea>\n<input type="text" value="foo">\n\n';
			const el = '[object HTMLInputElement]';

			context.test(
				`Default selectionStart and selectionEnd for ${el}`,
				({ document }) => {
					const el = document.querySelector('input')!;

					expect(el.selectionStart).toBe(0);
					expect(el.selectionEnd).toBe(0);
				},
				{ document: { contentType: 'text/html', content } },
			);
			context.test(
				`selectionStart and selectionEnd do not change when same value set again for ${el}`,
				({ document }) => {
					const el = document.querySelector('input')!;

					el.value = 'foo';
					expect(el.selectionStart).toBe(0);
					expect(el.selectionEnd).toBe(0);
				},
				{ document: { contentType: 'text/html', content } },
			);
			context.test(
				`selectionStart and selectionEnd change when value changed to upper case for ${el}`,
				({ document }) => {
					const el = document.querySelector('input')!;

					el.value = 'Foo';
					expect(el.selectionStart).toBe(3);
					expect(el.selectionEnd).toBe(3);
				},
				{ document: { contentType: 'text/html', content } },
			);
		}
	}
	{
		const { expect } = context.runner;
		{
			const content =
				'<!doctype html>\n<meta charset="utf-8">\n<title></title>\n\n\n<textarea>foo</textarea>\n<input type="text" value="foo">\n\n';
			const el = '[object HTMLTextAreaElement]';

			context.test(
				`Default selectionStart and selectionEnd for ${el}`,
				({ document }) => {
					const el = document.querySelector('textarea')!;

					expect(el.selectionStart).toBe(0);
					expect(el.selectionEnd).toBe(0);
				},
				{ document: { contentType: 'text/html', content } },
			);
			context.test(
				`selectionStart and selectionEnd do not change when same value set again for ${el}`,
				({ document }) => {
					const el = document.querySelector('textarea')!;

					el.value = 'foo';
					expect(el.selectionStart).toBe(0);
					expect(el.selectionEnd).toBe(0);
				},
				{ document: { contentType: 'text/html', content } },
			);
			context.test(
				`selectionStart and selectionEnd change when value changed to upper case for ${el}`,
				({ document }) => {
					const el = document.querySelector('textarea')!;

					el.value = 'Foo';
					expect(el.selectionStart).toBe(3);
					expect(el.selectionEnd).toBe(3);
				},
				{ document: { contentType: 'text/html', content } },
			);
		}
	}
}
