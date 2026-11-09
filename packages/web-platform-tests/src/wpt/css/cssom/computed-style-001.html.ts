import type { CompatibilityContext } from '../../../shared/context.ts';

const markup1 = `<!DOCTYPE html>
<html>
 <head>
  <title>CSS Test: getComputedStyle</title>
\x20\x20
\x20\x20
\x20\x20
\x20\x20
  <meta name="flags" content="dom">
  <meta name="assert" content="getComputedStyle returns a readonly CSSStyleDeclaration with resolved values">
\x20\x20
\x20\x20
  <style>
    #outside {
        width: 200px;
        height: 200px;
    }
    #outside div {
        font-size: 100px;
    }
    #inside {
        width: 50%;
        height: 100px;
    }
  </style>
 </head>
 <body>
 <noscript>Test not run - javascript required.</noscript>
 <div id="log"></div>
 <div id="outside"><div id="inside"></div></div>
\x20
 </body>
</html>
`;

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'read_only',
		({ document, getComputedStyle, DOMException, window }) => {
			const inner = document.getElementById('inside')!;
			let innerStyle = getComputedStyle(inner);

			innerStyle = getComputedStyle(inner);
			expect(function () {
				innerStyle.cssText = 'color: blue;';
			}, 'do not allow setting cssText on a readonly CSSStyleDeclaration').toThrow(
				expect.objectContaining({
					name: 'NoModificationAllowedError',
					code: 7,
					constructor: DOMException,
				}),
			);
			expect(function () {
				innerStyle.setProperty('color', 'blue');
			}, 'do not allow calling setProperty on a readonly CSSStyleDeclaration').toThrow(
				expect.objectContaining({
					name: 'NoModificationAllowedError',
					code: 7,
					constructor: DOMException,
				}),
			);
			expect(function () {
				innerStyle.color = 'blue';
			}, 'do not allow setting a property on a readonly CSSStyleDeclaration').toThrow(
				expect.objectContaining({
					name: 'NoModificationAllowedError',
					code: 7,
					constructor: window.DOMException,
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
	context.test(
		'inherited_property_values',
		({ document, getComputedStyle }) => {
			const inner = document.getElementById('inside')!;
			let innerStyle = getComputedStyle(inner);

			expect(innerStyle.getPropertyValue('font-size')).toBe('100px');
		},
		{
			document: {
				contentType: 'text/html',
				content: markup1,
			},
		},
	);

	context.test(
		'property_values',
		({ document, getComputedStyle }) => {
			const inner = document.getElementById('inside')!;
			const innerStyle = getComputedStyle(inner);
			expect(innerStyle.getPropertyValue('height')).toBe('100px');
		},
		{ document: { contentType: 'text/html', content: markup1 } },
	);
	context.test(
		'relative_property_values',
		({ document, getComputedStyle }) => {
			const inner = document.getElementById('inside')!;
			const innerStyle = getComputedStyle(inner);
			expect(innerStyle.getPropertyValue('width')).toBe('100px');
		},
		{ document: { contentType: 'text/html', content: markup1 } },
	);
}
