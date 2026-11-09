import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'focusing on a focusable element fires a focus event at the element',
		async ({ document, step }) => {
			const i1 = document.getElementById('i1')!,
				i2 = document.getElementById('i2')!;
			await new Promise<void>((resolve) => {
				i2.onfocus = (e) => {
					step(() => {
						expect(e.isTrusted, 'focus event is trusted').toBe(true);
						expect(e.bubbles, "focus event doesn't bubble").toBe(false);
						expect(e.cancelable, 'focus event is not cancelable').toBe(false);
						expect(document.activeElement).toBe(i2);
					})();
					resolve();
				};
				i1.focus();
				i2.focus();
			});
		},
		{
			document: {
				contentType: 'text/html',
				content:
					'<!DOCTYPE html>\n<meta charset=utf-8>\n<title>Focus management</title>\n\n\n\n\n<div id="log"></div>\n<input type=text id=i1>\n<input type=text id=i2>\n\n',
			},
		},
	);
	context.test(
		'focusing on a focusable element fires a blur event at the previous focussed element',
		async ({ document, step }) => {
			const i1 = document.getElementById('i1')!,
				i2 = document.getElementById('i2')!;
			await new Promise<void>((resolve) => {
				i1.onblur = (e) => {
					step(() => {
						expect(e.isTrusted, 'blur event is trusted').toBe(true);
						expect(e.bubbles, "blur event doesn't bubble").toBe(false);
						expect(e.cancelable, 'blur event is not cancelable').toBe(false);
						expect(document.activeElement).toBe(document.body);
					})();
					resolve();
				};
				i1.focus();
				i2.focus();
			});
		},
		{
			document: {
				contentType: 'text/html',
				content:
					'<!DOCTYPE html>\n<meta charset=utf-8>\n<title>Focus management</title>\n\n\n\n\n<div id="log"></div>\n<input type=text id=i1>\n<input type=text id=i2>\n\n',
			},
		},
	);
}
