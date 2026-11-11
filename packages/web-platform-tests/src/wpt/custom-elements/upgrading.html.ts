import type { CompatibilityContext } from '../../shared/context.ts';
import { documentNames, document_types } from './resources/custom-elements-helpers.js.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	for (const [index, documentName] of documentNames.entries()) {
		if (index === 0) continue;
		if (index !== 6) {
			context.test(
				'Creating an element in ' +
					documentName +
					' must not enqueue a custom element upgrade reaction' +
					' because the document does not have a browsing context',
				async ({ document, HTMLElement, customElements, Document }) => {
					class PredefinedCustomElement extends HTMLElement {}
					customElements.define('predefined-custom-element', PredefinedCustomElement);
					var customElementNumber = 1;
					function generateNextCustomElementName() {
						return 'custom-' + customElementNumber++;
					}
					const getDocument = document_types(document, Document)[index]!.create;

					return getDocument().then(function (doc) {
						expect(
							doc.createElement('predefined-custom-element') instanceof PredefinedCustomElement,
						).toBe(false);
					});
				},
			);
			context.test(
				'Creating an element in ' +
					documentName +
					' and inserting into the document must not enqueue a custom element upgrade reaction',
				async ({ document, HTMLElement, customElements, Element, Document }) => {
					class PredefinedCustomElement extends HTMLElement {}
					customElements.define('predefined-custom-element', PredefinedCustomElement);
					var customElementNumber = 1;
					function generateNextCustomElementName() {
						return 'custom-' + customElementNumber++;
					}
					const getDocument = document_types(document, Document)[index]!.create;

					var name = generateNextCustomElementName();
					var unresolvedElement = document.createElement(name);

					expect(
						Object.getPrototypeOf(unresolvedElement),
						'[[Prototype]] internal slot of the unresolved custom element must be the HTMLElement prototype',
					).toBe(HTMLElement.prototype);

					return getDocument().then(function (doc) {
						var unresolvedElementInDoc = doc.createElement(name);
						var prototype = (
							unresolvedElementInDoc.namespaceURI == 'http://www.w3.org/1999/xhtml'
								? HTMLElement
								: Element
						).prototype;

						expect(
							Object.getPrototypeOf(unresolvedElementInDoc),
							'[[Prototype]] internal slot of the unresolved custom element must be the ' +
								prototype.toString() +
								' prototype',
						).toBe(prototype);
						var someCustomElement = class extends HTMLElement {};
						customElements.define(name, someCustomElement);
						expect(
							Object.getPrototypeOf(unresolvedElementInDoc),
							'"define" must not upgrade a disconnected unresolved custom elements',
						).toBe(prototype);
						doc.documentElement.appendChild(unresolvedElementInDoc);
						expect(
							Object.getPrototypeOf(unresolvedElementInDoc),
							'Inserting an element into a document without a browsing context must not enqueue a custom element upgrade reaction',
						).toBe(prototype);
					});
				},
			);
			context.test(
				'Creating an element in ' +
					documentName +
					' and adopting back to a document with browsing context must enqueue a custom element upgrade reaction',
				async ({ document, HTMLElement, customElements, Element, Document }) => {
					class PredefinedCustomElement extends HTMLElement {}
					customElements.define('predefined-custom-element', PredefinedCustomElement);
					var customElementNumber = 1;
					function generateNextCustomElementName() {
						return 'custom-' + customElementNumber++;
					}
					const getDocument = document_types(document, Document)[index]!.create;

					var name = generateNextCustomElementName();
					var unresolvedElement = document.createElement(name);

					expect(
						Object.getPrototypeOf(unresolvedElement),
						'[[Prototype]] internal slot of the unresolved custom element must be the HTMLElement prototype',
					).toBe(HTMLElement.prototype);

					return getDocument().then(function (doc) {
						var unresolvedElementInDoc = doc.createElement(name);
						var prototype = (
							unresolvedElementInDoc.namespaceURI == 'http://www.w3.org/1999/xhtml'
								? HTMLElement
								: Element
						).prototype;

						expect(
							Object.getPrototypeOf(unresolvedElementInDoc),
							'[[Prototype]] internal slot of the unresolved custom element must be the ' +
								prototype.toString() +
								' prototype',
						).toBe(prototype);
						var someCustomElement = class extends HTMLElement {};
						customElements.define(name, someCustomElement);
						expect(
							Object.getPrototypeOf(unresolvedElementInDoc),
							'"define" must not upgrade a disconnected unresolved custom elements',
						).toBe(prototype);
						document.body.appendChild(unresolvedElementInDoc);

						if (unresolvedElementInDoc.namespaceURI == 'http://www.w3.org/1999/xhtml') {
							expect(
								Object.getPrototypeOf(unresolvedElementInDoc),
								'Inserting an element into a document with a browsing context must enqueue a custom element upgrade reaction',
							).toBe(someCustomElement.prototype);
						} else {
							expect(
								Object.getPrototypeOf(unresolvedElementInDoc),
								'Looking up a custom element definition must return null if the element is not in the HTML namespace',
							).toBe(prototype);
						}
					});
				},
			);
		} else {
			context.test(
				'Creating an element in ' +
					documentName +
					' must not enqueue a custom element upgrade reaction if there is no matching definition',
				async ({ document, HTMLElement, customElements, Document }) => {
					class PredefinedCustomElement extends HTMLElement {}
					customElements.define('predefined-custom-element', PredefinedCustomElement);
					var customElementNumber = 1;
					function generateNextCustomElementName() {
						return 'custom-' + customElementNumber++;
					}
					const getDocument = document_types(document, Document)[index]!.create;

					return getDocument().then(function (doc) {
						expect(
							doc.createElement('predefined-custom-element') instanceof PredefinedCustomElement,
						).toBe(false);
					});
				},
			);
			context.test(
				'Creating an element in ' +
					documentName +
					' must enqueue a custom element upgrade reaction if there is a matching definition',
				async ({ document, HTMLElement, customElements, Document }) => {
					class PredefinedCustomElement extends HTMLElement {}
					customElements.define('predefined-custom-element', PredefinedCustomElement);
					var customElementNumber = 1;
					function generateNextCustomElementName() {
						return 'custom-' + customElementNumber++;
					}
					const getDocument = document_types(document, Document)[index]!.create;

					return getDocument().then(function (doc) {
						var docWindow = doc.defaultView as Window & typeof globalThis;
						class DistinctPredefinedCustomElement extends docWindow.HTMLElement {}
						docWindow.customElements.define(
							'predefined-custom-element',
							DistinctPredefinedCustomElement,
						);
						expect(
							doc.createElement('predefined-custom-element') instanceof
								DistinctPredefinedCustomElement,
						).toBe(true);
					});
				},
			);
			context.test(
				'"define" in ' +
					documentName +
					' must not enqueue a custom element upgrade reaction on a disconnected unresolved custom element',
				async ({ document, HTMLElement, customElements, Document }) => {
					class PredefinedCustomElement extends HTMLElement {}
					customElements.define('predefined-custom-element', PredefinedCustomElement);
					var customElementNumber = 1;
					function generateNextCustomElementName() {
						return 'custom-' + customElementNumber++;
					}
					const getDocument = document_types(document, Document)[index]!.create;

					var unresolvedElement = document.createElement('unresolved-element');
					return getDocument().then(function (doc) {
						var docWindow = doc.defaultView as Window & typeof globalThis;
						class UnresolvedElement extends docWindow.HTMLElement {}
						var unresolvedElementInDoc = doc.createElement('unresolved-element');

						expect(Object.getPrototypeOf(unresolvedElement)).toBe(HTMLElement.prototype);
						expect(Object.getPrototypeOf(unresolvedElementInDoc)).toBe(
							docWindow.HTMLElement.prototype,
						);

						docWindow.customElements.define('unresolved-element', UnresolvedElement);

						expect(Object.getPrototypeOf(unresolvedElement)).toBe(HTMLElement.prototype);
						expect(Object.getPrototypeOf(unresolvedElementInDoc)).toBe(
							docWindow.HTMLElement.prototype,
						);
					});
				},
			);
			context.test(
				'Inserting an unresolved custom element into ' +
					documentName +
					' must enqueue a custom element upgrade reaction',
				async ({ document, HTMLElement, customElements, Document }) => {
					class PredefinedCustomElement extends HTMLElement {}
					customElements.define('predefined-custom-element', PredefinedCustomElement);
					var customElementNumber = 1;
					function generateNextCustomElementName() {
						return 'custom-' + customElementNumber++;
					}
					const getDocument = document_types(document, Document)[index]!.create;

					var unresolvedElement = document.createElement('unresolved-element');
					return getDocument().then(function (doc) {
						var docWindow = doc.defaultView as Window & typeof globalThis;
						class UnresolvedElement extends docWindow.HTMLElement {}
						var unresolvedElementInDoc = doc.createElement('unresolved-element');

						expect(Object.getPrototypeOf(unresolvedElement)).toBe(HTMLElement.prototype);
						expect(Object.getPrototypeOf(unresolvedElementInDoc)).toBe(
							docWindow.HTMLElement.prototype,
						);

						docWindow.customElements.define('unresolved-element', UnresolvedElement);
						doc.documentElement.appendChild(unresolvedElementInDoc);

						expect(Object.getPrototypeOf(unresolvedElement)).toBe(HTMLElement.prototype);
						expect(Object.getPrototypeOf(unresolvedElementInDoc)).toBe(UnresolvedElement.prototype);
					});
				},
			);
			context.test(
				'"define" in ' +
					documentName +
					' must enqueue a custom element upgrade reaction on a connected unresolved custom element',
				async ({ document, HTMLElement, customElements, Document }) => {
					class PredefinedCustomElement extends HTMLElement {}
					customElements.define('predefined-custom-element', PredefinedCustomElement);
					var customElementNumber = 1;
					function generateNextCustomElementName() {
						return 'custom-' + customElementNumber++;
					}
					const getDocument = document_types(document, Document)[index]!.create;

					var unresolvedElement = document.createElement('unresolved-element');
					return getDocument().then(function (doc) {
						var docWindow = doc.defaultView as Window & typeof globalThis;
						class UnresolvedElement extends docWindow.HTMLElement {}
						var unresolvedElementInDoc = doc.createElement('unresolved-element');
						doc.documentElement.appendChild(unresolvedElementInDoc);

						expect(Object.getPrototypeOf(unresolvedElement)).toBe(HTMLElement.prototype);
						expect(Object.getPrototypeOf(unresolvedElementInDoc)).toBe(
							docWindow.HTMLElement.prototype,
						);

						docWindow.customElements.define('unresolved-element', UnresolvedElement);

						expect(Object.getPrototypeOf(unresolvedElement)).toBe(HTMLElement.prototype);
						expect(Object.getPrototypeOf(unresolvedElementInDoc)).toBe(UnresolvedElement.prototype);
					});
				},
			);
			context.test(
				'Adopting (and leaving disconnceted) an unresolved custom element into ' +
					documentName +
					' must not enqueue a custom element upgrade reaction',
				async ({ document, HTMLElement, customElements, Document }) => {
					class PredefinedCustomElement extends HTMLElement {}
					customElements.define('predefined-custom-element', PredefinedCustomElement);
					var customElementNumber = 1;
					function generateNextCustomElementName() {
						return 'custom-' + customElementNumber++;
					}
					const getDocument = document_types(document, Document)[index]!.create;

					var unresolvedElement = document.createElement('unresolved-element');
					return getDocument().then(function (doc) {
						var docWindow = doc.defaultView as Window & typeof globalThis;
						class UnresolvedElement extends docWindow.HTMLElement {}
						expect(unresolvedElement instanceof UnresolvedElement).toBe(false);
						docWindow.customElements.define('unresolved-element', UnresolvedElement);
						doc.adoptNode(unresolvedElement);
						expect(unresolvedElement instanceof UnresolvedElement).toBe(false);
					});
				},
			);
			context.test(
				'Adopting and inserting an unresolved custom element into ' +
					documentName +
					' must enqueue a custom element upgrade reaction',
				async ({ document, HTMLElement, customElements, Document }) => {
					class PredefinedCustomElement extends HTMLElement {}
					customElements.define('predefined-custom-element', PredefinedCustomElement);
					var customElementNumber = 1;
					function generateNextCustomElementName() {
						return 'custom-' + customElementNumber++;
					}
					const getDocument = document_types(document, Document)[index]!.create;

					var unresolvedElement = document.createElement('unresolved-element');
					return getDocument().then(function (doc) {
						var docWindow = doc.defaultView as Window & typeof globalThis;
						class UnresolvedElement extends docWindow.HTMLElement {}
						expect(unresolvedElement instanceof UnresolvedElement).toBe(false);
						docWindow.customElements.define('unresolved-element', UnresolvedElement);
						doc.documentElement.appendChild(unresolvedElement);
						expect(unresolvedElement instanceof UnresolvedElement).toBe(true);
					});
				},
			);
		}
	}

	context.test(
		'Infinite constructor recursion with upgrade(this) should not be possible',
		({ HTMLElement, customElements, document }) => {
			var log: (HTMLElement | string)[][] = [];

			customElements.define(
				'infinite-cloning-element-1',
				class extends HTMLElement {
					constructor() {
						super();
						log.push([this, 'begin']);
						// Potential infinite recursion:
						customElements.upgrade(this);
						log.push([this, 'end']);
					}
				},
			);

			expect(log.length).toBe(2);
			const instance = document.querySelector('infinite-cloning-element-1');
			{
				const actualArray = log[0]!;
				const expectedArray = [instance, 'begin'];
				expect(actualArray.length).toBe(expectedArray.length);
				for (let index = 0; index < expectedArray.length; index++)
					expect(actualArray[index]).toBe(expectedArray[index]);
			}
			{
				const actualArray = log[1]!;
				const expectedArray = [instance, 'end'];
				expect(actualArray.length).toBe(expectedArray.length);
				for (let index = 0; index < expectedArray.length; index++)
					expect(actualArray[index]).toBe(expectedArray[index]);
			}
		},
		{
			document: {
				contentType: 'text/html',
				content:
					'<!DOCTYPE html>\n<html>\n<head>\n<title>Custom Elements: Enqueue a custom element upgrade reaction</title>\n<meta name="author" title="Ryosuke Niwa" href="mailto:rniwa@webkit.org">\n<meta name="assert" content="Enqueue a custom element upgrade reaction must upgrade a custom element">\n<link rel="help" href="https://dom.spec.whatwg.org/#concept-create-element">\n<link rel="help" href="https://html.spec.whatwg.org/multipage/scripting.html#concept-try-upgrade">\n<link rel="help" href="https://html.spec.whatwg.org/multipage/scripting.html#enqueue-a-custom-element-upgrade-reaction">\n\n\n\n</head>\n<body>\n<infinite-cloning-element-1></infinite-cloning-element-1>\n<infinite-cloning-element-2 id="a"></infinite-cloning-element-2>\n<infinite-cloning-element-2 id="b"></infinite-cloning-element-2>\n<div id="log"></div>\n\n</body>\n</html>\n',
			},
		},
	);
	context.test(
		'Infinite constructor recursion with appendChild should not be possible',
		({ HTMLElement, customElements, document }) => {
			var log: (HTMLElement | string)[][] = [];

			customElements.define(
				'infinite-cloning-element-2',
				class extends HTMLElement {
					constructor() {
						super();
						log.push([this, 'begin']);
						const b = document.querySelector('#b')!;
						b.remove();
						// While this constructor is running for "a", "b" is still
						// undefined, and so inserting it into the document will enqueue a
						// second upgrade reaction for "b" in addition to the one enqueued
						// by defining x-foo.
						document.body.appendChild(b);
						log.push([this, 'end']);
					}
				},
			);

			expect(log.length).toBe(4);
			const instanceA = document.querySelector('#a');
			const instanceB = document.querySelector('#b');
			{
				const actualArray = log[0]!;
				const expectedArray = [instanceA, 'begin'];
				expect(actualArray.length).toBe(expectedArray.length);
				for (let index = 0; index < expectedArray.length; index++)
					expect(actualArray[index]).toBe(expectedArray[index]);
			}
			{
				const actualArray = log[1]!;
				const expectedArray = [instanceB, 'begin'];
				expect(actualArray.length).toBe(expectedArray.length);
				for (let index = 0; index < expectedArray.length; index++)
					expect(actualArray[index]).toBe(expectedArray[index]);
			}
			{
				const actualArray = log[2]!;
				const expectedArray = [instanceB, 'end'];
				expect(actualArray.length).toBe(expectedArray.length);
				for (let index = 0; index < expectedArray.length; index++)
					expect(actualArray[index]).toBe(expectedArray[index]);
			}
			{
				const actualArray = log[3]!;
				const expectedArray = [instanceA, 'end'];
				expect(actualArray.length).toBe(expectedArray.length);
				for (let index = 0; index < expectedArray.length; index++)
					expect(actualArray[index]).toBe(expectedArray[index]);
			}
		},
		{
			document: {
				contentType: 'text/html',
				content:
					'<!DOCTYPE html>\n<html>\n<head>\n<title>Custom Elements: Enqueue a custom element upgrade reaction</title>\n<meta name="author" title="Ryosuke Niwa" href="mailto:rniwa@webkit.org">\n<meta name="assert" content="Enqueue a custom element upgrade reaction must upgrade a custom element">\n<link rel="help" href="https://dom.spec.whatwg.org/#concept-create-element">\n<link rel="help" href="https://html.spec.whatwg.org/multipage/scripting.html#concept-try-upgrade">\n<link rel="help" href="https://html.spec.whatwg.org/multipage/scripting.html#enqueue-a-custom-element-upgrade-reaction">\n\n\n\n</head>\n<body>\n<infinite-cloning-element-1></infinite-cloning-element-1>\n<infinite-cloning-element-2 id="a"></infinite-cloning-element-2>\n<infinite-cloning-element-2 id="b"></infinite-cloning-element-2>\n<div id="log"></div>\n\n</body>\n</html>\n',
			},
		},
	);

	context.test(
		"If definition's disable shadow is true and element's shadow root is " +
			'non-null, then throw a "NotSupportedError" DOMException.',
		({ document, HTMLElement, customElements, DOMException, cleanup }) => {
			const window = document.defaultView!;
			class ShadowDisabledElement extends HTMLElement {
				static get disabledFeatures() {
					return ['shadow'];
				}
			}
			let error: unknown = null;
			const listener = (e: ErrorEvent) => {
				error = e.error;
				e.preventDefault();
			};
			window.addEventListener('error', listener, { once: true });
			cleanup(() => window.removeEventListener('error', listener));
			let element = document.createElement('shadow-disabled');
			element.attachShadow({ mode: 'open' });
			customElements.define('shadow-disabled', ShadowDisabledElement);
			customElements.upgrade(element);
			expect(element instanceof ShadowDisabledElement, 'Upgrading should fail.').toBe(false);
			expect(error instanceof DOMException).toBe(true);
			expect((error as DOMException).name).toBe('NotSupportedError');
		},
	);
}
