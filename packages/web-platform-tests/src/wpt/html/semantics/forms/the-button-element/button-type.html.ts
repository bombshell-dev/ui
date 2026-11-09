import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	{
		const content =
			'<!DOCTYPE html>\n<meta charset="utf-8">\n<title>HTMLButtonElement.prototype.type</title>\n\n\n\n\n\n\n';

		context.test(
			"a button's type should be submit by default",
			({ document }) => {
				const button = document.createElement('button') as HTMLButtonElement & { type: string };
				expect(button.type).toBe('submit');
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			"a button's type should stay within the range of valid values",
			({ document }) => {
				const button = document.createElement('button') as HTMLButtonElement & { type: string };

				for (const type of ['reset', 'button', 'submit']) {
					(button as unknown as { type: string }).type = type;
					expect(button.type).toBe(type);

					(button as unknown as { type: string }).type = type.toUpperCase();
					expect(button.type).toBe(type);
				}

				(button as unknown as { type: string }).type = 'reset';
				(button as unknown as { type: string }).type = 'asdfgdsafd';
				expect(button.type).toBe('submit');

				(button as unknown as { type: string }).type = 'reset';
				(button as unknown as { type: string }).type = '';
				expect(button.type).toBe('submit');
			},
			{ document: { contentType: 'text/html', content } },
		);
	}
}
