import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	{
		const { expect } = context.runner;

		context.test(
			'If the context node is a document, inserting a DocumentFragment that contains a text node or too many elements should throw a HierarchyRequestError.',
			({ document, DOMException }) => {
				let doc = document.implementation.createHTMLDocument('title');
				doc.removeChild(doc.documentElement);

				let df = doc.createDocumentFragment();
				df.appendChild(doc.createElement('a'));
				df.appendChild(doc.createElement('b'));
				expect(function () {
					doc.insertBefore(df, doc.firstChild);
				}).toThrow(
					expect.objectContaining({
						name: 'HierarchyRequestError',
						code: 3,
						constructor: DOMException,
					}),
				);

				df = doc.createDocumentFragment();
				df.appendChild(doc.createTextNode('text'));
				expect(function () {
					doc.insertBefore(df, doc.firstChild);
				}).toThrow(
					expect.objectContaining({
						name: 'HierarchyRequestError',
						code: 3,
						constructor: DOMException,
					}),
				);

				df = doc.createDocumentFragment();
				df.appendChild(doc.createComment('comment'));
				df.appendChild(doc.createTextNode('text'));
				expect(function () {
					doc.insertBefore(df, doc.firstChild);
				}).toThrow(
					expect.objectContaining({
						name: 'HierarchyRequestError',
						code: 3,
						constructor: DOMException,
					}),
				);
			},
		);
		context.test(
			'If the context node is a document, inserting a DocumentFragment with an element if there already is an element child should throw a HierarchyRequestError.',
			({ document, DOMException }) => {
				// The context node has an element child.
				let doc = document.implementation.createHTMLDocument('title');
				let comment = doc.appendChild(doc.createComment('foo'));
				expect(doc.childNodes).toHaveLength(3);
				expect(doc.childNodes[0]).toBe(doc.doctype);
				expect(doc.childNodes[1]).toBe(doc.documentElement);
				expect(doc.childNodes[2]).toBe(comment);

				let df = doc.createDocumentFragment();
				df.appendChild(doc.createElement('a'));
				expect(function () {
					doc.insertBefore(df, doc.doctype);
				}).toThrow(
					expect.objectContaining({
						name: 'HierarchyRequestError',
						code: 3,
						constructor: DOMException,
					}),
				);
				expect(function () {
					doc.insertBefore(df, doc.documentElement);
				}).toThrow(
					expect.objectContaining({
						name: 'HierarchyRequestError',
						code: 3,
						constructor: DOMException,
					}),
				);
				expect(function () {
					doc.insertBefore(df, comment);
				}).toThrow(
					expect.objectContaining({
						name: 'HierarchyRequestError',
						code: 3,
						constructor: DOMException,
					}),
				);
				expect(function () {
					doc.insertBefore(df, null);
				}).toThrow(
					expect.objectContaining({
						name: 'HierarchyRequestError',
						code: 3,
						constructor: DOMException,
					}),
				);
			},
		);
		context.test(
			'If the context node is a document and a doctype is following the reference child, inserting a DocumentFragment with an element should throw a HierarchyRequestError.',
			({ document, DOMException }) => {
				// /child/ is a doctype.
				let doc = document.implementation.createHTMLDocument('title');
				let comment = doc.insertBefore(doc.createComment('foo'), doc.firstChild);
				doc.removeChild(doc.documentElement);
				expect(doc.childNodes).toHaveLength(2);
				expect(doc.childNodes[0]).toBe(comment);
				expect(doc.childNodes[1]).toBe(doc.doctype);

				let df = doc.createDocumentFragment();
				df.appendChild(doc.createElement('a'));
				expect(function () {
					doc.insertBefore(df, doc.doctype);
				}).toThrow(
					expect.objectContaining({
						name: 'HierarchyRequestError',
						code: 3,
						constructor: DOMException,
					}),
				);
			},
		);
		context.test(
			'If the context node is a document, inserting a DocumentFragment with an element before the doctype should throw a HierarchyRequestError.',
			({ document, DOMException }) => {
				// /child/ is not null and a doctype is following /child/.
				let doc = document.implementation.createHTMLDocument('title');
				let comment = doc.insertBefore(doc.createComment('foo'), doc.firstChild);
				doc.removeChild(doc.documentElement);
				expect(doc.childNodes).toHaveLength(2);
				expect(doc.childNodes[0]).toBe(comment);
				expect(doc.childNodes[1]).toBe(doc.doctype);

				let df = doc.createDocumentFragment();
				df.appendChild(doc.createElement('a'));
				expect(function () {
					doc.insertBefore(df, comment);
				}).toThrow(
					expect.objectContaining({
						name: 'HierarchyRequestError',
						code: 3,
						constructor: DOMException,
					}),
				);
			},
		);
		context.test(
			'If the context node is a DocumentFragment, inserting a document or a doctype should throw a HierarchyRequestError.',
			({ document, DOMException }) => {
				let df = document.createDocumentFragment();
				let a = df.appendChild(document.createElement('a'));

				let doc = document.implementation.createHTMLDocument('title');
				expect(function () {
					df.insertBefore(doc, a);
				}).toThrow(
					expect.objectContaining({
						name: 'HierarchyRequestError',
						code: 3,
						constructor: DOMException,
					}),
				);
				expect(function () {
					df.insertBefore(doc, null);
				}).toThrow(
					expect.objectContaining({
						name: 'HierarchyRequestError',
						code: 3,
						constructor: DOMException,
					}),
				);

				let doctype = document.implementation.createDocumentType('html', '', '');
				expect(function () {
					df.insertBefore(doctype, a);
				}).toThrow(
					expect.objectContaining({
						name: 'HierarchyRequestError',
						code: 3,
						constructor: DOMException,
					}),
				);
				expect(function () {
					df.insertBefore(doctype, null);
				}).toThrow(
					expect.objectContaining({
						name: 'HierarchyRequestError',
						code: 3,
						constructor: DOMException,
					}),
				);
			},
		);
	}

	{
		const { expect } = context.runner;

		context.test(
			'Calling insertBefore with an inclusive ancestor of the context object must throw HIERARCHY_REQUEST_ERR.',
			({ document, DOMException }) => {
				// Step 2.
				expect(function () {
					document.body.insertBefore(document.body, document.getElementById('log'));
				}).toThrow(
					expect.objectContaining({
						name: 'HierarchyRequestError',
						code: 3,
						constructor: DOMException,
					}),
				);
				expect(function () {
					document.body.insertBefore(document.documentElement, document.getElementById('log'));
				}).toThrow(
					expect.objectContaining({
						name: 'HierarchyRequestError',
						code: 3,
						constructor: DOMException,
					}),
				);
			},
		);
		context.test(
			'Calling insertBefore with a reference child whose parent is not the context node must throw a NotFoundError.',
			({ document, DOMException }) => {
				let a = document.createElement('div');
				let b = document.createElement('div');
				let c = document.createElement('div');
				expect(function () {
					a.insertBefore(b, c);
				}).toThrow(
					expect.objectContaining({
						name: 'NotFoundError',
						code: 8,
						constructor: DOMException,
					}),
				);
			},
		);
		context.test(
			'If the context node is a document, inserting a document or text node should throw a HierarchyRequestError.',
			({ document, DOMException }) => {
				let doc = document.implementation.createHTMLDocument('title');
				let doc2 = document.implementation.createHTMLDocument('title2');
				expect(function () {
					doc.insertBefore(doc2, doc.documentElement);
				}).toThrow(
					expect.objectContaining({
						name: 'HierarchyRequestError',
						code: 3,
						constructor: DOMException,
					}),
				);

				expect(function () {
					doc.insertBefore(doc.createTextNode('text'), doc.documentElement);
				}).toThrow(
					expect.objectContaining({
						name: 'HierarchyRequestError',
						code: 3,
						constructor: DOMException,
					}),
				);
			},
		);
		context.test(
			'If the context node is a document, inserting an element if there already is an element child should throw a HierarchyRequestError.',
			({ document, DOMException }) => {
				// The context node has an element child.
				let doc = document.implementation.createHTMLDocument('title');
				let comment = doc.appendChild(doc.createComment('foo'));
				expect(doc.childNodes).toHaveLength(3);
				expect(doc.childNodes[0]).toBe(doc.doctype);
				expect(doc.childNodes[1]).toBe(doc.documentElement);
				expect(doc.childNodes[2]).toBe(comment);

				let a = doc.createElement('a');
				expect(function () {
					doc.insertBefore(a, doc.doctype);
				}).toThrow(
					expect.objectContaining({
						name: 'HierarchyRequestError',
						code: 3,
						constructor: DOMException,
					}),
				);
				expect(function () {
					doc.insertBefore(a, doc.documentElement);
				}).toThrow(
					expect.objectContaining({
						name: 'HierarchyRequestError',
						code: 3,
						constructor: DOMException,
					}),
				);
				expect(function () {
					doc.insertBefore(a, comment);
				}).toThrow(
					expect.objectContaining({
						name: 'HierarchyRequestError',
						code: 3,
						constructor: DOMException,
					}),
				);
				expect(function () {
					doc.insertBefore(a, null);
				}).toThrow(
					expect.objectContaining({
						name: 'HierarchyRequestError',
						code: 3,
						constructor: DOMException,
					}),
				);
			},
		);
		context.test(
			'If the context node is a document, inserting an element before the doctype should throw a HierarchyRequestError.',
			({ document, DOMException }) => {
				// /child/ is a doctype.
				let doc = document.implementation.createHTMLDocument('title');
				let comment = doc.insertBefore(doc.createComment('foo'), doc.firstChild);
				doc.removeChild(doc.documentElement);
				expect(doc.childNodes).toHaveLength(2);
				expect(doc.childNodes[0]).toBe(comment);
				expect(doc.childNodes[1]).toBe(doc.doctype);

				let a = doc.createElement('a');
				expect(function () {
					doc.insertBefore(a, doc.doctype);
				}).toThrow(
					expect.objectContaining({
						name: 'HierarchyRequestError',
						code: 3,
						constructor: DOMException,
					}),
				);
			},
		);
		context.test(
			'If the context node is a document and a doctype is following the reference child, inserting an element should throw a HierarchyRequestError.',
			({ document, DOMException }) => {
				// /child/ is not null and a doctype is following /child/.
				let doc = document.implementation.createHTMLDocument('title');
				let comment = doc.insertBefore(doc.createComment('foo'), doc.firstChild);
				doc.removeChild(doc.documentElement);
				expect(doc.childNodes).toHaveLength(2);
				expect(doc.childNodes[0]).toBe(comment);
				expect(doc.childNodes[1]).toBe(doc.doctype);

				let a = doc.createElement('a');
				expect(function () {
					doc.insertBefore(a, comment);
				}).toThrow(
					expect.objectContaining({
						name: 'HierarchyRequestError',
						code: 3,
						constructor: DOMException,
					}),
				);
			},
		);
		context.test(
			'If the context node is a document, inserting a doctype if there already is a doctype child should throw a HierarchyRequestError.',
			({ document, DOMException }) => {
				let doc = document.implementation.createHTMLDocument('title');
				let comment = doc.insertBefore(doc.createComment('foo'), doc.firstChild);
				expect(doc.childNodes).toHaveLength(3);
				expect(doc.childNodes[0]).toBe(comment);
				expect(doc.childNodes[1]).toBe(doc.doctype);
				expect(doc.childNodes[2]).toBe(doc.documentElement);

				let doctype = document.implementation.createDocumentType('html', '', '');
				expect(function () {
					doc.insertBefore(doctype, comment);
				}).toThrow(
					expect.objectContaining({
						name: 'HierarchyRequestError',
						code: 3,
						constructor: DOMException,
					}),
				);
				expect(function () {
					doc.insertBefore(doctype, doc.doctype);
				}).toThrow(
					expect.objectContaining({
						name: 'HierarchyRequestError',
						code: 3,
						constructor: DOMException,
					}),
				);
				expect(function () {
					doc.insertBefore(doctype, doc.documentElement);
				}).toThrow(
					expect.objectContaining({
						name: 'HierarchyRequestError',
						code: 3,
						constructor: DOMException,
					}),
				);
				expect(function () {
					doc.insertBefore(doctype, null);
				}).toThrow(
					expect.objectContaining({
						name: 'HierarchyRequestError',
						code: 3,
						constructor: DOMException,
					}),
				);
			},
		);
		context.test(
			'If the context node is a document, inserting a doctype after the document element should throw a HierarchyRequestError.',
			({ document, DOMException }) => {
				let doc = document.implementation.createHTMLDocument('title');
				let comment = doc.appendChild(doc.createComment('foo'));
				doc.removeChild(doc.doctype!);
				expect(doc.childNodes).toHaveLength(2);
				expect(doc.childNodes[0]).toBe(doc.documentElement);
				expect(doc.childNodes[1]).toBe(comment);

				let doctype = document.implementation.createDocumentType('html', '', '');
				expect(function () {
					doc.insertBefore(doctype, comment);
				}).toThrow(
					expect.objectContaining({
						name: 'HierarchyRequestError',
						code: 3,
						constructor: DOMException,
					}),
				);
			},
		);
		context.test(
			'If the context node is a document with and element child, appending a doctype should throw a HierarchyRequestError.',
			({ document, DOMException }) => {
				let doc = document.implementation.createHTMLDocument('title');
				let comment = doc.appendChild(doc.createComment('foo'));
				doc.removeChild(doc.doctype!);
				expect(doc.childNodes).toHaveLength(2);
				expect(doc.childNodes[0]).toBe(doc.documentElement);
				expect(doc.childNodes[1]).toBe(comment);

				let doctype = document.implementation.createDocumentType('html', '', '');
				expect(function () {
					doc.insertBefore(doctype, null);
				}).toThrow(
					expect.objectContaining({
						name: 'HierarchyRequestError',
						code: 3,
						constructor: DOMException,
					}),
				);
			},
		);
		context.test(
			'If the context node is an element, inserting a document or a doctype should throw a HierarchyRequestError.',
			({ document, DOMException }) => {
				let el = document.createElement('div');
				let a = el.appendChild(document.createElement('a'));

				let doc = document.implementation.createHTMLDocument('title');
				expect(function () {
					el.insertBefore(doc, a);
				}).toThrow(
					expect.objectContaining({
						name: 'HierarchyRequestError',
						code: 3,
						constructor: DOMException,
					}),
				);
				expect(function () {
					el.insertBefore(doc, null);
				}).toThrow(
					expect.objectContaining({
						name: 'HierarchyRequestError',
						code: 3,
						constructor: DOMException,
					}),
				);

				let doctype = document.implementation.createDocumentType('html', '', '');
				expect(function () {
					el.insertBefore(doctype, a);
				}).toThrow(
					expect.objectContaining({
						name: 'HierarchyRequestError',
						code: 3,
						constructor: DOMException,
					}),
				);
				expect(function () {
					el.insertBefore(doctype, null);
				}).toThrow(
					expect.objectContaining({
						name: 'HierarchyRequestError',
						code: 3,
						constructor: DOMException,
					}),
				);
			},
		);
		context.test('Inserting a node before itself should not move the node', ({ document }) => {
			let a = document.createElement('div');
			let b = document.createElement('div');
			let c = document.createElement('div');
			a.appendChild(b);
			a.appendChild(c);
			expect(a.childNodes).toHaveLength(2);
			expect(a.childNodes[0]).toBe(b);
			expect(a.childNodes[1]).toBe(c);
			expect(a.insertBefore(b, b)).toBe(b);
			expect(a.childNodes).toHaveLength(2);
			expect(a.childNodes[0]).toBe(b);
			expect(a.childNodes[1]).toBe(c);
			expect(a.insertBefore(c, c)).toBe(c);
			expect(a.childNodes).toHaveLength(2);
			expect(a.childNodes[0]).toBe(b);
			expect(a.childNodes[1]).toBe(c);
		});
	}
}
