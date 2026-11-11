import type { CompatibilityContext } from '../../../shared/context.ts';

const markup2 = `<!DOCTYPE html>
<title>NoModificationAllowedError when mutating read only properties</title>

<meta name="assert" content="This test verifies that NoModificationAllowedError is thrown when mutating read only properties" />


<body></body>

`;

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'Computed style parent (should be null)',
		({ document, getComputedStyle }) => {
			expect(getComputedStyle(document.body, null).parentRule).toBe(null);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup2,
			},
		},
	);
	context.test(
		'Exception thrown when trying to change a computed style declaration via property',
		({ document, getComputedStyle, window }) => {
			expect(function () {
				getComputedStyle(document.body, null).color = 'blue';
			}).toThrow(
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
				content: markup2,
			},
		},
	);
	context.test(
		'Exception thrown when trying to change a computed style declaration via setProperty',
		({ document, getComputedStyle, DOMException }) => {
			expect(function () {
				getComputedStyle(document.body, null).setProperty('color', 'blue');
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
				content: markup2,
			},
		},
	);
	context.test(
		'Exception thrown when trying to change a computed style alias via property',
		({ document, getComputedStyle, window }) => {
			expect(function () {
				getComputedStyle(document.body, null).webkitTransition = '';
			}).toThrow(
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
				content: markup2,
			},
		},
	);
	context.test(
		'Exception thrown when trying to change a computed style alias via setProperty',
		({ document, getComputedStyle, DOMException }) => {
			expect(function () {
				getComputedStyle(document.body, null).setProperty('webkitTransition', '');
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
				content: markup2,
			},
		},
	);
}
