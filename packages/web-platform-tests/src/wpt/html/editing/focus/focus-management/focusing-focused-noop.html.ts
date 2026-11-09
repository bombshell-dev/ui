import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'focusing a focused element does not dispatch focus events',
		async ({ document, cleanup }) => {
			// cleanup
			const container = document.getElementById('container')!;
			container.innerHTML = '';
			// Wait for the test window to gain focus before counting synchronous events.
			const sentinel = document.createElement('button');
			container.appendChild(sentinel);
			cleanup(() => {
				container.innerHTML = '';
			});
			await new Promise((resolve) => {
				sentinel.addEventListener('focus', resolve, { once: true });
				sentinel.focus();
			});
			sentinel.blur();

			const input = document.createElement('button');
			let handleFocusCallCount = 0;
			input.addEventListener('focus', () => {
				handleFocusCallCount += 1;
			});
			let handleBlurCallCount = 0;
			input.addEventListener('blur', () => {
				handleBlurCallCount += 1;
			});
			let handleFocusInCallCount = 0;
			input.addEventListener('focusin', () => {
				handleFocusInCallCount += 1;
			});
			let handleFocusOutCallCount = 0;
			input.addEventListener('focusout', () => {
				handleFocusOutCallCount += 1;
			});

			container.appendChild(input);

			input.focus();
			(document.activeElement as HTMLElement).focus();

			expect(handleBlurCallCount).toBe(0);
			expect(handleFocusOutCallCount).toBe(0);
			expect(handleFocusCallCount).toBe(1);
			expect(handleFocusInCallCount).toBe(1);
		},
		{
			document: {
				contentType: 'text/html',
				content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Focus events fire at correct targets in correct order in simple case</title>
\x20\x20
\x20\x20
\x20\x20
</head>
<body>
  <div id="container"></div>
\x20\x20
</body>
</html>
`,
			},
		},
	);
}
