import type { CompatibilityContext } from '../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	{
		const markup1 = `<!DOCTYPE html>
<html>
<head>
<title>Shadow DOM: Attaching a ShadowRoot</title>
<meta name="author" title="Ryosuke Niwa" href="mailto:rniwa@webkit.org">
<meta name="assert" content="Element.prototype.attachShadow should create an instance of ShadowRoot">




</head>
<body>
<div id="log"></div>

</body>
</html>
`;
		const { expect } = context.runner;
		context.test(
			'Check the existence of Element.attachShadow',
			({ document, Element }) => {
				expect(
					'attachShadow' in Element.prototype,
					'Element.prototype.attachShadow must exist',
				).toBe(true);
				expect(
					typeof document.createElement('div').attachShadow,
					'An instance of div must have attachShadow which is a function',
				).toBe('function');
			},
			{
				document: {
					contentType: 'text/html',
					content: markup1,
				},
			},
		);
		context.test(
			'Nodes other than Element should not have attachShadow',
			({ document, Node, CharacterData, Comment, Document, DocumentFragment, Text, DOMParser }) => {
				expect('attachShadow' in Node.prototype, 'Node.prototype.attachShadow must not exist').toBe(
					false,
				);
				expect(
					'attachShadow' in CharacterData.prototype,
					'CharacterData.prototype.attachShadow must not exist',
				).toBe(false);
				expect(
					'attachShadow' in Comment.prototype,
					'Comment.prototype.attachShadow must not exist',
				).toBe(false);
				expect(
					typeof (document.createComment('') as Comment & { attachShadow?: unknown }).attachShadow,
					'An instance of comment must not have attachShadow',
				).toBe('undefined');
				expect(
					'attachShadow' in Document.prototype,
					'Document.prototype.attachShadow must not exist',
				).toBe(false);
				expect(
					typeof (document as Document & { attachShadow?: unknown }).attachShadow,
					'An instance of document must not have attachShadow which is a function',
				).toBe('undefined');
				expect(
					'attachShadow' in DocumentFragment.prototype,
					'DocumentFragment.prototype.attachShadow must not exist',
				).toBe(false);
				expect(
					typeof (
						new DOMParser().parseFromString('', 'text/html') as Document & {
							attachShadow?: unknown;
						}
					).attachShadow,
					'An instance of document must not have attachShadow which is a function',
				).toBe('undefined');
				expect('attachShadow' in Text.prototype, 'Text.prototype.attachShadow must not exist').toBe(
					false,
				);
				expect(
					typeof (document.createTextNode('') as Text & { attachShadow?: unknown }).attachShadow,
					'An instance of text node must not have attachShadow',
				).toBe('undefined');
			},
			{
				document: {
					contentType: 'text/html',
					content: markup1,
				},
			},
		);
		context.test(
			'Element.attachShadow must throw a TypeError if mode is not "open" or "closed"',
			({ document, TypeError }) => {
				expect(function () {
					document.createElement('div').attachShadow({} as ShadowRootInit);
				}, 'attachShadow must throw a TypeError when mode is omitted').toThrow(
					expect.objectContaining({ constructor: TypeError }),
				);

				expect(function () {
					document.createElement('div').attachShadow({ mode: true as unknown as ShadowRootMode });
				}, 'attachShadow must throw a TypeError when mode is a boolean').toThrow(
					expect.objectContaining({ constructor: TypeError }),
				);

				expect(function () {
					document.createElement('div').attachShadow({ mode: 1 as unknown as ShadowRootMode });
				}, 'attachShadow must throw a TypeError when mode is 1').toThrow(
					expect.objectContaining({ constructor: TypeError }),
				);
			},
			{
				document: {
					contentType: 'text/html',
					content: markup1,
				},
			},
		);
		context.test(
			'Element.attachShadow must create an instance of ShadowRoot',
			({ document, ShadowRoot }) => {
				expect(
					document.createElement('div').attachShadow({ mode: 'open' }) instanceof ShadowRoot,
					'attachShadow({mode: "open"}) should create an instance of ShadowRoot',
				).toBe(true);
				expect(
					document.createElement('div').attachShadow({ mode: 'closed' }) instanceof ShadowRoot,
					'attachShadow({mode: "closed"}) should create an instance of ShadowRoot',
				).toBe(true);
			},
			{
				document: {
					contentType: 'text/html',
					content: markup1,
				},
			},
		);
		context.test(
			'Element.attachShadow must throw a NotSupportedError if the context object already hosts a shadow tree',
			({ document, DOMException }) => {
				expect(function () {
					var div = document.createElement('div');
					div.attachShadow({ mode: 'open' });
					div.attachShadow({ mode: 'open' });
				}, 'Calling attachShadow({mode: "open"}) twice on the same element must throw').toThrow(
					expect.objectContaining({
						name: 'NotSupportedError',
						code: 9,
						constructor: DOMException,
					}),
				);

				expect(function () {
					var div = document.createElement('div');
					div.attachShadow({ mode: 'closed' });
					div.attachShadow({ mode: 'closed' });
				}, 'Calling attachShadow({mode: "closed"}) twice on the same element must throw').toThrow(
					expect.objectContaining({
						name: 'NotSupportedError',
						code: 9,
						constructor: DOMException,
					}),
				);

				expect(function () {
					var div = document.createElement('div');
					div.attachShadow({ mode: 'open' });
					div.attachShadow({ mode: 'closed' });
				}, 'Calling attachShadow({mode: "closed"}) after attachShadow({mode: "open"}) on the same element must throw').toThrow(
					expect.objectContaining({
						name: 'NotSupportedError',
						code: 9,
						constructor: DOMException,
					}),
				);

				expect(function () {
					var div = document.createElement('div');
					div.attachShadow({ mode: 'closed' });
					div.attachShadow({ mode: 'open' });
				}, 'Calling attachShadow({mode: "open"}) after attachShadow({mode: "closed"}) on the same element must throw').toThrow(
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
	{
		const { expect } = context.runner;
		const HTML5_ELEMENTS = [
			'a',
			'abbr',
			'address',
			'area',
			'article',
			'aside',
			'audio',
			'b',
			'base',
			'bdi',
			'bdo',
			'blockquote',
			'body',
			'br',
			'button',
			'canvas',
			'caption',
			'cite',
			'code',
			'col',
			'colgroup',
			'data',
			'datalist',
			'dd',
			'del',
			'details',
			'dfn',
			'dialog',
			'div',
			'dl',
			'dt',
			'em',
			'embed',
			'fieldset',
			'figcaption',
			'figure',
			'footer',
			'form',
			'h1',
			'h2',
			'h3',
			'h4',
			'h5',
			'h6',
			'head',
			'header',
			'hr',
			'html',
			'i',
			'iframe',
			'img',
			'input',
			'ins',
			'kbd',
			'label',
			'legend',
			'li',
			'link',
			'main',
			'map',
			'mark',
			'menu',
			'meta',
			'meter',
			'nav',
			'noscript',
			'object',
			'ol',
			'optgroup',
			'option',
			'output',
			'p',
			'param',
			'pre',
			'progress',
			'q',
			'rp',
			'rt',
			'ruby',
			's',
			'samp',
			'script',
			'search',
			'section',
			'select',
			'slot',
			'small',
			'source',
			'span',
			'strong',
			'style',
			'sub',
			'sup',
			'summary',
			'table',
			'tbody',
			'td',
			'template',
			'textarea',
			'tfoot',
			'th',
			'thead',
			'time',
			'title',
			'tr',
			'track',
			'u',
			'ul',
			'var',
			'video',
			'wbr',
		];
		const HTML5_SHADOW_ALLOWED_ELEMENTS = [
			'article',
			'aside',
			'blockquote',
			'body',
			'div',
			'footer',
			'h1',
			'h2',
			'h3',
			'h4',
			'h5',
			'h6',
			'header',
			'main',
			'nav',
			'p',
			'section',
			'span',
		];
		const HTML5_SHADOW_DISALLOWED_ELEMENTS = HTML5_ELEMENTS.filter(
			(el) => !HTML5_SHADOW_ALLOWED_ELEMENTS.includes(el),
		);
		context.test(
			'Element.attachShadow must throw a NotSupportedError for non-safelisted elements',
			({ document, DOMException }) => {
				for (var elementName of HTML5_SHADOW_DISALLOWED_ELEMENTS) {
					expect(
						function () {
							document.createElement(elementName).attachShadow({ mode: 'open' });
						},
						'Calling attachShadow({mode: "open"}) on ' + elementName + ' element must throw',
					).toThrow(
						expect.objectContaining({
							name: 'NotSupportedError',
							code: 9,
							constructor: DOMException,
						}),
					);

					expect(
						function () {
							document.createElement(elementName).attachShadow({ mode: 'closed' });
						},
						'Calling attachShadow({mode: "closed"}) on ' + elementName + ' element must throw',
					).toThrow(
						expect.objectContaining({
							name: 'NotSupportedError',
							code: 9,
							constructor: DOMException,
						}),
					);
				}
			},
			{
				document: {
					contentType: 'text/html',
					content: `<!DOCTYPE html>
<html>
<head>
<title>Shadow DOM: Attaching a ShadowRoot</title>
<meta name="author" title="Ryosuke Niwa" href="mailto:rniwa@webkit.org">
<meta name="assert" content="Element.prototype.attachShadow should create an instance of ShadowRoot">




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
