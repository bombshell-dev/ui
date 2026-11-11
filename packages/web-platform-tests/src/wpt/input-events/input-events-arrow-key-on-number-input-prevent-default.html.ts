import type { CompatibilityContext } from '../../shared/context.ts';

export const input = ['keyboard'] as const;

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'Number input should not fire input and change event if the beforeinput event is default prevented',
		async ({ document, input }) => {
			const inputElement = document.getElementById('number_input')! as HTMLInputElement;
			const events: string[] = [];
			inputElement.addEventListener('beforeinput', (e) => {
				e.preventDefault();
				events.push('beforeinput');
			});
			inputElement.addEventListener('input', () => {
				events.push('input');
			});
			inputElement.addEventListener('change', () => {
				events.push('change');
			});

			inputElement.focus();

			inputElement.focus();
			await input.press('ArrowUp');
			{
				const actualArray = events;
				const expectedArray = ['beforeinput'];
				expect(actualArray.length).toBe(expectedArray.length);
				for (let index = 0; index < expectedArray.length; index++)
					expect(actualArray[index]).toBe(expectedArray[index]);
			}
		},
		{
			document: {
				contentType: 'text/html',
				content:
					'<!DOCTYPE html>\n<html>\n<head>\n\n\n\n\n</head>\n<body>\n<input type="number" id="number_input">\n\n</body>\n</html>',
			},
		},
	);
}
