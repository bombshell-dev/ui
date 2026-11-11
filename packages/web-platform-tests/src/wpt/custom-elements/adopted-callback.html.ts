import type { CompatibilityContext } from '../../shared/context.ts';
import { documentNames, document_types } from './resources/custom-elements-helpers.js.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'Inserting a custom element into the owner document must not enqueue and invoke adoptedCallback',
		({ document, HTMLElement, customElements }) => {
			var calls: unknown[] = [];
			class MyCustomElement extends HTMLElement {
				connectedCallback() {
					calls.push('connected');
				}
				adoptedCallback(oldDocument: Document, newDocument: Document) {
					calls.push('adopted');
					calls.push(oldDocument);
					calls.push(newDocument);
				}
				disconnectedCallback() {
					calls.push('disconnected');
				}
			}
			customElements.define('my-custom-element', MyCustomElement);

			var instance = document.createElement('my-custom-element');
			calls = [];
			document.body.appendChild(instance);
			{
				const actualArray = calls;
				const expectedArray = ['connected'];
				expect(actualArray.length).toBe(expectedArray.length);
				for (let index = 0; index < expectedArray.length; index++)
					expect(actualArray[index]).toBe(expectedArray[index]);
			}
		},
	);
	for (const [index, documentName] of documentNames.entries()) {
		if (index === 0) continue;
		context.test(
			'Inserting a custom element into ' +
				documentName +
				' must enqueue and invoke adoptedCallback',
			async (fixture) => {
				const { document, HTMLElement, customElements } = fixture;
				const getDocument = document_types(document, fixture.Document)[index]!.create;
				var calls: unknown[] = [];
				class MyCustomElement extends HTMLElement {
					connectedCallback() {
						calls.push('connected');
					}
					adoptedCallback(oldDocument: Document, newDocument: Document) {
						calls.push('adopted');
						calls.push(oldDocument);
						calls.push(newDocument);
					}
					disconnectedCallback() {
						calls.push('disconnected');
					}
				}
				customElements.define('my-custom-element', MyCustomElement);

				return getDocument().then(function (doc) {
					var instance = document.createElement('my-custom-element');
					calls = [];
					doc.documentElement.appendChild(instance);
					{
						const actualArray = calls;
						const expectedArray = ['adopted', document, doc, 'connected'];
						expect(actualArray.length).toBe(expectedArray.length);
						for (let index = 0; index < expectedArray.length; index++)
							expect(actualArray[index]).toBe(expectedArray[index]);
					}
				});
			},
		);
		context.test(
			'Moving a custom element from the owner document into ' +
				documentName +
				' must enqueue and invoke adoptedCallback',
			async (fixture) => {
				const { document, HTMLElement, customElements } = fixture;
				const getDocument = document_types(document, fixture.Document)[index]!.create;
				var calls: unknown[] = [];
				class MyCustomElement extends HTMLElement {
					connectedCallback() {
						calls.push('connected');
					}
					adoptedCallback(oldDocument: Document, newDocument: Document) {
						calls.push('adopted');
						calls.push(oldDocument);
						calls.push(newDocument);
					}
					disconnectedCallback() {
						calls.push('disconnected');
					}
				}
				customElements.define('my-custom-element', MyCustomElement);

				return getDocument().then(function (doc) {
					var instance = document.createElement('my-custom-element');
					document.body.appendChild(instance);
					calls = [];
					doc.documentElement.appendChild(instance);
					{
						const actualArray = calls;
						const expectedArray = ['disconnected', 'adopted', document, doc, 'connected'];
						expect(actualArray.length).toBe(expectedArray.length);
						for (let index = 0; index < expectedArray.length; index++)
							expect(actualArray[index]).toBe(expectedArray[index]);
					}
				});
			},
		);
		context.test(
			'Inserting an ancestor of custom element into ' +
				documentName +
				' must enqueue and invoke adoptedCallback',
			async (fixture) => {
				const { document, HTMLElement, customElements } = fixture;
				const getDocument = document_types(document, fixture.Document)[index]!.create;
				var calls: unknown[] = [];
				class MyCustomElement extends HTMLElement {
					connectedCallback() {
						calls.push('connected');
					}
					adoptedCallback(oldDocument: Document, newDocument: Document) {
						calls.push('adopted');
						calls.push(oldDocument);
						calls.push(newDocument);
					}
					disconnectedCallback() {
						calls.push('disconnected');
					}
				}
				customElements.define('my-custom-element', MyCustomElement);

				return getDocument().then(function (doc) {
					var instance = document.createElement('my-custom-element');
					var parent = document.createElement('div');
					parent.appendChild(instance);
					calls = [];
					doc.documentElement.appendChild(parent);
					{
						const actualArray = calls;
						const expectedArray = ['adopted', document, doc, 'connected'];
						expect(actualArray.length).toBe(expectedArray.length);
						for (let index = 0; index < expectedArray.length; index++)
							expect(actualArray[index]).toBe(expectedArray[index]);
					}
				});
			},
		);
		context.test(
			'Moving an ancestor of custom element from the owner document into ' +
				documentName +
				' must enqueue and invoke adoptedCallback',
			async (fixture) => {
				const { document, HTMLElement, customElements } = fixture;
				const getDocument = document_types(document, fixture.Document)[index]!.create;
				var calls: unknown[] = [];
				class MyCustomElement extends HTMLElement {
					connectedCallback() {
						calls.push('connected');
					}
					adoptedCallback(oldDocument: Document, newDocument: Document) {
						calls.push('adopted');
						calls.push(oldDocument);
						calls.push(newDocument);
					}
					disconnectedCallback() {
						calls.push('disconnected');
					}
				}
				customElements.define('my-custom-element', MyCustomElement);

				return getDocument().then(function (doc) {
					var instance = document.createElement('my-custom-element');
					var parent = document.createElement('div');
					parent.appendChild(instance);
					document.body.appendChild(parent);
					calls = [];
					doc.documentElement.appendChild(parent);
					{
						const actualArray = calls;
						const expectedArray = ['disconnected', 'adopted', document, doc, 'connected'];
						expect(actualArray.length).toBe(expectedArray.length);
						for (let index = 0; index < expectedArray.length; index++)
							expect(actualArray[index]).toBe(expectedArray[index]);
					}
				});
			},
		);
		context.test(
			'Inserting a custom element into a shadow tree in ' +
				documentName +
				' must enqueue and invoke adoptedCallback',
			async (fixture) => {
				const { document, HTMLElement, customElements } = fixture;
				const getDocument = document_types(document, fixture.Document)[index]!.create;
				var calls: unknown[] = [];
				class MyCustomElement extends HTMLElement {
					connectedCallback() {
						calls.push('connected');
					}
					adoptedCallback(oldDocument: Document, newDocument: Document) {
						calls.push('adopted');
						calls.push(oldDocument);
						calls.push(newDocument);
					}
					disconnectedCallback() {
						calls.push('disconnected');
					}
				}
				customElements.define('my-custom-element', MyCustomElement);

				return getDocument().then(function (doc) {
					var instance = document.createElement('my-custom-element');
					var host = doc.createElementNS('http://www.w3.org/1999/xhtml', 'div');
					var shadowRoot = host.attachShadow({ mode: 'closed' });
					doc.documentElement.appendChild(host);

					calls = [];
					shadowRoot.appendChild(instance);
					{
						const actualArray = calls;
						const expectedArray = ['adopted', document, doc, 'connected'];
						expect(actualArray.length).toBe(expectedArray.length);
						for (let index = 0; index < expectedArray.length; index++)
							expect(actualArray[index]).toBe(expectedArray[index]);
					}
				});
			},
		);
		context.test(
			'Inserting the shadow host of a custom element into ' +
				documentName +
				' must enqueue and invoke adoptedCallback',
			async (fixture) => {
				const { document, HTMLElement, customElements } = fixture;
				const getDocument = document_types(document, fixture.Document)[index]!.create;
				var calls: unknown[] = [];
				class MyCustomElement extends HTMLElement {
					connectedCallback() {
						calls.push('connected');
					}
					adoptedCallback(oldDocument: Document, newDocument: Document) {
						calls.push('adopted');
						calls.push(oldDocument);
						calls.push(newDocument);
					}
					disconnectedCallback() {
						calls.push('disconnected');
					}
				}
				customElements.define('my-custom-element', MyCustomElement);

				return getDocument().then(function (doc) {
					var instance = document.createElement('my-custom-element');
					var host = document.createElement('div');
					var shadowRoot = host.attachShadow({ mode: 'closed' });
					shadowRoot.appendChild(instance);

					calls = [];
					doc.documentElement.appendChild(host);
					{
						const actualArray = calls;
						const expectedArray = ['adopted', document, doc, 'connected'];
						expect(actualArray.length).toBe(expectedArray.length);
						for (let index = 0; index < expectedArray.length; index++)
							expect(actualArray[index]).toBe(expectedArray[index]);
					}
				});
			},
		);
		context.test(
			'Moving the shadow host of a custom element from the owner document into ' +
				documentName +
				' must enqueue and invoke adoptedCallback',
			async (fixture) => {
				const { document, HTMLElement, customElements } = fixture;
				const getDocument = document_types(document, fixture.Document)[index]!.create;
				var calls: unknown[] = [];
				class MyCustomElement extends HTMLElement {
					connectedCallback() {
						calls.push('connected');
					}
					adoptedCallback(oldDocument: Document, newDocument: Document) {
						calls.push('adopted');
						calls.push(oldDocument);
						calls.push(newDocument);
					}
					disconnectedCallback() {
						calls.push('disconnected');
					}
				}
				customElements.define('my-custom-element', MyCustomElement);

				return getDocument().then(function (doc) {
					var instance = document.createElement('my-custom-element');
					var host = document.createElement('div');
					var shadowRoot = host.attachShadow({ mode: 'closed' });
					shadowRoot.appendChild(instance);
					document.body.appendChild(host);

					calls = [];
					doc.documentElement.appendChild(host);
					{
						const actualArray = calls;
						const expectedArray = ['disconnected', 'adopted', document, doc, 'connected'];
						expect(actualArray.length).toBe(expectedArray.length);
						for (let index = 0; index < expectedArray.length; index++)
							expect(actualArray[index]).toBe(expectedArray[index]);
					}
				});
			},
		);
		context.test(
			"Moving the shadow host's shadow of a custom element from the owner document into " +
				documentName +
				' must enqueue and invoke adoptedCallback',
			async (fixture) => {
				const { document, HTMLElement, customElements } = fixture;
				const getDocument = document_types(document, fixture.Document)[index]!.create;
				var calls: unknown[] = [];
				class MyCustomElement extends HTMLElement {
					connectedCallback() {
						calls.push('connected');
					}
					adoptedCallback(oldDocument: Document, newDocument: Document) {
						calls.push('adopted');
						calls.push(oldDocument);
						calls.push(newDocument);
					}
					disconnectedCallback() {
						calls.push('disconnected');
					}
				}
				customElements.define('my-custom-element', MyCustomElement);

				return getDocument().then(function (doc) {
					const instance = document.createElement('my-custom-element');
					const host = document.createElement('div');
					const shadowRoot = host.attachShadow({ mode: 'closed' });
					shadowRoot.appendChild(instance);
					document.body.appendChild(host);

					calls = [];
					doc.documentElement.appendChild(shadowRoot);
					{
						const actualArray = calls;
						const expectedArray = ['disconnected', 'adopted', document, doc, 'connected'];
						expect(actualArray.length).toBe(expectedArray.length);
						for (let index = 0; index < expectedArray.length; index++)
							expect(actualArray[index]).toBe(expectedArray[index]);
					}
				});
			},
		);
		context.test(
			"Moving the <template>'s content of a custom element from the owner document into " +
				documentName +
				' must enqueue and invoke adoptedCallback',
			async (fixture) => {
				const { document, HTMLElement, customElements } = fixture;
				const getDocument = document_types(document, fixture.Document)[index]!.create;
				var calls: unknown[] = [];
				class MyCustomElement extends HTMLElement {
					connectedCallback() {
						calls.push('connected');
					}
					adoptedCallback(oldDocument: Document, newDocument: Document) {
						calls.push('adopted');
						calls.push(oldDocument);
						calls.push(newDocument);
					}
					disconnectedCallback() {
						calls.push('disconnected');
					}
				}
				customElements.define('my-custom-element', MyCustomElement);

				return getDocument().then(function (doc) {
					const instance = document.createElement('my-custom-element');
					const template = document.createElement('template');
					const templateContent = template.content;
					templateContent.appendChild(instance);
					document.body.appendChild(template);

					calls = [];
					doc.documentElement.appendChild(templateContent);
					if (doc === templateContent.ownerDocument) {
						{
							const actualArray = calls;
							const expectedArray = ['connected'];
							expect(actualArray.length).toBe(expectedArray.length);
							for (let index = 0; index < expectedArray.length; index++)
								expect(actualArray[index]).toBe(expectedArray[index]);
						}
					} else {
						{
							const actualArray = calls;
							const expectedArray = ['adopted', templateContent.ownerDocument, doc, 'connected'];
							expect(actualArray.length).toBe(expectedArray.length);
							for (let index = 0; index < expectedArray.length; index++)
								expect(actualArray[index]).toBe(expectedArray[index]);
						}
					}
				});
			},
		);
		context.test(
			'Inserting a custom element into a detached shadow tree that belongs to ' +
				documentName +
				' must enqueue and invoke adoptedCallback',
			async (fixture) => {
				const { document, HTMLElement, customElements } = fixture;
				const getDocument = document_types(document, fixture.Document)[index]!.create;
				var calls: unknown[] = [];
				class MyCustomElement extends HTMLElement {
					connectedCallback() {
						calls.push('connected');
					}
					adoptedCallback(oldDocument: Document, newDocument: Document) {
						calls.push('adopted');
						calls.push(oldDocument);
						calls.push(newDocument);
					}
					disconnectedCallback() {
						calls.push('disconnected');
					}
				}
				customElements.define('my-custom-element', MyCustomElement);

				return getDocument().then(function (doc) {
					var instance = document.createElement('my-custom-element');
					var host = doc.createElementNS('http://www.w3.org/1999/xhtml', 'div');
					var shadowRoot = host.attachShadow({ mode: 'closed' });

					calls = [];
					shadowRoot.appendChild(instance);
					{
						const actualArray = calls;
						const expectedArray = ['adopted', document, doc];
						expect(actualArray.length).toBe(expectedArray.length);
						for (let index = 0; index < expectedArray.length; index++)
							expect(actualArray[index]).toBe(expectedArray[index]);
					}
				});
			},
		);
	}
}
