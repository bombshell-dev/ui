import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test(
		'Passing null to replaceChild should throw a TypeError.',
		({ document, TypeError }) => {
			let a = document.createElement('div');
			expect(function () {
				a.replaceChild(null as unknown as Node, null as unknown as Node);
			}).toThrow(expect.objectContaining({ constructor: TypeError }));

			let b = document.createElement('div');
			expect(function () {
				a.replaceChild(b, null as unknown as Node);
			}).toThrow(expect.objectContaining({ constructor: TypeError }));
			expect(function () {
				a.replaceChild(null as unknown as Node, b);
			}).toThrow(expect.objectContaining({ constructor: TypeError }));
		},
	);
	context.test(
		"If child's parent is not the context node, a NotFoundError exception should be thrown",
		({ document, DOMException }) => {
			let a = document.createElement('div');
			let b = document.createElement('div');
			let c = document.createElement('div');
			expect(function () {
				a.replaceChild(b, c);
			}).toThrow(
				expect.objectContaining({
					name: 'NotFoundError',
					code: 8,
					constructor: DOMException,
				}),
			);

			let d = document.createElement('div');
			d.appendChild(b);
			expect(function () {
				a.replaceChild(b, c);
			}).toThrow(
				expect.objectContaining({
					name: 'NotFoundError',
					code: 8,
					constructor: DOMException,
				}),
			);
			expect(function () {
				a.replaceChild(b, a);
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
		'If node is an inclusive ancestor of the context node, a HierarchyRequestError should be thrown.',
		({ document, DOMException }) => {
			let a = document.createElement('div');
			let b = document.createElement('div');

			expect(function () {
				a.replaceChild(a, a);
			}).toThrow(
				expect.objectContaining({
					name: 'HierarchyRequestError',
					code: 3,
					constructor: DOMException,
				}),
			);

			a.appendChild(b);
			expect(function () {
				a.replaceChild(a, b);
			}).toThrow(
				expect.objectContaining({
					name: 'HierarchyRequestError',
					code: 3,
					constructor: DOMException,
				}),
			);

			let c = document.createElement('div');
			c.appendChild(a);
			expect(function () {
				a.replaceChild(c, b);
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
		'If the context node is a document, inserting a document or text node should throw a HierarchyRequestError.',
		({ document, DOMException }) => {
			let doc = document.implementation.createHTMLDocument('title');
			let doc2 = document.implementation.createHTMLDocument('title2');
			expect(function () {
				doc.replaceChild(doc2, doc.documentElement);
			}).toThrow(
				expect.objectContaining({
					name: 'HierarchyRequestError',
					code: 3,
					constructor: DOMException,
				}),
			);

			expect(function () {
				doc.replaceChild(doc.createTextNode('text'), doc.documentElement);
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
		'If the context node is a document, inserting a DocumentFragment that contains a text node or too many elements should throw a HierarchyRequestError.',
		({ document, DOMException }) => {
			let doc = document.implementation.createHTMLDocument('title');

			let df = doc.createDocumentFragment();
			df.appendChild(doc.createElement('a'));
			df.appendChild(doc.createElement('b'));
			expect(function () {
				doc.replaceChild(df, doc.documentElement);
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
				doc.replaceChild(df, doc.documentElement);
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
				doc.replaceChild(df, doc.documentElement);
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
		'If the context node is a document (without element children), inserting a DocumentFragment that contains multiple elements should throw a HierarchyRequestError.',
		({ document, DOMException }) => {
			let doc = document.implementation.createHTMLDocument('title');
			doc.removeChild(doc.documentElement);

			let df = doc.createDocumentFragment();
			df.appendChild(doc.createElement('a'));
			df.appendChild(doc.createElement('b'));
			expect(function () {
				doc.replaceChild(df, doc.doctype!);
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
			// The context node has an element child that is not /child/.
			let doc = document.implementation.createHTMLDocument('title');
			let comment = doc.appendChild(doc.createComment('foo'));
			expect(doc.childNodes).toHaveLength(3);
			expect(doc.childNodes[0]).toBe(doc.doctype!);
			expect(doc.childNodes[1]).toBe(doc.documentElement);
			expect(doc.childNodes[2]).toBe(comment);

			let df = doc.createDocumentFragment();
			df.appendChild(doc.createElement('a'));
			expect(function () {
				doc.replaceChild(df, comment);
			}).toThrow(
				expect.objectContaining({
					name: 'HierarchyRequestError',
					code: 3,
					constructor: DOMException,
				}),
			);
			expect(function () {
				doc.replaceChild(df, doc.doctype!);
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
			// A doctype is following /child/.
			let doc = document.implementation.createHTMLDocument('title');
			let comment = doc.insertBefore(doc.createComment('foo'), doc.firstChild);
			doc.removeChild(doc.documentElement);
			expect(doc.childNodes).toHaveLength(2);
			expect(doc.childNodes[0]).toBe(comment);
			expect(doc.childNodes[1]).toBe(doc.doctype!);

			let df = doc.createDocumentFragment();
			df.appendChild(doc.createElement('a'));
			expect(function () {
				doc.replaceChild(df, comment);
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
			let doc = document.implementation.createHTMLDocument('title');
			let comment = doc.appendChild(doc.createComment('foo'));
			expect(doc.childNodes).toHaveLength(3);
			expect(doc.childNodes[0]).toBe(doc.doctype!);
			expect(doc.childNodes[1]).toBe(doc.documentElement);
			expect(doc.childNodes[2]).toBe(comment);

			let a = doc.createElement('a');
			expect(function () {
				doc.replaceChild(a, comment);
			}).toThrow(
				expect.objectContaining({
					name: 'HierarchyRequestError',
					code: 3,
					constructor: DOMException,
				}),
			);
			expect(function () {
				doc.replaceChild(a, doc.doctype!);
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
			let doc = document.implementation.createHTMLDocument('title');
			let comment = doc.insertBefore(doc.createComment('foo'), doc.firstChild);
			doc.removeChild(doc.documentElement);
			expect(doc.childNodes).toHaveLength(2);
			expect(doc.childNodes[0]).toBe(comment);
			expect(doc.childNodes[1]).toBe(doc.doctype!);

			let a = doc.createElement('a');
			expect(function () {
				doc.replaceChild(a, comment);
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
			expect(doc.childNodes[1]).toBe(doc.doctype!);
			expect(doc.childNodes[2]).toBe(doc.documentElement);

			let doctype = document.implementation.createDocumentType('html', '', '');
			expect(function () {
				doc.replaceChild(doctype, comment);
			}).toThrow(
				expect.objectContaining({
					name: 'HierarchyRequestError',
					code: 3,
					constructor: DOMException,
				}),
			);
			expect(function () {
				doc.replaceChild(doctype, doc.documentElement);
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
				doc.replaceChild(doctype, comment);
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
				df.replaceChild(doc, a);
			}).toThrow(
				expect.objectContaining({
					name: 'HierarchyRequestError',
					code: 3,
					constructor: DOMException,
				}),
			);

			let doctype = document.implementation.createDocumentType('html', '', '');
			expect(function () {
				df.replaceChild(doctype, a);
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
				el.replaceChild(doc, a);
			}).toThrow(
				expect.objectContaining({
					name: 'HierarchyRequestError',
					code: 3,
					constructor: DOMException,
				}),
			);

			let doctype = document.implementation.createDocumentType('html', '', '');
			expect(function () {
				el.replaceChild(doctype, a);
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
		'Replacing a node with its next sibling should work (2 children)',
		({ document }) => {
			let a = document.createElement('div');
			let b = document.createElement('div');
			let c = document.createElement('div');
			a.appendChild(b);
			a.appendChild(c);
			expect(a.childNodes).toHaveLength(2);
			expect(a.childNodes[0]).toBe(b);
			expect(a.childNodes[1]).toBe(c);
			expect(a.replaceChild(c, b)).toBe(b);
			expect(a.childNodes).toHaveLength(1);
			expect(a.childNodes[0]).toBe(c);
		},
	);
	context.test(
		'Replacing a node with its next sibling should work (4 children)',
		({ document }) => {
			let a = document.createElement('div');
			let b = document.createElement('div');
			let c = document.createElement('div');
			let d = document.createElement('div');
			let e = document.createElement('div');
			a.appendChild(b);
			a.appendChild(c);
			a.appendChild(d);
			a.appendChild(e);
			expect(a.childNodes).toHaveLength(4);
			expect(a.childNodes[0]).toBe(b);
			expect(a.childNodes[1]).toBe(c);
			expect(a.childNodes[2]).toBe(d);
			expect(a.childNodes[3]).toBe(e);
			expect(a.replaceChild(d, c)).toBe(c);
			expect(a.childNodes).toHaveLength(3);
			expect(a.childNodes[0]).toBe(b);
			expect(a.childNodes[1]).toBe(d);
			expect(a.childNodes[2]).toBe(e);
		},
	);
	context.test('Replacing a node with itself should not move the node', ({ document }) => {
		let a = document.createElement('div');
		let b = document.createElement('div');
		let c = document.createElement('div');
		a.appendChild(b);
		a.appendChild(c);
		expect(a.childNodes).toHaveLength(2);
		expect(a.childNodes[0]).toBe(b);
		expect(a.childNodes[1]).toBe(c);
		expect(a.replaceChild(b, b)).toBe(b);
		expect(a.childNodes).toHaveLength(2);
		expect(a.childNodes[0]).toBe(b);
		expect(a.childNodes[1]).toBe(c);
		expect(a.replaceChild(c, c)).toBe(c);
		expect(a.childNodes).toHaveLength(2);
		expect(a.childNodes[0]).toBe(b);
		expect(a.childNodes[1]).toBe(c);
	});
	context.test(
		'If the context node is a document, inserting a new doctype should work.',
		({ document }) => {
			let doc = document.implementation.createHTMLDocument('title');
			let doctype = doc.doctype!;
			expect(doc.childNodes).toHaveLength(2);
			expect(doc.childNodes[0]).toBe(doctype);
			expect(doc.childNodes[1]).toBe(doc.documentElement);

			let doc2 = document.implementation.createHTMLDocument('title2');
			let doctype2 = doc2.doctype!;
			expect(doc2.childNodes).toHaveLength(2);
			expect(doc2.childNodes[0]).toBe(doctype2);
			expect(doc2.childNodes[1]).toBe(doc2.documentElement);

			doc.replaceChild(doc2.doctype!, doc.doctype!);
			expect(doc.childNodes).toHaveLength(2);
			expect(doc.childNodes[0]).toBe(doctype2);
			expect(doc.childNodes[1]).toBe(doc.documentElement);
			expect(doc2.childNodes).toHaveLength(1);
			expect(doc2.childNodes[0]).toBe(doc2.documentElement);
			expect(doctype.parentNode).toBe(null);
			expect(doctype.ownerDocument).toBe(doc);
			expect(doctype2.parentNode).toBe(doc);
			expect(doctype2.ownerDocument).toBe(doc);
		},
	);
	context.test(
		'Replacing the document element with a DocumentFragment containing a single element should work.',
		({ document }) => {
			let doc = document.implementation.createHTMLDocument('title');
			let df = doc.createDocumentFragment();
			let a = df.appendChild(doc.createElement('a'));
			expect(doc.documentElement).toBe(doc.replaceChild(df, doc.documentElement));
			expect(doc.childNodes).toHaveLength(2);
			expect(doc.childNodes[0]).toBe(doc.doctype!);
			expect(doc.childNodes[1]).toBe(a);
		},
	);
	context.test(
		'Replacing the document element with a DocumentFragment containing a single element and comments should work.',
		({ document }) => {
			let doc = document.implementation.createHTMLDocument('title');
			let df = doc.createDocumentFragment();
			let a = df.appendChild(doc.createComment('a'));
			let b = df.appendChild(doc.createElement('b'));
			let c = df.appendChild(doc.createComment('c'));
			expect(doc.documentElement).toBe(doc.replaceChild(df, doc.documentElement));
			expect(doc.childNodes).toHaveLength(4);
			expect(doc.childNodes[0]).toBe(doc.doctype!);
			expect(doc.childNodes[1]).toBe(a);
			expect(doc.childNodes[2]).toBe(b);
			expect(doc.childNodes[3]).toBe(c);
		},
	);
	context.test(
		'Replacing the document element with a single element should work.',
		({ document }) => {
			let doc = document.implementation.createHTMLDocument('title');
			let a = doc.createElement('a');
			expect(doc.documentElement).toBe(doc.replaceChild(a, doc.documentElement));
			expect(doc.childNodes).toHaveLength(2);
			expect(doc.childNodes[0]).toBe(doc.doctype!);
			expect(doc.childNodes[1]).toBe(a);
		},
	);
	context.test(
		'Replacing an element with a DocumentFragment should allow a child of the DocumentFragment to be found by Id.',
		({ document }) => {
			let TEST_ID = 'findme';
			let gBody = document.getElementsByTagName('body')[0]!;
			let parent = document.createElement('div');
			gBody.appendChild(parent);
			let child = document.createElement('div');
			parent.appendChild(child);
			let df = document.createDocumentFragment();
			let fragChild = df.appendChild(document.createElement('div'));
			fragChild.setAttribute('id', TEST_ID);
			parent.replaceChild(df, child);
			expect(document.getElementById(TEST_ID), 'should not be null').toBe(fragChild);
		},
	);
}
