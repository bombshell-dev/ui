import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	{
		const content =
			"<!DOCTYPE HTML>\n<title>textarea setCustomValidity</title>\n\n\n\n<textarea id='textarea_test'></textarea>\n\n\n";

		context.test(
			'textarea setCustomValidity is correct',
			({ document }) => {
				let elem = document.getElementById('textarea_test') as HTMLTextAreaElement;
				expect(elem.validity.customError).toBe(false);
				elem.setCustomValidity('custom error');
				expect(elem.validity.customError).toBe(true);
			},
			{ document: { contentType: 'text/html', content } },
		);
	}
}
