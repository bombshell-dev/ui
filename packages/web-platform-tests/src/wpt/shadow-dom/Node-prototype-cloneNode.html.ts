import type { CompatibilityContext } from '../../shared/context.ts';

const markup1 = `<!DOCTYPE html>
<html>
<head>
<title>DOM: cloneNode(deep)</title>
<meta name="author" title="Ryosuke Niwa" href="mailto:rniwa@webkit.org">
<meta name="assert" content="If context object is a shadow root, then it must throw a NotSupportedError.">



</head>
<body>
<div id="log"></div>

</body>
</html>
`;

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	for (const mode of ['open', 'closed'] as const) {
		context.test(
			'cloneNode on a shadow root in ' + mode + ' mode must throw a NotSupportedError',
			({ document, DOMException }) => {
				expect(
					function () {
						var element = document.createElement('div');
						var shadowRoot = element.attachShadow({ mode: mode });
						shadowRoot.cloneNode(false);
					},
					'cloneNode(false) on a shadow root in ' + mode + ' mode must throw a NotSupportedError',
				).toThrow(
					expect.objectContaining({
						name: 'NotSupportedError',
						code: 9,
						constructor: DOMException,
					}),
				);

				expect(function () {
					var element = document.createElement('div');
					var shadowRoot = element.attachShadow({ mode: mode });
					shadowRoot.cloneNode(true);
				}, 'cloneNode(true) on a closed shadow root must throw a NotSupportedError').toThrow(
					expect.objectContaining({
						name: 'NotSupportedError',
						code: 9,
						constructor: DOMException,
					}),
				);
			},
			{
				document: {
					contentType: 'text/html',
					content: markup1,
				},
			},
		);
	}
	context.test(
		'cloneNode on an element with an open shadow root should not clone its shadow root',
		({ document }) => {
			var element = document.createElement('div');
			var shadowRoot = element.attachShadow({ mode: 'open' });

			expect(
				(element.cloneNode(false) as Element).shadowRoot,
				'cloneNode(false) on an element with an open shadow root should not clone its shadow root',
			).toBe(null);
			expect(
				(element.cloneNode(true) as Element).shadowRoot,
				'cloneNode(true) on an element with an open shadow root should not clone its shadow root',
			).toBe(null);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup1,
			},
		},
	);
	context.test(
		'cloneNode on an element with a closed shadow root should not clone its shadow root',
		({ document, ShadowRoot }) => {
			var element = document.createElement('div');
			var shadowRoot = element.attachShadow({ mode: 'closed' });

			expect(
				(element.cloneNode(false) as Element).attachShadow({ mode: 'closed' }) instanceof
					ShadowRoot,
				'An element returned by cloneNode(false) on an element with a closed shadow root should allow attachShadow',
			).toBe(true);

			expect(
				(element.cloneNode(true) as Element).attachShadow({ mode: 'closed' }) instanceof ShadowRoot,
				'An element returned by cloneNode(true) on an element with a closed shadow root should allow attachShadow',
			).toBe(true);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup1,
			},
		},
	);
}
