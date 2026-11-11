import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'removing the activeElement keeps focus on its document',
		async ({ document, cleanup }) => {
			// Wait for the test window to gain focus before testing synchronous focus changes.
			const sentinel = document.createElement('button');
			document.body.append(sentinel);
			cleanup(() => sentinel.remove());
			await new Promise((resolve) => {
				sentinel.addEventListener('focus', resolve, { once: true });
				sentinel.focus();
			});
			sentinel.blur();

			const button = document.createElement('button');
			document.body.appendChild(button);
			cleanup(() => button.remove());
			button.focus();

			expect(document.activeElement).toBe(button);
			expect(document.hasFocus()).toBe(true);

			button.remove();

			expect(document.activeElement).toBe(document.body);
			expect(document.hasFocus()).toBe(true);
		},
		{
			document: {
				contentType: 'text/html',
				content:
					'<!DOCTYPE html>\n<meta charset="utf-8">\n<title>Focused area removal</title>\n\n\n<body>\n\n',
			},
		},
	);
}
