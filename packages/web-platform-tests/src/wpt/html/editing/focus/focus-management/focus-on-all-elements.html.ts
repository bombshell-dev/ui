import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'the focus method exists on all elements, not just focusable ones',
		({ document }) => {
			expect(typeof document.querySelector('input')!.focus).toBe('function');
			expect(typeof document.querySelector('div')!.focus).toBe('function');
		},
		{
			document: {
				contentType: 'text/html',
				content:
					'<!DOCTYPE html>\n<meta charset="utf-8">\n<title>element.focus()</title>\n\n\n\n\n\n<input>\n<div></div>\n\n\n',
			},
		},
	);
}
