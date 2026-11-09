import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	{
		const content =
			'<!doctype html>\n<meta charset="utf-8">\n<title>Testing [SameObject] on the \'elements\' attribute on the \'form\' element</title>\n\n\n<div id="log"></div>\n\n<form>\n  <input>\n</form>\n\n\n';

		context.test(
			"[SameObject] should apply to 'elements' attr on <form>",
			({ document }) => {
				let form = document.querySelector('form')!;
				let elements = form.elements;
				expect(elements).toBe(form.elements);
				form.appendChild(document.createElement('input'));
				expect(elements).toBe(form.elements);
			},
			{ document: { contentType: 'text/html', content } },
		);
	}
}
