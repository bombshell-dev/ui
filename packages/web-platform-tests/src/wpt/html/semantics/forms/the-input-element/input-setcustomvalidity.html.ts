import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	{
		const content =
			"<!DOCTYPE HTML>\n<title>input setCustomValidity</title>\n\n\n\n<input id='input_test'>\n\n\n";

		context.test(
			'input setCustomValidity is correct',
			({ document }) => {
				let elem = document.getElementById('input_test') as HTMLInputElement;
				expect(elem.validity.customError).toBe(false);
				elem.setCustomValidity('custom error');
				expect(elem.validity.customError).toBe(true);
			},
			{ document: { contentType: 'text/html', content } },
		);
	}
}
