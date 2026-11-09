import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'focusing a focused element must not dispatch focus events or change activeElement',
		({ document }) => {
			const button = document.createElement('button');
			let handleFocusCallCount = 0;
			button.addEventListener('focus', () => {
				handleFocusCallCount += 1;
			});

			button.focus();

			expect(handleFocusCallCount).toBe(0);
			expect(document.activeElement).toBe(document.body);
		},
		{
			document: {
				contentType: 'text/html',
				content:
					'<!DOCTYPE html>\n<meta charset="utf-8">\n<title>Focusing a disconnected node is a no-op</title>\n\n\n\n\n',
			},
		},
	);
}
