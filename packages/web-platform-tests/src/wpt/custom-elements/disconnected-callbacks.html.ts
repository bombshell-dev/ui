import type { CompatibilityContext } from '../../shared/context.ts';
import { documentNames, document_types } from './resources/custom-elements-helpers.js.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	for (const [index, documentName] of documentNames.entries()) {
		context.test(
			'Removing a custom element from ' +
				documentName +
				' must enqueue and invoke disconnectedCallback',
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
					doc.documentElement.appendChild(instance);
					calls = [];
					doc.documentElement.removeChild(instance);
					{
						const actualArray = calls;
						const expectedArray = ['disconnected', instance];
						expect(actualArray.length).toBe(expectedArray.length);
						for (let index = 0; index < expectedArray.length; index++)
							expect(actualArray[index]).toBe(expectedArray[index]);
					}
				});
			},
		);
		context.test(
			'Removing an ancestor of custom element from ' +
				documentName +
				' must enqueue and invoke disconnectedCallback',
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
					doc.documentElement.appendChild(parent);
					calls = [];
					doc.documentElement.removeChild(parent);
					{
						const actualArray = calls;
						const expectedArray = ['disconnected', instance];
						expect(actualArray.length).toBe(expectedArray.length);
						for (let index = 0; index < expectedArray.length; index++)
							expect(actualArray[index]).toBe(expectedArray[index]);
					}
				});
			},
		);
		context.test(
			'Removing a custom element from a shadow tree in ' +
				documentName +
				' must enqueue and invoke disconnectedCallback',
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
					shadowRoot.appendChild(instance);

					calls = [];
					shadowRoot.removeChild(instance);
					{
						const actualArray = calls;
						const expectedArray = ['disconnected', instance];
						expect(actualArray.length).toBe(expectedArray.length);
						for (let index = 0; index < expectedArray.length; index++)
							expect(actualArray[index]).toBe(expectedArray[index]);
					}
				});
			},
		);
		context.test(
			'Removing the shadow host of a custom element from a' +
				documentName +
				' must enqueue and invoke disconnectedCallback',
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
					doc.documentElement.appendChild(host);

					calls = [];
					doc.documentElement.removeChild(host);
					{
						const actualArray = calls;
						const expectedArray = ['disconnected', instance];
						expect(actualArray.length).toBe(expectedArray.length);
						for (let index = 0; index < expectedArray.length; index++)
							expect(actualArray[index]).toBe(expectedArray[index]);
					}
				});
			},
		);
		context.test(
			'Removing a custom element from a detached shadow tree that belongs to ' +
				documentName +
				' must not enqueue and invoke disconnectedCallback',
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
					shadowRoot.removeChild(instance);
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
