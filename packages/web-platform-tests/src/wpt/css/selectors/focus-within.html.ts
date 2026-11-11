import type { CompatibilityContext } from '../../../shared/context.ts';

const markup1 = `<!DOCTYPE html>
<html>
<meta charset="utf-8">
<title>:focus-within pseudo</title>



<!-- Regression test for https://github.com/jsdom/jsdom/issues/3055 -->

<div id="container">
  Focus here:
  <button id="button">focus me</button>
</div>


</html>
`;

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		':focus-within applies to focused element',
		async ({ document, cleanup }) => {
			const container = document.getElementById('container')!;
			const button = document.getElementById('button')!;
			async function waitForWindowFocus() {
				// Wait for the test window to gain focus before testing synchronous focus changes.
				const sentinel = document.createElement('button');
				document.body.append(sentinel);
				cleanup(() => sentinel.remove());
				await new Promise((resolve) => {
					sentinel.addEventListener('focus', resolve, { once: true });
					sentinel.focus();
				});
				sentinel.blur();
			}

			await waitForWindowFocus();
			cleanup(() => button.blur());
			button.focus();
			expect(button.matches(':focus')).toBe(true);
			expect(button.matches(':focus-within')).toBe(true);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup1,
			},
		},
	);
	context.test(
		':focus-within applies to ancestor',
		async ({ document, cleanup }) => {
			const container = document.getElementById('container')!;
			const button = document.getElementById('button')!;
			async function waitForWindowFocus() {
				// Wait for the test window to gain focus before testing synchronous focus changes.
				const sentinel = document.createElement('button');
				document.body.append(sentinel);
				cleanup(() => sentinel.remove());
				await new Promise((resolve) => {
					sentinel.addEventListener('focus', resolve, { once: true });
					sentinel.focus();
				});
				sentinel.blur();
			}

			await waitForWindowFocus();
			cleanup(() => button.blur());
			button.focus();
			expect(container.matches(':focus')).toBe(false);
			expect(container.matches(':focus-within')).toBe(true);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup1,
			},
		},
	);
}
