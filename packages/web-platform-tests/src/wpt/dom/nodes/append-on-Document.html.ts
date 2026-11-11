import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test(
		'Document.append() without any argument, on a Document having no child.',
		({ document }) => {
			const node = document.implementation.createDocument(null, null as unknown as string);
			const parent = node.cloneNode() as Document;
			parent.append();
			expect(parent.childNodes).toHaveLength(0);
		},
	);
	context.test(
		'Document.append() with only one element as an argument, on a Document having no child.',
		({ document }) => {
			const node = document.implementation.createDocument(null, null as unknown as string);
			const parent = node.cloneNode() as Document;
			const x = document.createElement('x');
			parent.append(x);
			expect(parent.childNodes).toHaveLength(1);
			expect(parent.childNodes[0]).toBe(x);
		},
	);
	context.test(
		'Document.append() with only one element as an argument, on a Document having one child.',
		({ document, DOMException }) => {
			const node = document.implementation.createDocument(null, null as unknown as string);
			const parent = node.cloneNode() as Document;
			const x = document.createElement('x');
			const y = document.createElement('y');
			parent.appendChild(x);
			expect(function () {
				parent.append(y);
			}).toThrow(
				expect.objectContaining({
					name: 'HierarchyRequestError',
					code: 3,
					constructor: DOMException,
				}),
			);
			expect(parent.childNodes).toHaveLength(1);
			expect(parent.childNodes[0]).toBe(x);
		},
	);
	context.test(
		'Document.append() with text as an argument, on a Document having no child.',
		({ document, DOMException }) => {
			const node = document.implementation.createDocument(null, null as unknown as string);
			const parent = node.cloneNode() as Document;
			expect(function () {
				parent.append('text');
			}).toThrow(
				expect.objectContaining({
					name: 'HierarchyRequestError',
					code: 3,
					constructor: DOMException,
				}),
			);
			expect(parent.childNodes).toHaveLength(0);
		},
	);
	context.test(
		'Document.append() with two elements as the argument, on a Document having no child.',
		({ document, DOMException }) => {
			const node = document.implementation.createDocument(null, null as unknown as string);
			const parent = node.cloneNode() as Document;
			const x = document.createElement('x');
			const y = document.createElement('y');
			expect(function () {
				parent.append(x, y);
			}).toThrow(
				expect.objectContaining({
					name: 'HierarchyRequestError',
					code: 3,
					constructor: DOMException,
				}),
			);
			expect(parent.childNodes).toHaveLength(0);
		},
	);
}
