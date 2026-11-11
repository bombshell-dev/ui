import type { CompatibilityContext } from '../../shared/context.ts';

const markup2 = `<!DOCTYPE html>
<html>
<head>
<title>Shadow DOM: Element interface shadowRoot attribute</title>
<meta name="author" title="Ryosuke Niwa" href="mailto:rniwa@webkit.org">
<meta name="assert" content="shadowRoot attribute on Element interface must return the associated open shadow tree if there is one">



</head>
<body>
<div id="log"></div>

</body>
</html>
`;

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'shadowRoot must be defined on Element prototype',
		({ document, Element, Node, Comment, Document, DocumentFragment, Text, DOMParser }) => {
			expect(
				'shadowRoot' in Element.prototype,
				'shadowRoot must be defined on Element prototype',
			).toBe(true);
			expect(
				'shadowRoot' in document.createElement('div'),
				'shadowRoot must be defined on an instance of div element',
			).toBe(true);
			expect(
				'shadowRoot' in Node.prototype,
				'shadowRoot must not be defined on Node prototype',
			).toBe(false);
			expect(
				'shadowRoot' in Text.prototype,
				'shadowRoot must not be defined on Text prototype',
			).toBe(false);
			expect(
				'shadowRoot' in document.createTextNode(''),
				'shadowRoot must not be defined on an instance of Text node',
			).toBe(false);
			expect(
				'shadowRoot' in Comment.prototype,
				'shadowRoot must not be defined on Comment prototype',
			).toBe(false);
			expect(
				'shadowRoot' in document.createComment(''),
				'shadowRoot must not be defined on an instance of Comment node',
			).toBe(false);
			expect(
				'shadowRoot' in Document.prototype,
				'shadowRoot must not be defined on Document prototype',
			).toBe(false);
			expect(
				'shadowRoot' in document,
				'shadowRoot must not be defined on an instance of Document',
			).toBe(false);
			expect(
				'shadowRoot' in DocumentFragment.prototype,
				'shadowRoot must not be defined on DocumentFragment prototype',
			).toBe(false);
			expect(
				'shadowRoot' in new DOMParser().parseFromString('', 'text/html'),
				'shadowRoot must not be defined on an instance of DocumentFragment node',
			).toBe(false);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup2,
			},
		},
	);
	context.test(
		'shadowRoot attribute must return the open shadow root associated with the element',
		({ document }) => {
			var host = document.createElement('div');
			expect(
				host.shadowRoot,
				'shadowRoot must return null when the host does not have a shadow tree attached to it',
			).toBe(null);

			var openShadowRoot = host.attachShadow({ mode: 'open' });
			expect(
				host.shadowRoot,
				'shadowRoot must return the open shadow root attachShadow attached',
			).toBe(openShadowRoot);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup2,
			},
		},
	);
	context.test(
		'shadowRoot attribute must return null if the shadow root attached to the element is closed',
		({ document }) => {
			var host = document.createElement('div');
			host.attachShadow({ mode: 'closed' });
			expect(host.shadowRoot).toBe(null);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup2,
			},
		},
	);
}
