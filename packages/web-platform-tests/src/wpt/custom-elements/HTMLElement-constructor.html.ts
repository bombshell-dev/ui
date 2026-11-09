import type { CompatibilityContext } from '../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'HTMLElement constructor must throw a TypeError when NewTarget is equal to itself',
		({ HTMLElement, customElements, TypeError }) => {
			customElements.define('html-custom-element', HTMLElement);
			expect(function () {
				new HTMLElement();
			}).toThrow(expect.objectContaining({ constructor: TypeError }));
		},
	);
	context.test(
		'HTMLElement constructor must throw a TypeError when NewTarget is equal to itself via a Proxy object',
		({ HTMLElement, customElements, TypeError }) => {
			customElements.define('html-proxy-custom-element', new Proxy(HTMLElement, {}));
			expect(function () {
				new HTMLElement();
			}).toThrow(expect.objectContaining({ constructor: TypeError }));
		},
	);
	context.test(
		'HTMLElement constructor must throw TypeError when it has not been defined by customElements.define',
		({ HTMLElement, TypeError }) => {
			class SomeCustomElement extends HTMLElement {}
			expect(function () {
				new SomeCustomElement();
			}).toThrow(expect.objectContaining({ constructor: TypeError }));
		},
	);
	context.test(
		'Custom element constructor must throw TypeError when it does not extend HTMLElement',
		({ customElements, HTMLParagraphElement, TypeError }) => {
			class SomeCustomElement extends HTMLParagraphElement {}
			customElements.define('some-custom-element', SomeCustomElement);
			expect(function () {
				new SomeCustomElement();
			}).toThrow(expect.objectContaining({ constructor: TypeError }));
		},
	);
	context.test(
		'Custom element constructor must throw TypeError when it does not extend the proper element interface',
		({ customElements, HTMLButtonElement, TypeError }) => {
			class SomeCustomButtonElement extends HTMLButtonElement {}
			customElements.define('some-custom-button-element', SomeCustomButtonElement, {
				extends: 'p',
			});
			expect(function () {
				new SomeCustomButtonElement();
			}).toThrow(expect.objectContaining({ constructor: TypeError }));
		},
	);
	context.test(
		'HTMLElement constructor must infer the tag name from the element interface',
		({ document, HTMLElement, customElements, Element, Node }) => {
			class CustomElementWithInferredTagName extends HTMLElement {}
			customElements.define('inferred-name', CustomElementWithInferredTagName);

			var instance = new CustomElementWithInferredTagName();
			expect(instance instanceof Element, 'A custom element must inherit from Element').toBe(true);
			expect(instance instanceof Node, 'A custom element must inherit from Node').toBe(true);
			expect(instance.localName).toBe('inferred-name');
			expect(instance.nodeName).toBe('INFERRED-NAME');
			expect(instance.namespaceURI, 'A custom HTML element must use HTML namespace').toBe(
				'http://www.w3.org/1999/xhtml',
			);

			document.body.appendChild(instance);
			expect(
				document.body.lastChild,
				'document.body.appendChild must be able to insert a custom element',
			).toBe(instance);
			expect(
				document.querySelector('inferred-name'),
				'document.querySelector must be able to find a custom element by its tag name',
			).toBe(instance);
		},
	);
	context.test(
		'HTMLElement constructor must allow subclassing a custom element',
		({ HTMLElement, customElements }) => {
			class ConcreteCustomElement extends HTMLElement {}
			class SubCustomElement extends ConcreteCustomElement {}
			customElements.define('concrete-custom-element', ConcreteCustomElement);
			customElements.define('sub-custom-element', SubCustomElement);

			var instance = new ConcreteCustomElement();
			expect(instance instanceof ConcreteCustomElement).toBe(true);
			expect(instance instanceof SubCustomElement).toBe(false);
			expect(instance.localName).toBe('concrete-custom-element');
			expect(instance.nodeName).toBe('CONCRETE-CUSTOM-ELEMENT');

			var instance = new SubCustomElement();
			expect(instance instanceof ConcreteCustomElement).toBe(true);
			expect(instance instanceof SubCustomElement).toBe(true);
			expect(instance.localName).toBe('sub-custom-element');
			expect(instance.nodeName).toBe('SUB-CUSTOM-ELEMENT');
		},
	);
	context.test(
		'HTMLElement constructor must allow subclassing an user-defined subclass of HTMLElement',
		({ HTMLElement, customElements }) => {
			class AbstractCustomElement extends HTMLElement {}
			class ConcreteSubCustomElement extends AbstractCustomElement {}
			customElements.define('concrete-sub-custom-element', ConcreteSubCustomElement);

			var instance = new ConcreteSubCustomElement();
			expect(instance instanceof AbstractCustomElement).toBe(true);
			expect(instance instanceof ConcreteSubCustomElement).toBe(true);
			expect(instance.localName).toBe('concrete-sub-custom-element');
			expect(instance.nodeName).toBe('CONCRETE-SUB-CUSTOM-ELEMENT');
		},
	);
	context.test(
		'HTMLElement constructor must only get .prototype once, calling proxy constructor directly',
		({ HTMLElement, customElements }) => {
			class SomeCustomElement extends HTMLElement {}
			var getCount = 0;
			var countingProxy = new Proxy(SomeCustomElement, {
				get: function (target, prop, receiver) {
					if (prop == 'prototype') {
						++getCount;
					}
					return Reflect.get(target, prop, receiver);
				},
			});
			customElements.define('success-counting-element-1', countingProxy);
			// define() gets the prototype of the constructor it's passed, so
			// reset the counter.
			getCount = 0;
			var instance = new countingProxy();
			expect(getCount, 'Should have gotten .prototype once').toBe(1);
			expect(instance instanceof countingProxy).toBe(true);
			expect(instance instanceof HTMLElement).toBe(true);
			expect(instance instanceof SomeCustomElement).toBe(true);
			expect(instance.localName).toBe('success-counting-element-1');
			expect(instance.nodeName).toBe('SUCCESS-COUNTING-ELEMENT-1');
		},
	);
	context.test(
		'HTMLElement constructor must only get .prototype once, calling proxy constructor via Reflect',
		({ HTMLElement, customElements }) => {
			class SomeCustomElement extends HTMLElement {}
			var getCount = 0;
			var countingProxy = new Proxy(SomeCustomElement, {
				get: function (target, prop, receiver) {
					if (prop == 'prototype') {
						++getCount;
					}
					return Reflect.get(target, prop, receiver);
				},
			});
			customElements.define('success-counting-element-2', countingProxy);
			// define() gets the prototype of the constructor it's passed, so
			// reset the counter.
			getCount = 0;
			var instance = Reflect.construct(HTMLElement, [], countingProxy);
			expect(getCount, 'Should have gotten .prototype once').toBe(1);
			expect(instance instanceof countingProxy).toBe(true);
			expect(instance instanceof HTMLElement).toBe(true);
			expect(instance instanceof SomeCustomElement).toBe(true);
			expect(instance.localName).toBe('success-counting-element-2');
			expect(instance.nodeName).toBe('SUCCESS-COUNTING-ELEMENT-2');
		},
	);
	context.test(
		'HTMLElement constructor must only get .prototype once, calling proxy constructor via Reflect with no inheritance',
		({ HTMLElement, customElements }) => {
			class SomeCustomElement {}
			var getCount = 0;
			var countingProxy = new Proxy(SomeCustomElement, {
				get: function (target, prop, receiver) {
					if (prop == 'prototype') {
						++getCount;
					}
					return Reflect.get(target, prop, receiver);
				},
			});
			customElements.define(
				'success-counting-element-3',
				countingProxy as unknown as CustomElementConstructor,
			);
			// define() gets the prototype of the constructor it's passed, so
			// reset the counter.
			getCount = 0;
			var instance = Reflect.construct(HTMLElement, [], countingProxy);
			expect(getCount, 'Should have gotten .prototype once').toBe(1);
			expect(instance instanceof countingProxy).toBe(true);
			expect(instance instanceof SomeCustomElement).toBe(true);
			expect(instance.localName).toBe(undefined);
			expect(instance.nodeName).toBe(undefined);
		},
	);
	context.test(
		'HTMLElement constructor must not get .prototype until it finishes its registration  sanity checks, calling via Reflect',
		({ HTMLElement, TypeError }) => {
			class SomeCustomElement extends HTMLElement {}
			var getCount = 0;
			var countingProxy = new Proxy(SomeCustomElement, {
				get: function (target, prop, receiver) {
					if (prop == 'prototype') {
						++getCount;
					}
					return Reflect.get(target, prop, receiver);
				},
			});

			// Purposefully don't register it.
			expect(function () {
				Reflect.construct(HTMLElement, [], countingProxy);
			}, "Should not be able to construct an HTMLElement named 'button'").toThrow(
				expect.objectContaining({ constructor: TypeError }),
			);
			expect(getCount, 'Should never have gotten .prototype').toBe(0);
		},
	);
}
