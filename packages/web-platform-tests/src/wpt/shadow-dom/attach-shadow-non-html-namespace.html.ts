import type { CompatibilityContext } from '../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
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
	for (const { uri, label } of [
		{ uri: 'http://www.w3.org/2000/svg', label: 'SVG namespace' },
		{ uri: 'http://www.w3.org/1998/Math/MathML', label: 'MathML namespace' },
		{ uri: 'http://www.w3.org/1999/xlink', label: 'XLink namespace' },
		{ uri: 'http://www.w3.org/XML/1998/namespace', label: 'XML namespace' },
		{ uri: 'http://example.com/custom', label: 'custom namespace' },
		{ uri: '', label: 'empty string namespace' },
		{ uri: null, label: 'null namespace' },
	]) {
		for (const mode of ['open', 'closed'] as const) {
			for (const name of HTML5_SHADOW_ALLOWED_ELEMENTS) {
				context.test(
					`attachShadow({mode: "${mode}"}) should throw on ${label} element with local name '${name}'`,
					({ document, DOMException }) => {
						const el = document.createElementNS(uri, name);
						expect(() => {
							el.attachShadow({ mode });
						}).toThrow(
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
							content:
								'<!DOCTYPE html>\n<title>attachShadow on non-HTML namespace elements with valid local names</title>\n\n\n\n\n',
						},
					},
				);
			}
			context.test(
				`attachShadow({mode: "${mode}"}) should throw on ${label} element with custom element name 'my-element'`,
				({ document, DOMException }) => {
					const el = document.createElementNS(uri, 'my-element');
					expect(() => {
						el.attachShadow({ mode });
					}).toThrow(
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
						content:
							'<!DOCTYPE html>\n<title>attachShadow on non-HTML namespace elements with valid local names</title>\n\n\n\n\n',
					},
				},
			);
		}
	}
	for (const mode of ['open', 'closed'] as const) {
		for (const name of HTML5_SHADOW_ALLOWED_ELEMENTS) {
			context.test(
				`attachShadow({mode: "${mode}"}) should succeed on HTML-namespace '${name}'`,
				({ document, ShadowRoot }) => {
					const el = document.createElementNS('http://www.w3.org/1999/xhtml', name);
					const shadow = el.attachShadow({ mode });
					expect(shadow instanceof ShadowRoot).toBe(true);
				},
				{
					document: {
						contentType: 'text/html',
						content:
							'<!DOCTYPE html>\n<title>attachShadow on non-HTML namespace elements with valid local names</title>\n\n\n\n\n',
					},
				},
			);
		}
		context.test(
			`attachShadow({mode: "${mode}"}) should succeed on HTML-namespace custom element 'my-element'`,
			({ document, ShadowRoot }) => {
				const el = document.createElementNS('http://www.w3.org/1999/xhtml', 'my-element');
				const shadow = el.attachShadow({ mode });
				expect(shadow instanceof ShadowRoot).toBe(true);
			},
			{
				document: {
					contentType: 'text/html',
					content:
						'<!DOCTYPE html>\n<title>attachShadow on non-HTML namespace elements with valid local names</title>\n\n\n\n\n',
				},
			},
		);
	}
}
