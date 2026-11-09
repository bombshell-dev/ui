import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'The focus() and blur() methods change the focus as expected',
		async ({ document, cleanup }) => {
			const input = document.querySelector('input')!;

			// Wait for the test window to gain focus before testing synchronous focus changes.
			const sentinel = document.createElement('button');
			document.body.append(sentinel);
			cleanup(() => sentinel.remove());
			await new Promise((resolve) => {
				sentinel.addEventListener('focus', resolve, { once: true });
				sentinel.focus();
			});
			sentinel.blur();

			cleanup(() => input.blur());
			expect(input.matches(':focus')).toBe(false);

			input.focus();
			expect(input.matches(':focus')).toBe(true);

			input.blur();
			expect(input.matches(':focus')).toBe(false);
		},
		{
			document: {
				contentType: 'text/html',
				content:
					'<!DOCTYPE html>\n<meta charset="utf-8">\n<title>element.focus() / element.blur()</title>\n\n\n\n<input>\n\n\n',
			},
		},
	);
}
