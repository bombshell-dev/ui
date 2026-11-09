import type { CompatibilityContext } from '../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	for (const mode of ['open', 'closed'] as const) {
		context.test(
			'adoptNode on a shadow root in ' + mode + ' mode must throw a HierarchyRequestError',
			({ document, DOMException }) => {
				var newDocument = document.implementation.createHTMLDocument();
				expect(function () {
					var element = document.createElement('div');
					var shadowRoot = element.attachShadow({ mode: mode });
					newDocument.adoptNode(shadowRoot);
				}).toThrow(
					expect.objectContaining({
						name: 'HierarchyRequestError',
						code: 3,
						constructor: DOMException,
					}),
				);
			},
			{
				document: {
					contentType: 'text/html',
					content: `<!DOCTYPE html>
<html>
<head>
<title>DOM and Shadow DOM: Document.prototype.adoptNode</title>
<meta name="author" title="Ryosuke Niwa" href="mailto:rniwa@webkit.org">
<meta name="assert" content="The adoptNode(node) method must throw a HierarchyRequestError exception if node is a shadow root.">



</head>
<body>
<div id="log"></div>

</body>
</html>
`,
				},
			},
		);
	}
}
