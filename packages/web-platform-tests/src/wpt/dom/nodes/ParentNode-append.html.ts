import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	for (const nodeName of ['Element', 'DocumentFragment'] as const) {
		context.test(
			nodeName + '.append() without any argument, on a parent having no child.',
			({ document }) => {
				const node =
					nodeName === 'Element'
						? document.createElement('div')
						: document.createDocumentFragment();
				const parent = node.cloneNode() as Element | DocumentFragment;
				parent.append();
				expect(parent.childNodes).toHaveLength(0);
			},
		);
		context.test(
			nodeName + '.append() with null as an argument, on a parent having no child.',
			({ document }) => {
				const node =
					nodeName === 'Element'
						? document.createElement('div')
						: document.createDocumentFragment();
				const parent = node.cloneNode() as Element | DocumentFragment;
				parent.append(null as unknown as string);
				expect(parent.childNodes[0]!.textContent).toBe('null');
			},
		);
		context.test(
			nodeName + '.append() with undefined as an argument, on a parent having no child.',
			({ document }) => {
				const node =
					nodeName === 'Element'
						? document.createElement('div')
						: document.createDocumentFragment();
				const parent = node.cloneNode() as Element | DocumentFragment;
				parent.append(undefined as unknown as string);
				expect(parent.childNodes[0]!.textContent).toBe('undefined');
			},
		);
		context.test(
			nodeName + '.append() with only text as an argument, on a parent having no child.',
			({ document }) => {
				const node =
					nodeName === 'Element'
						? document.createElement('div')
						: document.createDocumentFragment();
				const parent = node.cloneNode() as Element | DocumentFragment;
				parent.append('text');
				expect(parent.childNodes[0]!.textContent).toBe('text');
			},
		);
		context.test(
			nodeName + '.append() with only one element as an argument, on a parent having no child.',
			({ document }) => {
				const node =
					nodeName === 'Element'
						? document.createElement('div')
						: document.createDocumentFragment();
				const parent = node.cloneNode() as Element | DocumentFragment;
				const x = document.createElement('x');
				parent.append(x);
				expect(parent.childNodes).toHaveLength(1);
				expect(parent.childNodes[0]).toBe(x);
			},
		);
		context.test(
			nodeName + '.append() with null as an argument, on a parent having a child.',
			({ document }) => {
				const node =
					nodeName === 'Element'
						? document.createElement('div')
						: document.createDocumentFragment();
				const parent = node.cloneNode() as Element | DocumentFragment;
				const child = document.createElement('test');
				parent.appendChild(child);
				parent.append(null as unknown as string);
				expect(parent.childNodes[0]!).toBe(child);
				expect(parent.childNodes[1]!.textContent).toBe('null');
			},
		);
		context.test(
			nodeName + '.append() with one element and text as argument, on a parent having a child.',
			({ document }) => {
				const node =
					nodeName === 'Element'
						? document.createElement('div')
						: document.createDocumentFragment();
				const parent = node.cloneNode() as Element | DocumentFragment;
				const x = document.createElement('x');
				const child = document.createElement('test');
				parent.appendChild(child);
				parent.append(x, 'text');
				expect(parent.childNodes[0]!).toBe(child);
				expect(parent.childNodes[1]!).toBe(x);
				expect(parent.childNodes[2]!.textContent).toBe('text');
			},
		);
		context.test(nodeName + '.append() with the same element twice.', ({ document }) => {
			const node =
				nodeName === 'Element' ? document.createElement('div') : document.createDocumentFragment();
			const parent = node.cloneNode() as Element | DocumentFragment;
			const x = document.createElement('x');
			const y = document.createElement('y');
			parent.append(x, y, x);
			expect(parent.childNodes.length).toBe(2);
			expect(parent.childNodes[0]!).toBe(y);
			expect(parent.childNodes[1]!).toBe(x);
		});
	}
	context.test(
		'If node is a host-including inclusive ancestor of parent, then throw a HierarchyRequestError DOMException.',
		({ document, DOMException }) => {
			const doc = document.implementation.createHTMLDocument('title');
			expect(() => doc.body.append(doc.body)).toThrow(
				expect.objectContaining({
					name: 'HierarchyRequestError',
					code: 3,
					constructor: DOMException,
				}),
			);
			expect(() => doc.body.append(doc.documentElement!)).toThrow(
				expect.objectContaining({
					name: 'HierarchyRequestError',
					code: 3,
					constructor: DOMException,
				}),
			);
		},
	);
	context.test(
		'If node is not a DocumentFragment, DocumentType, Element, Text, ProcessingInstruction, or Comment node, then throw a HierarchyRequestError DOMException.',
		({ document, DOMException }) => {
			const doc = document.implementation.createHTMLDocument('title');
			const doc2 = document.implementation.createHTMLDocument('title2');
			expect(() => doc.append(doc2)).toThrow(
				expect.objectContaining({
					name: 'HierarchyRequestError',
					code: 3,
					constructor: DOMException,
				}),
			);
		},
	);
	context.test(
		'If node is a Text node and parent is a document, then throw a HierarchyRequestError DOMException.',
		({ document, DOMException }) => {
			const doc = document.implementation.createHTMLDocument('title');
			expect(() => doc.append(doc.createTextNode('text'))).toThrow(
				expect.objectContaining({
					name: 'HierarchyRequestError',
					code: 3,
					constructor: DOMException,
				}),
			);
		},
	);
	context.test(
		'If node is a doctype and parent is not a document, then throw a HierarchyRequestError DOMException.',
		({ document, DOMException }) => {
			const doc = document.implementation.createHTMLDocument('title');
			const doctype = doc.childNodes[0]!;
			expect(() => doc.createElement('a').append(doctype)).toThrow(
				expect.objectContaining({
					name: 'HierarchyRequestError',
					code: 3,
					constructor: DOMException,
				}),
			);
		},
	);
	context.test(
		'If node is a DocumentFragment with multiple elements and parent is a document, then throw a HierarchyRequestError DOMException.',
		({ document, DOMException }) => {
			const doc = document.implementation.createHTMLDocument('title');
			doc.documentElement!.remove();
			const df = doc.createDocumentFragment();
			df.appendChild(doc.createElement('a'));
			df.appendChild(doc.createElement('b'));
			expect(() => doc.append(df)).toThrow(
				expect.objectContaining({
					name: 'HierarchyRequestError',
					code: 3,
					constructor: DOMException,
				}),
			);
		},
	);
	context.test(
		'If node is a DocumentFragment with an element and parent is a document with another element, then throw a HierarchyRequestError DOMException.',
		({ document, DOMException }) => {
			const doc = document.implementation.createHTMLDocument('title');
			const df = doc.createDocumentFragment();
			df.appendChild(doc.createElement('a'));
			expect(() => doc.append(df)).toThrow(
				expect.objectContaining({
					name: 'HierarchyRequestError',
					code: 3,
					constructor: DOMException,
				}),
			);
		},
	);
	context.test(
		'If node is an Element and parent is a document with another element, then throw a HierarchyRequestError DOMException.',
		({ document, DOMException }) => {
			const doc = document.implementation.createHTMLDocument('title');
			const el = doc.createElement('a');
			expect(() => doc.append(el)).toThrow(
				expect.objectContaining({
					name: 'HierarchyRequestError',
					code: 3,
					constructor: DOMException,
				}),
			);
		},
	);
	context.test(
		'If node is a doctype and parent is a document with another doctype, then throw a HierarchyRequestError DOMException.',
		({ document, DOMException }) => {
			const doc = document.implementation.createHTMLDocument('title');
			const doctype = doc.childNodes[0]!.cloneNode();
			doc.documentElement!.remove();
			expect(() => doc.append(doctype)).toThrow(
				expect.objectContaining({
					name: 'HierarchyRequestError',
					code: 3,
					constructor: DOMException,
				}),
			);
		},
	);
	context.test(
		'If node is a doctype and parent is a document with an element, then throw a HierarchyRequestError DOMException.',
		({ document, DOMException }) => {
			const doc = document.implementation.createHTMLDocument('title');
			const doctype = doc.childNodes[0]!.cloneNode();
			doc.childNodes[0]!.remove();
			expect(() => doc.append(doctype)).toThrow(
				expect.objectContaining({
					name: 'HierarchyRequestError',
					code: 3,
					constructor: DOMException,
				}),
			);
		},
	);
}
