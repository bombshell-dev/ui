import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test(
		"existing document's body",
		({ document, HTMLBodyElement }) => {
			expect(document.body).not.toBe(null);
			expect(document.body instanceof HTMLBodyElement, 'should be HTMLBodyElement').toBe(true);
			expect(document.body.tagName).toBe('BODY');
		},
		{
			document: {
				contentType: 'text/html',
				content: `<!DOCTYPE html>
<title>Document.body</title>
<link rel="author" title="Ms2ger" href="mailto:ms2ger@gmail.com">
<link rel="help" href="https://html.spec.whatwg.org/multipage/#dom-document-body">
<div id="log"></div>`,
			},
		},
	);
}
