import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	{
		const content = `<!DOCTYPE html>
<html>
  <head>
    <title>Text input element</title>
\x20\x20\x20\x20
\x20\x20\x20\x20
\x20\x20\x20\x20
\x20\x20\x20\x20
  </head>

  <body>
    <h1>Text input element</h1>
    <div style="display: none">

    <input id="text" type="text" />
    <input id="text_with_value" type="text" value="foo" />

    <input id="search" type="search" />
    <input id="search_with_value" type="search" value="foo" />

    </div>
    <div id="log"></div>
\x20\x20
  </body>
</html>
`;
		const types = ['text', 'search'];
		for (let i = 0; i < types.length; i++) {
			context.test(
				'Value sanitization algorithm should strip line breaks for ' + types[i],
				({ document }) => {
					// Any LF (\n) must be stripped.
					(document.getElementById(types[i]!) as HTMLInputElement).value = '\nAB';
					expect((document.getElementById(types[i]!) as HTMLInputElement).value).toBe('AB');
					(document.getElementById(types[i]!) as HTMLInputElement).value = 'A\nB';
					expect((document.getElementById(types[i]!) as HTMLInputElement).value).toBe('AB');
					(document.getElementById(types[i]!) as HTMLInputElement).value = 'AB\n';
					expect((document.getElementById(types[i]!) as HTMLInputElement).value).toBe('AB');

					// Any CR (\r) must be stripped.
					(document.getElementById(types[i]!) as HTMLInputElement).value = '\rAB';
					expect((document.getElementById(types[i]!) as HTMLInputElement).value).toBe('AB');
					(document.getElementById(types[i]!) as HTMLInputElement).value = 'A\rB';
					expect((document.getElementById(types[i]!) as HTMLInputElement).value).toBe('AB');
					(document.getElementById(types[i]!) as HTMLInputElement).value = 'AB\r';
					expect((document.getElementById(types[i]!) as HTMLInputElement).value).toBe('AB');

					// Any combinations of LF CR must be stripped.
					(document.getElementById(types[i]!) as HTMLInputElement).value = '\r\nAB';
					expect((document.getElementById(types[i]!) as HTMLInputElement).value).toBe('AB');
					(document.getElementById(types[i]!) as HTMLInputElement).value = 'A\r\nB';
					expect((document.getElementById(types[i]!) as HTMLInputElement).value).toBe('AB');
					(document.getElementById(types[i]!) as HTMLInputElement).value = 'AB\r\n';
					expect((document.getElementById(types[i]!) as HTMLInputElement).value).toBe('AB');
					(document.getElementById(types[i]!) as HTMLInputElement).value = '\r\nA\n\rB\r\n';
					expect((document.getElementById(types[i]!) as HTMLInputElement).value).toBe('AB');
				},
				{ document: { contentType: 'text/html', content } },
			);
		}

		for (const type of types) {
			context.test(
				'Value returns the current value for ' + type,
				({ document }) => {
					expect((document.getElementById(type) as HTMLInputElement).value).toBe('');
					expect((document.getElementById(type + '_with_value') as HTMLInputElement).value).toBe(
						'foo',
					);
				},
				{ document: { contentType: 'text/html', content } },
			);
			context.test(
				'Setting value changes the current value for ' + type,
				({ document }) => {
					const element = document.getElementById(type) as HTMLInputElement;
					element.value = 'A';
					expect(element.value).toBe('A');
					element.value = 'B';
				},
				{ document: { contentType: 'text/html', content } },
			);
			context.test(
				'files attribute must return null for ' + type,
				({ document }) => {
					expect((document.getElementById(type) as HTMLInputElement).files).toBe(null);
				},
				{ document: { contentType: 'text/html', content } },
			);
			context.test(
				'valueAsDate attribute must return null for ' + type,
				({ document }) => {
					expect((document.getElementById(type) as HTMLInputElement).valueAsDate).toBe(null);
				},
				{ document: { contentType: 'text/html', content } },
			);
			context.test(
				'valueAsNumber attribute must return NaN for ' + type,
				({ document }) => {
					expect((document.getElementById(type) as HTMLInputElement).valueAsNumber).toBe(NaN);
				},
				{ document: { contentType: 'text/html', content } },
			);
			context.test(
				'list attribute must return null for ' + type,
				({ document }) => {
					expect((document.getElementById('text') as HTMLInputElement).list).toBe(null);
				},
				{ document: { contentType: 'text/html', content } },
			);
			context.test(
				'stepDown does not apply for ' + type,
				({ document, DOMException }) => {
					const el = document.getElementById(type) as HTMLInputElement;
					let error: unknown;
					try {
						el.stepDown();
					} catch (caught) {
						error = caught;
					}
					expect(error).toBeInstanceOf(DOMException);
					expect(error).toMatchObject({ name: 'InvalidStateError', code: 11 });
				},
				{ document: { contentType: 'text/html', content } },
			);
			context.test(
				'stepUp does not apply for ' + type,
				({ document, DOMException }) => {
					const el = document.getElementById(type) as HTMLInputElement;
					let error: unknown;
					try {
						el.stepUp();
					} catch (caught) {
						error = caught;
					}
					expect(error).toBeInstanceOf(DOMException);
					expect(error).toMatchObject({ name: 'InvalidStateError', code: 11 });
				},
				{ document: { contentType: 'text/html', content } },
			);
		}
	}
}
