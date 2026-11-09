import type { CompatibilityExpect, DOMFixture } from '../../../shared/context.ts';
export type AttributeArguments = [
	name: string,
	oldValue: string | null,
	newValue: string | null,
	namespace: string | null,
];
export interface CallbackLog {
	type: string;
	element: Element;
	name?: string;
	namespace?: string | null;
	oldValue?: string | null;
	newValue?: string | null;
	actualValue?: string | null;
	oldDocument?: Document;
	newDocument?: Document;
}
export const documentNames = [
	'the document',
	'the document of the template elements',
	'a new document',
	'a cloned document',
	'a document created by createHTMLDocument',
	'an HTML document created by createDocument',
	'the document of an iframe',
] as const;
export function document_types(document: Document, Document: typeof globalThis.Document) {
	return [
		{
			name: 'the document',
			create: function () {
				return Promise.resolve(document);
			},
			isOwner: true,
			hasBrowsingContext: true,
		},
		{
			name: 'the document of the template elements',
			create: function () {
				return new Promise<Document>(function (resolve) {
					var template = document.createElementNS(
						'http://www.w3.org/1999/xhtml',
						'template',
					) as HTMLTemplateElement;
					var doc = template.content.ownerDocument!;
					if (!doc.documentElement) doc.appendChild(doc.createElement('html'));
					resolve(doc);
				});
			},
			hasBrowsingContext: false,
		},
		{
			name: 'a new document',
			create: function () {
				return new Promise<Document>(function (resolve) {
					var doc = new Document();
					doc.appendChild(doc.createElement('html'));
					resolve(doc);
				});
			},
			hasBrowsingContext: false,
		},
		{
			name: 'a cloned document',
			create: function () {
				return new Promise<Document>(function (resolve) {
					var doc = document.cloneNode(false) as Document;
					doc.appendChild(doc.createElement('html'));
					resolve(doc);
				});
			},
			hasBrowsingContext: false,
		},
		{
			name: 'a document created by createHTMLDocument',
			create: function () {
				return Promise.resolve(document.implementation.createHTMLDocument());
			},
			hasBrowsingContext: false,
		},
		{
			name: 'an HTML document created by createDocument',
			create: function () {
				return Promise.resolve(
					document.implementation.createDocument('http://www.w3.org/1999/xhtml', 'html', null),
				);
			},
			hasBrowsingContext: false,
		},
		{
			name: 'the document of an iframe',
			create: function () {
				return new Promise<Document>(function (resolve, reject) {
					var iframe = document.createElement('iframe');
					iframe.onload = function () {
						resolve(iframe.contentDocument!);
					};
					iframe.onerror = function () {
						reject('Failed to load an empty iframe');
					};
					document.body.appendChild(iframe);
				});
			},
			hasBrowsingContext: true,
		},
	];
}
export function create_window_in_test(
	document: Document,
	{ cleanup }: DOMFixture,
	srcdoc?: string,
) {
	let p = new Promise<Window & typeof globalThis>((resolve) => {
		let f = document.createElement('iframe');
		f.srcdoc = srcdoc ? srcdoc : '';
		f.onload = (event) => {
			let w = f.contentWindow as Window & typeof globalThis;
			cleanup(() => f.remove());
			resolve(w);
		};
		document.body.appendChild(f);
	});
	return p;
}

export function create_constructor_log(element: Element, ..._args: unknown[]) {
	return { type: 'constructed', element: element };
}

export function assert_constructor_log_entry(
	expect: CompatibilityExpect,
	log: CallbackLog,
	element: Element | null,
) {
	expect(log.type).toBe('constructed');
	expect(log.element).toBe(element);
}

export function create_connected_callback_log(element: Element, ..._args: unknown[]) {
	return { type: 'connected', element: element };
}

export function assert_connected_log_entry(
	expect: CompatibilityExpect,
	log: CallbackLog,
	element: Element | null,
) {
	expect(log.type).toBe('connected');
	expect(log.element).toBe(element);
}

export function create_disconnected_callback_log(element: Element, ..._args: unknown[]) {
	return { type: 'disconnected', element: element };
}

export function assert_adopted_log_entry(
	expect: CompatibilityExpect,
	log: CallbackLog,
	element: Element | null,
) {
	expect(log.type).toBe('adopted');
	expect(log.element).toBe(element);
}

export function create_adopted_callback_log(element: Element, ..._args: unknown[]) {
	return { type: 'adopted', element: element };
}

export function create_attribute_changed_callback_log(
	element: Element,
	...[name, oldValue, newValue, namespace]: AttributeArguments
) {
	return {
		type: 'attributeChanged',
		element: element,
		name: name,
		namespace: namespace,
		oldValue: oldValue,
		newValue: newValue,
		actualValue: element.getAttributeNS(namespace, name),
	};
}

export function assert_attribute_log_entry(
	expect: CompatibilityExpect,
	log: CallbackLog,
	expected: {
		name: string;
		oldValue: string | null;
		newValue: string | null;
		namespace: string | null;
	},
) {
	expect(log.type).toBe('attributeChanged');
	expect(log.name).toBe(expected.name);
	expect(log.oldValue).toBe(expected.oldValue);
	expect(log.newValue).toBe(expected.newValue);
	expect(log.actualValue).toBe(expected.newValue);
	expect(log.namespace).toBe(expected.namespace);
}

export function define_new_custom_element(
	HTMLElement: typeof globalThis.HTMLElement,
	customElements: CustomElementRegistry,
	observedAttributes: Iterable<string>,
) {
	let log: CallbackLog[] = [];
	let name = 'custom-element-' + define_new_custom_element._element_number++;

	class CustomElement extends HTMLElement {
		declare static observedAttributes: Iterable<string>;
		constructor() {
			super();
			log.push({ type: 'constructed', element: this });
		}
		attributeChangedCallback(...args: AttributeArguments) {
			log.push(create_attribute_changed_callback_log(this, ...args));
		}
		connectedCallback() {
			log.push({ type: 'connected', element: this });
		}
		disconnectedCallback() {
			log.push({ type: 'disconnected', element: this });
		}
		adoptedCallback(oldDocument: Document, newDocument: Document) {
			log.push({
				type: 'adopted',
				element: this,
				oldDocument: oldDocument,
				newDocument: newDocument,
			});
		}
	}
	CustomElement.observedAttributes = observedAttributes;

	customElements.define(name, CustomElement);

	return {
		name: name,
		class: CustomElement,
		takeLog: function () {
			let currentLog = log as CallbackLog[] & { types(): string[]; last(): CallbackLog };
			log = [];
			currentLog.types = () => currentLog.map((entry) => entry.type);
			currentLog.last = () => currentLog[currentLog.length - 1]!;
			return currentLog;
		},
	};
}
define_new_custom_element._element_number = 1;
