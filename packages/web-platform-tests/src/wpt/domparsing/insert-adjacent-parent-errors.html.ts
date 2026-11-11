import type { CompatibilityContext } from '../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const markup1 = `<!DOCTYPE html>
<meta charset="utf-8">
<title>element.insertAdjacentHTML error cases</title>
<link rel="help" href="https://w3c.github.io/DOM-Parsing/#widl-Element-insertAdjacentHTML-void-DOMString-position-DOMString-text">



<div id="element"></div>


`;

	const { expect } = context.runner;

	context.test(
		'Throws when given an invalid position',
		({ document, DOMException }) => {
			const el = document.querySelector('#element')!;

			expect(() => {
				el.insertAdjacentHTML('invalid' as InsertPosition, 'test');
			}).toThrow(
				expect.objectContaining({
					name: 'SyntaxError',
					code: 12,
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
	context.test(
		'Throws when inserting using "beforebegin" into an element whose parent is null',
		({ document, DOMException }) => {
			const el = document.createElement('span');

			expect(() => {
				el.insertAdjacentHTML('beforebegin', 'test');
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
				content: markup1,
			},
		},
	);
	context.test(
		'Throws when inserting using "afterend" into an element whose parent is null',
		({ document, DOMException }) => {
			const el = document.createElement('span');

			expect(() => {
				el.insertAdjacentHTML('afterend', 'test');
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
				content: markup1,
			},
		},
	);
	context.test(
		'Does not throw when inserting using "afterbegin" and "beforeend" into an element whose parent is null',
		({ document }) => {
			const el = document.createElement('span');

			el.insertAdjacentHTML('afterbegin', 'foo');
			el.insertAdjacentHTML('beforeend', 'bar');

			expect(el.textContent).toBe('foobar');
		},
		{
			document: {
				contentType: 'text/html',
				content: markup1,
			},
		},
	);
	context.test(
		'Throws when inserting using "beforebegin" into an element whose parent is a document',
		({ document, DOMException }) => {
			const el = document.querySelector('html')!;

			expect(() => {
				el.insertAdjacentHTML('beforebegin', 'test');
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
				content: markup1,
			},
		},
	);
	context.test(
		'Throws when inserting using "afterend" into an element whose parent is a document',
		({ document, DOMException }) => {
			const el = document.querySelector('html')!;

			expect(() => {
				el.insertAdjacentHTML('afterend', 'test');
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
				content: markup1,
			},
		},
	);
	context.test(
		'Does not throw when inserting using "afterbegin" and "beforeend" into an element whose parent is a document',
		({ document }) => {
			const el = document.querySelector('html')!;

			el.insertAdjacentHTML('afterbegin', 'foo');
			el.insertAdjacentHTML('beforeend', 'bar');

			expect(el.textContent!.startsWith('foo')).toBe(true);
			expect(el.textContent!.endsWith('bar')).toBe(true);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup1,
			},
		},
	);
}
