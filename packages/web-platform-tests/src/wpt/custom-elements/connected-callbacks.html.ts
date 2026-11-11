import type { CompatibilityContext } from '../../shared/context.ts';
import { documentNames, document_types } from './resources/custom-elements-helpers.js.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	for (const [index, documentName] of documentNames.entries()) {
		context.test(
			'Inserting a custom element into ' +
				documentName +
				' must enqueue and invoke connectedCallback',
			async ({ document, HTMLElement, customElements, Document }) => {
				const getDocument = document_types(document, Document)[index]!.create;
				var calls: unknown[] = [];
				class MyCustomElement extends HTMLElement {
					connectedCallback() {
						calls.push('connected', this);
					}
					disconnectedCallback() {
						calls.push('disconnected', this);
					}
				}
				customElements.define('my-custom-element', MyCustomElement);

				return getDocument().then(function (doc) {
					var instance = document.createElement('my-custom-element');
					calls = [];
					doc.documentElement.appendChild(instance);
					{
						const actualArray = calls;
						const expectedArray = ['connected', instance];
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
				' must enqueue and invoke connectedCallback',
			async ({ document, HTMLElement, customElements, Document }) => {
				const getDocument = document_types(document, Document)[index]!.create;
				var calls: unknown[] = [];
				class MyCustomElement extends HTMLElement {
					connectedCallback() {
						calls.push('connected', this);
					}
					disconnectedCallback() {
						calls.push('disconnected', this);
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
						const expectedArray = ['connected', instance];
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
				' must enqueue and invoke connectedCallback',
			async ({ document, HTMLElement, customElements, Document }) => {
				const getDocument = document_types(document, Document)[index]!.create;
				var calls: unknown[] = [];
				class MyCustomElement extends HTMLElement {
					connectedCallback() {
						calls.push('connected', this);
					}
					disconnectedCallback() {
						calls.push('disconnected', this);
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
						const expectedArray = ['connected', instance];
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
				' must enqueue and invoke connectedCallback',
			async ({ document, HTMLElement, customElements, Document }) => {
				const getDocument = document_types(document, Document)[index]!.create;
				var calls: unknown[] = [];
				class MyCustomElement extends HTMLElement {
					connectedCallback() {
						calls.push('connected', this);
					}
					disconnectedCallback() {
						calls.push('disconnected', this);
					}
				}
				customElements.define('my-custom-element', MyCustomElement);

				return getDocument().then(function (doc) {
					var instance = document.createElement('my-custom-element');
					var host = doc.createElementNS('http://www.w3.org/1999/xhtml', 'div');
					var shadowRoot = host.attachShadow({ mode: 'closed' });
					shadowRoot.appendChild(instance);

					calls = [];
					doc.documentElement.appendChild(host);
					{
						const actualArray = calls;
						const expectedArray = ['connected', instance];
						expect(actualArray.length).toBe(expectedArray.length);
						for (let index = 0; index < expectedArray.length; index++)
							expect(actualArray[index]).toBe(expectedArray[index]);
					}
				});
			},
		);
		context.test(
			'Inserting a custom element into a detached shadow tree that belongs to ' +
				documentName +
				' must not enqueue and invoke connectedCallback',
			async ({ document, HTMLElement, customElements, Document }) => {
				const getDocument = document_types(document, Document)[index]!.create;
				var calls: unknown[] = [];
				class MyCustomElement extends HTMLElement {
					connectedCallback() {
						calls.push('connected', this);
					}
					disconnectedCallback() {
						calls.push('disconnected', this);
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
						const expectedArray: never[] = [];
						expect(actualArray.length).toBe(expectedArray.length);
						for (let index = 0; index < expectedArray.length; index++)
							expect(actualArray[index]).toBe(expectedArray[index]);
					}
				});
			},
		);
	}
}
