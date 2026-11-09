import type { CompatibilityContext } from '../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test(
		'outerHTML: child of #document',
		({ document, DOMException }) => {
			expect(function () {
				document.documentElement.outerHTML =
					'<html><p>FAIL: Should have thrown an error<\/p><\/html>';
			}).toThrow(
				expect.objectContaining({
					name: 'NoModificationAllowedError',
					code: 7,
					constructor: DOMException,
				}),
			);
		},
		{
			document: {
				contentType: 'text/html',
				content: `<!DOCTYPE html>
<title>outerHTML: child of #document</title>
<link rel="author" title="Ms2ger" href="mailto:ms2ger@gmail.com">
<link rel="help" href="http://html5.org/specs/dom-parsing.html#outerhtml">


<div id="log"></div>


`,
			},
		},
	);
}
