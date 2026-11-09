import type { CompatibilityContext } from '../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	{
		const { expect } = context.runner;
		context.test(
			'CustomElementRegistry interface must have define as a method',
			({ customElements, CustomElementRegistry }) => {
				expect(
					'define' in CustomElementRegistry.prototype,
					'"define" exists on CustomElementRegistry.prototype',
				).toBe(true);
				expect('define' in customElements, '"define" exists on window.customElements').toBe(true);
			},
		);
		context.test(
			'customElements.define must throw when the element interface is not a constructor',
			({ customElements, TypeError }) => {
				expect(function () {
					customElements.define('badname', 1 as unknown as CustomElementConstructor);
				}, 'customElements.define must throw a TypeError when the element interface is a number').toThrow(
					expect.objectContaining({ constructor: TypeError }),
				);
				expect(function () {
					customElements.define('badname', '123' as unknown as CustomElementConstructor);
				}, 'customElements.define must throw a TypeError when the element interface is a string').toThrow(
					expect.objectContaining({ constructor: TypeError }),
				);
				expect(function () {
					customElements.define('badname', {} as unknown as CustomElementConstructor);
				}, 'customElements.define must throw a TypeError when the element interface is an object').toThrow(
					expect.objectContaining({ constructor: TypeError }),
				);
				expect(function () {
					customElements.define('badname', [] as unknown as CustomElementConstructor);
				}, 'customElements.define must throw a TypeError when the element interface is an array').toThrow(
					expect.objectContaining({ constructor: TypeError }),
				);
			},
		);
		context.test(
			'customElements.define must not throw the constructor is HTMLElement',
			({ HTMLElement, customElements }) => {
				customElements.define('custom-html-element', HTMLElement);
			},
		);
		context.test(
			'customElements.define must throw with an invalid name',
			({ HTMLElement, customElements, DOMException }) => {
				class MyCustomElement extends HTMLElement {}

				expect(function () {
					customElements.define(null as unknown as string, MyCustomElement);
				}, 'customElements.define must throw a SyntaxError if the tag name is null').toThrow(
					expect.objectContaining({
						name: 'SyntaxError',
						code: 12,
						constructor: DOMException,
					}),
				);
				expect(function () {
					customElements.define('', MyCustomElement);
				}, 'customElements.define must throw a SyntaxError if the tag name is empty').toThrow(
					expect.objectContaining({
						name: 'SyntaxError',
						code: 12,
						constructor: DOMException,
					}),
				);
				expect(function () {
					customElements.define('abc', MyCustomElement);
				}, 'customElements.define must throw a SyntaxError if the tag name does not contain "-"').toThrow(
					expect.objectContaining({
						name: 'SyntaxError',
						code: 12,
						constructor: DOMException,
					}),
				);
				expect(function () {
					customElements.define('a-Bc', MyCustomElement);
				}, 'customElements.define must throw a SyntaxError if the tag name contains an upper case letter').toThrow(
					expect.objectContaining({
						name: 'SyntaxError',
						code: 12,
						constructor: DOMException,
					}),
				);

				var builtinTagNames = [
					'annotation-xml',
					'color-profile',
					'font-face',
					'font-face-src',
					'font-face-uri',
					'font-face-format',
					'font-face-name',
					'missing-glyph',
				];

				for (var tagName of builtinTagNames) {
					expect(
						function () {
							customElements.define(tagName, MyCustomElement);
						},
						'customElements.define must throw a SyntaxError if the tag name is "' + tagName + '"',
					).toThrow(
						expect.objectContaining({
							name: 'SyntaxError',
							code: 12,
							constructor: DOMException,
						}),
					);
				}
			},
		);
		context.test(
			'customElements.define must throw when there is already a custom element of the same name',
			({ HTMLElement, customElements, DOMException }) => {
				class SomeCustomElement extends HTMLElement {}

				var calls: PropertyKey[] = [];
				var OtherCustomElement = new Proxy(class extends HTMLElement {}, {
					get: function (target, name) {
						calls.push(name);
						return Reflect.get(target, name);
					},
				});

				customElements.define('some-custom-element', SomeCustomElement);
				expect(function () {
					customElements.define('some-custom-element', OtherCustomElement);
				}, 'customElements.define must throw a NotSupportedError if the specified tag name is already used').toThrow(
					expect.objectContaining({
						name: 'NotSupportedError',
						code: 9,
						constructor: DOMException,
					}),
				);
				{
					const actualArray = calls;
					const expectedArray: never[] = [];
					expect(
						actualArray.length,
						'customElements.define must validate the custom element name before getting the prototype of the constructor',
					).toBe(expectedArray.length);
					for (let index = 0; index < expectedArray.length; index++)
						expect(
							actualArray[index],
							'customElements.define must validate the custom element name before getting the prototype of the constructor',
						).toBe(expectedArray[index]);
				}
			},
		);
		context.test(
			'customElements.define must throw a NotSupportedError when there is already a custom element with the same class',
			({ HTMLElement, customElements, DOMException }) => {
				class AnotherCustomElement extends HTMLElement {}

				customElements.define('another-custom-element', AnotherCustomElement);
				expect(function () {
					customElements.define('some-other-element', AnotherCustomElement);
				}, 'customElements.define must throw a NotSupportedError if the specified class already defines an element').toThrow(
					expect.objectContaining({
						name: 'NotSupportedError',
						code: 9,
						constructor: DOMException,
					}),
				);
			},
		);
		context.test(
			'customElements.define must throw a NotSupportedError when element definition is running flag is set',
			({ HTMLElement, customElements, DOMException }) => {
				var outerCalls: PropertyKey[] = [];
				var OuterCustomElement = new Proxy(class extends HTMLElement {}, {
					get: function (target, name) {
						outerCalls.push(name);
						customElements.define('inner-custom-element', InnerCustomElement);
						return Reflect.get(target, name);
					},
				});
				var innerCalls: PropertyKey[] = [];
				var InnerCustomElement = new Proxy(class extends HTMLElement {}, {
					get: function (target, name) {
						outerCalls.push(name);
						return Reflect.get(target, name);
					},
				});

				expect(function () {
					customElements.define('outer-custom-element', OuterCustomElement);
				}, 'customElements.define must throw a NotSupportedError if the specified class already defines an element').toThrow(
					expect.objectContaining({
						name: 'NotSupportedError',
						code: 9,
						constructor: DOMException,
					}),
				);
				{
					const actualArray = outerCalls;
					const expectedArray = ['prototype'];
					expect(actualArray.length, 'customElements.define must get "prototype"').toBe(
						expectedArray.length,
					);
					for (let index = 0; index < expectedArray.length; index++)
						expect(actualArray[index], 'customElements.define must get "prototype"').toBe(
							expectedArray[index],
						);
				}
				{
					const actualArray = innerCalls;
					const expectedArray: never[] = [];
					expect(
						actualArray.length,
						'customElements.define must throw a NotSupportedError when element definition is running flag is set' +
							' before getting the prototype of the constructor',
					).toBe(expectedArray.length);
					for (let index = 0; index < expectedArray.length; index++)
						expect(
							actualArray[index],
							'customElements.define must throw a NotSupportedError when element definition is running flag is set' +
								' before getting the prototype of the constructor',
						).toBe(expectedArray[index]);
				}
			},
		);
		context.test(
			'customElements.define must check IsConstructor on the constructor before checking the element definition is running flag',
			({ HTMLElement, customElements, TypeError }) => {
				var calls: PropertyKey[] = [];
				var ElementWithBadInnerConstructor = new Proxy(class extends HTMLElement {}, {
					get: function (target, name) {
						calls.push(name);
						customElements.define('inner-custom-element', 1 as unknown as CustomElementConstructor);
						return Reflect.get(target, name);
					},
				});

				expect(function () {
					customElements.define(
						'element-with-bad-inner-constructor',
						ElementWithBadInnerConstructor,
					);
				}, 'customElements.define must throw a NotSupportedError if IsConstructor(constructor) is false').toThrow(
					expect.objectContaining({ constructor: TypeError }),
				);

				{
					const actualArray = calls;
					const expectedArray = ['prototype'];
					expect(actualArray.length, 'customElements.define must get "prototype"').toBe(
						expectedArray.length,
					);
					for (let index = 0; index < expectedArray.length; index++)
						expect(actualArray[index], 'customElements.define must get "prototype"').toBe(
							expectedArray[index],
						);
				}
			},
		);
		context.test(
			'customElements.define must validate the custom element name before checking the element definition is running flag',
			({ HTMLElement, customElements, DOMException }) => {
				var calls: PropertyKey[] = [];
				var ElementWithBadInnerName = new Proxy(class extends HTMLElement {}, {
					get: function (target, name) {
						calls.push(name);
						customElements.define('badname', class extends HTMLElement {});
						return Reflect.get(target, name);
					},
				});

				expect(function () {
					customElements.define('element-with-bad-inner-name', ElementWithBadInnerName);
				}, 'customElements.define must throw a SyntaxError if the specified name is not a valid custom element name').toThrow(
					expect.objectContaining({
						name: 'SyntaxError',
						code: 12,
						constructor: DOMException,
					}),
				);

				{
					const actualArray = calls;
					const expectedArray = ['prototype'];
					expect(actualArray.length, 'customElements.define must get "prototype"').toBe(
						expectedArray.length,
					);
					for (let index = 0; index < expectedArray.length; index++)
						expect(actualArray[index], 'customElements.define must get "prototype"').toBe(
							expectedArray[index],
						);
				}
			},
		);
		context.test(
			'customElements.define must define an instantiatable custom element',
			({ HTMLElement, customElements }) => {
				class MyCustomElement extends HTMLElement {}
				customElements.define('my-custom-element', MyCustomElement);

				var instance = new MyCustomElement();
				expect(
					instance instanceof MyCustomElement,
					'An instance of a custom HTML element be an instance of the associated interface',
				).toBe(true);

				expect(
					instance instanceof HTMLElement,
					'An instance of a custom HTML element must inherit from HTMLElement',
				).toBe(true);

				expect(
					instance.localName,
					'An instance of a custom element must use the associated tag name',
				).toBe('my-custom-element');

				expect(instance.namespaceURI, 'A custom element HTML must use HTML namespace').toBe(
					'http://www.w3.org/1999/xhtml',
				);
			},
		);
		context.test(
			'CustomElementRegistry interface must have get as a method',
			({ customElements, CustomElementRegistry }) => {
				expect(
					'get' in CustomElementRegistry.prototype,
					'"get" exists on CustomElementRegistry.prototype',
				).toBe(true);
				expect('get' in customElements, '"get" exists on window.customElements').toBe(true);
			},
		);
		context.test(
			'customElements.get must return undefined when the registry does not contain an entry with the given name',
			({ customElements }) => {
				expect(customElements.get('a-b')).toBe(undefined);
			},
		);
		context.test(
			'customElements.get must return undefined when the registry does not contain an entry with the given name even if the name was not a valid custom element name',
			({ customElements }) => {
				expect(customElements.get('html')).toBe(undefined);
				expect(customElements.get('span')).toBe(undefined);
				expect(customElements.get('div')).toBe(undefined);
				expect(customElements.get('g')).toBe(undefined);
				expect(customElements.get('ab')).toBe(undefined);
			},
		);
		context.test(
			'customElements.get return the constructor of the entry with the given name when there is a matching entry.',
			({ HTMLElement, customElements }) => {
				expect(customElements.get('existing-custom-element')).toBe(undefined);
				class ExistingCustomElement extends HTMLElement {}
				customElements.define('existing-custom-element', ExistingCustomElement);
				expect(customElements.get('existing-custom-element')).toBe(ExistingCustomElement);
			},
		);
		context.test(
			'customElements.whenDefined must return a promise for a valid custom element name',
			({ customElements, Promise }) => {
				expect(customElements.whenDefined('some-name') instanceof Promise).toBe(true);
			},
		);
		context.test(
			'customElements.whenDefined must return the same promise each time invoked for a valid custom element name which has not been defined',
			({ customElements }) => {
				expect(customElements.whenDefined('some-name')).toBe(
					customElements.whenDefined('some-name'),
				);
			},
		);
		context.test(
			'customElements.whenDefined must return an unresolved promise when the registry does not contain the entry with the given name',
			async ({ customElements, Promise }) => {
				var resolved = false;
				var rejected = false;
				customElements.whenDefined('a-b').then(
					function () {
						resolved = true;
					},
					function () {
						rejected = true;
					},
				);
				return Promise.resolve().then(function () {
					expect(
						resolved,
						'The promise returned by "whenDefined" must not be resolved until a custom element is defined',
					).toBe(false);
					expect(
						rejected,
						'The promise returned by "whenDefined" must not be rejected until a custom element is defined',
					).toBe(false);
				});
			},
		);
		context.test(
			'customElements.whenDefined must return a rejected promise when the given name is not a valid custom element name',
			async ({ customElements, Promise }) => {
				var promise = customElements.whenDefined('badname') as Promise<CustomElementConstructor> & {
					resolved?: unknown;
					rejected?: unknown;
				};
				promise.then(
					function (value) {
						promise.resolved = value;
					},
					function (value) {
						promise.rejected = value;
					},
				);

				expect(
					'resolved' in promise,
					'The promise returned by "whenDefined" must not be resolved until the end of the next microtask',
				).toBe(false);
				expect(
					'rejected' in promise,
					'The promise returned by "whenDefined" must not be rejected until the end of the next microtask',
				).toBe(false);

				return Promise.resolve().then(function () {
					expect(
						'resolved' in promise,
						'The promise returned by "whenDefined" must be resolved when a custom element is defined',
					).toBe(false);
					expect(
						'rejected' in promise,
						'The promise returned by "whenDefined" must not be rejected when a custom element is defined',
					).toBe(true);
				});
			},
		);
		context.test(
			'customElements.whenDefined must return a resolved promise when the registry contains the entry with the given name',
			async ({ HTMLElement, customElements, Promise }) => {
				class PreexistingCustomElement extends HTMLElement {}
				customElements.define('preexisting-custom-element', PreexistingCustomElement);

				var promise = customElements.whenDefined(
					'preexisting-custom-element',
				) as Promise<CustomElementConstructor> & { resolved?: unknown; rejected?: unknown };
				promise.then(
					function (value) {
						promise.resolved = value;
					},
					function (value) {
						promise.rejected = value;
					},
				);

				expect(
					'resolved' in promise,
					'The promise returned by "whenDefined" must not be resolved until the end of the next microtask',
				).toBe(false);
				expect(
					'rejected' in promise,
					'The promise returned by "whenDefined" must not be rejected until the end of the next microtask',
				).toBe(false);

				return Promise.resolve().then(function () {
					expect(
						'resolved' in promise,
						'The promise returned by "whenDefined" must be resolved when a custom element is defined',
					).toBe(true);
					expect(
						promise.resolved,
						'The promise returned by "whenDefined" must be resolved with the constructor of the element when a custom element is defined',
					).toBe(PreexistingCustomElement);
					expect(
						'rejected' in promise,
						'The promise returned by "whenDefined" must not be rejected when a custom element is defined',
					).toBe(false);
				});
			},
		);
		context.test(
			'customElements.whenDefined must return a new resolved promise each time invoked when the registry contains the entry with the given name',
			async ({ HTMLElement, customElements, Promise }) => {
				class AnotherExistingCustomElement extends HTMLElement {}
				customElements.define('another-existing-custom-element', AnotherExistingCustomElement);

				var promise1 = customElements.whenDefined(
					'another-existing-custom-element',
				) as Promise<CustomElementConstructor> & { resolved?: unknown; rejected?: unknown };
				var promise2 = customElements.whenDefined(
					'another-existing-custom-element',
				) as Promise<CustomElementConstructor> & { resolved?: unknown; rejected?: unknown };
				promise1.then(
					function (value) {
						promise1.resolved = value;
					},
					function (value) {
						promise1.rejected = value;
					},
				);
				promise2.then(
					function (value) {
						promise2.resolved = value;
					},
					function (value) {
						promise2.rejected = value;
					},
				);

				expect(promise1).not.toBe(promise2);
				expect(
					'resolved' in promise1,
					'The promise returned by "whenDefined" must not be resolved until the end of the next microtask',
				).toBe(false);
				expect(
					'resolved' in promise2,
					'The promise returned by "whenDefined" must not be resolved until the end of the next microtask',
				).toBe(false);
				expect(
					'rejected' in promise1,
					'The promise returned by "whenDefined" must not be rejected until the end of the next microtask',
				).toBe(false);
				expect(
					'rejected' in promise2,
					'The promise returned by "whenDefined" must not be rejected until the end of the next microtask',
				).toBe(false);

				return Promise.resolve().then(function () {
					expect(
						'resolved' in promise1,
						'The promise returned by "whenDefined" must be resolved when a custom element is defined',
					).toBe(true);
					expect(
						promise1.resolved,
						'The promise returned by "whenDefined" must be resolved with the constructor of the element when a custom element is defined',
					).toBe(AnotherExistingCustomElement);
					expect(
						'rejected' in promise1,
						'The promise returned by "whenDefined" must not be rejected when a custom element is defined',
					).toBe(false);

					expect(
						'resolved' in promise2,
						'The promise returned by "whenDefined" must be resolved when a custom element is defined',
					).toBe(true);
					expect(
						promise2.resolved,
						'The promise returned by "whenDefined" must be resolved with the constructor of the element when a custom element is defined',
					).toBe(AnotherExistingCustomElement);
					expect(
						'rejected' in promise2,
						'The promise returned by "whenDefined" must not be rejected when a custom element is defined',
					).toBe(false);
				});
			},
		);
		context.test(
			'A promise returned by customElements.whenDefined must be resolved by "define"',
			async ({ HTMLElement, customElements, Promise }) => {
				class ElementDefinedAfterWhenDefined extends HTMLElement {}
				var promise = customElements.whenDefined(
					'element-defined-after-whendefined',
				) as Promise<CustomElementConstructor> & { resolved?: unknown; rejected?: unknown };
				promise.then(
					function (value) {
						promise.resolved = value;
					},
					function (value) {
						promise.rejected = value;
					},
				);

				expect(
					'resolved' in promise,
					'The promise returned by "whenDefined" must not be resolved until the end of the next microtask',
				).toBe(false);
				expect(
					'rejected' in promise,
					'The promise returned by "whenDefined" must not be rejected until the end of the next microtask',
				).toBe(false);

				var promiseAfterDefine: Promise<CustomElementConstructor> & {
					resolved?: unknown;
					rejected?: unknown;
				};
				return Promise.resolve()
					.then(function () {
						expect(
							'resolved' in promise,
							'The promise returned by "whenDefined" must not be resolved until the element is defined',
						).toBe(false);
						expect(
							'rejected' in promise,
							'The promise returned by "whenDefined" must not be rejected until the element is defined',
						).toBe(false);
						expect(
							customElements.whenDefined('element-defined-after-whendefined'),
							'"whenDefined" must return the same unresolved promise before the custom element is defined',
						).toBe(promise);
						customElements.define(
							'element-defined-after-whendefined',
							ElementDefinedAfterWhenDefined,
						);
						expect(
							'resolved' in promise,
							'The promise returned by "whenDefined" must not be resolved until the end of the next microtask',
						).toBe(false);
						expect(
							'rejected' in promise,
							'The promise returned by "whenDefined" must not be rejected until the end of the next microtask',
						).toBe(false);

						promiseAfterDefine = customElements.whenDefined('element-defined-after-whendefined');
						promiseAfterDefine.then(
							function (value) {
								promiseAfterDefine.resolved = value;
							},
							function (value) {
								promiseAfterDefine.rejected = value;
							},
						);
						expect(
							promiseAfterDefine,
							'"whenDefined" must return a resolved promise once the custom element is defined',
						).not.toBe(promise);
						expect(
							'resolved' in promiseAfterDefine,
							'The promise returned by "whenDefined" must not be resolved until the end of the next microtask',
						).toBe(false);
						expect(
							'rejected' in promiseAfterDefine,
							'The promise returned by "whenDefined" must not be rejected until the end of the next microtask',
						).toBe(false);
					})
					.then(function () {
						expect(
							'resolved' in promise,
							'The promise returned by "whenDefined" must be resolved when a custom element is defined',
						).toBe(true);
						expect(
							promise.resolved,
							'The promise returned by "whenDefined" must be resolved with the constructor of the element when a custom element is defined',
						).toBe(ElementDefinedAfterWhenDefined);
						expect(
							'rejected' in promise,
							'The promise returned by "whenDefined" must not be rejected when a custom element is defined',
						).toBe(false);

						expect(
							'resolved' in promiseAfterDefine,
							'The promise returned by "whenDefined" must be resolved when a custom element is defined',
						).toBe(true);
						expect(
							promiseAfterDefine.resolved,
							'The promise returned by "whenDefined" must be resolved with the constructor of the element when a custom element is defined',
						).toBe(ElementDefinedAfterWhenDefined);
						expect(
							'rejected' in promiseAfterDefine,
							'The promise returned by "whenDefined" must not be rejected when a custom element is defined',
						).toBe(false);
					});
			},
		);
		context.test(
			'A promise returned by customElements.whenDefined must be resolved with the defined class',
			async ({ HTMLElement, customElements }) => {
				class ResolvedCustomElement extends HTMLElement {}
				customElements.define('resolved-custom-element', ResolvedCustomElement);
				return customElements.whenDefined('resolved-custom-element').then(function (value) {
					expect(
						value,
						'The promise returned by "whenDefined" must resolve with the defined class',
					).toBe(ResolvedCustomElement);
				});
			},
		);
		context.test(
			'A promise returned by customElements.whenDefined must be resolved with the defined class once such class is defined',
			async ({ HTMLElement, customElements }) => {
				var promise = customElements
					.whenDefined('not-resolved-yet-custom-element')
					.then(function (value) {
						expect(
							value,
							'The promise returned by "whenDefined" must resolve with the defined class once such class is defined',
						).toBe(NotResolvedYetCustomElement) as Promise<CustomElementConstructor> & {
							resolved?: unknown;
							rejected?: unknown;
						};
					});
				class NotResolvedYetCustomElement extends HTMLElement {}
				customElements.define('not-resolved-yet-custom-element', NotResolvedYetCustomElement);
				return promise;
			},
		);
	}
	{
		const { expect } = context.runner;
		context.test(
			'customElements.define must upgrade elements in the shadow-including tree order',
			({ document, HTMLElement, customElements }) => {
				var disconnectedElement = document.createElement('some-custom');
				var connectedElementBeforeShadowHost = document.createElement('some-custom');
				var connectedElementAfterShadowHost = document.createElement('some-custom');
				var elementInShadowTree = document.createElement('some-custom');
				var childElementOfShadowHost = document.createElement('some-custom');
				var customShadowHost = document.createElement('some-custom');
				var elementInNestedShadowTree = document.createElement('some-custom');

				var container = document.createElement('div');
				var shadowHost = document.createElement('div');
				var shadowRoot = shadowHost.attachShadow({ mode: 'closed' });
				container.appendChild(connectedElementBeforeShadowHost);
				container.appendChild(shadowHost);
				container.appendChild(connectedElementAfterShadowHost);
				shadowHost.appendChild(childElementOfShadowHost);
				shadowRoot.appendChild(elementInShadowTree);
				shadowRoot.appendChild(customShadowHost);

				var innerShadowRoot = customShadowHost.attachShadow({ mode: 'closed' });
				innerShadowRoot.appendChild(elementInNestedShadowTree);

				var calls: HTMLElement[] = [];
				class SomeCustomElement extends HTMLElement {
					constructor() {
						super();
						calls.push(this);
					}
				}

				document.body.appendChild(container);
				customElements.define('some-custom', SomeCustomElement);
				{
					const actualArray = calls;
					const expectedArray = [
						connectedElementBeforeShadowHost,
						elementInShadowTree,
						customShadowHost,
						elementInNestedShadowTree,
						childElementOfShadowHost,
						connectedElementAfterShadowHost,
					];
					expect(actualArray.length).toBe(expectedArray.length);
					for (let index = 0; index < expectedArray.length; index++)
						expect(actualArray[index]).toBe(expectedArray[index]);
				}
			},
		);
	}

	{
		const { expect } = context.runner;
		context.test(
			'customElements.define unset the element definition is running flag before upgrading custom elements',
			({ HTMLElement, customElements, document, step }) => {
				var unresolvedElement = document.createElement('constructor-calls-define');
				document.body.appendChild(unresolvedElement);
				var elementUpgradedDuringUpgrade = document.createElement('defined-during-upgrade');
				document.body.appendChild(elementUpgradedDuringUpgrade);

				var DefinedDuringUpgrade = class extends HTMLElement {};

				class ConstructorCallsDefine extends HTMLElement {
					constructor() {
						customElements.define('defined-during-upgrade', DefinedDuringUpgrade);
						step(() => expect(unresolvedElement instanceof ConstructorCallsDefine).toBe(false))();
						step(() =>
							expect(elementUpgradedDuringUpgrade instanceof DefinedDuringUpgrade).toBe(true),
						)();
						super();
						step(() => expect(unresolvedElement instanceof ConstructorCallsDefine).toBe(true))();
						step(() =>
							expect(elementUpgradedDuringUpgrade instanceof DefinedDuringUpgrade).toBe(true),
						)();
					}
				}

				step(() => expect(unresolvedElement instanceof ConstructorCallsDefine).toBe(false))();
				step(() =>
					expect(elementUpgradedDuringUpgrade instanceof DefinedDuringUpgrade).toBe(false),
				)();

				customElements.define('constructor-calls-define', ConstructorCallsDefine);
			},
		);
		context.test(
			'Custom Elements: CustomElementRegistry interface',
			({ DOMException, HTMLElement, customElements }) => {
				var calls: PropertyKey[] = [];
				var ElementWithBadInnerName = new Proxy(class extends HTMLElement {}, {
					get: function (target, name) {
						calls.push(name);
						customElements.define('badname', class extends HTMLElement {});
						return (target as unknown as Record<PropertyKey, unknown>)[name];
					},
				});

				expect(function () {
					customElements.define('element-with-bad-inner-name', ElementWithBadInnerName);
				}, 'customElements.define must throw a SyntaxError if the specified name is not a valid custom element name').toThrow(
					expect.objectContaining({ name: 'SyntaxError', code: 12, constructor: DOMException }),
				);

				{
					const actualArray = calls;
					const expectedArray = ['prototype'];
					expect(actualArray.length, 'customElements.define must get "prototype"').toBe(
						expectedArray.length,
					);
					for (let index = 0; index < expectedArray.length; index++)
						expect(actualArray[index], 'customElements.define must get "prototype"').toBe(
							expectedArray[index],
						);
				}
			},
		);
		context.test(
			'customElements.define must get "prototype", "disabledFeatures", and "formAssociated" property of the constructor',
			({ HTMLElement, customElements }) => {
				var calls: PropertyKey[] = [];
				var proxy = new Proxy(class extends HTMLElement {}, {
					get: function (target, name) {
						calls.push(name);
						return (target as unknown as Record<PropertyKey, unknown>)[name];
					},
				});
				customElements.define('proxy-element', proxy as unknown as CustomElementConstructor);
				{
					const actualArray = calls;
					const expectedArray = ['prototype', 'disabledFeatures', 'formAssociated'];
					expect(actualArray.length).toBe(expectedArray.length);
					for (let index = 0; index < expectedArray.length; index++)
						expect(actualArray[index]).toBe(expectedArray[index]);
				}
			},
		);
		context.test(
			'customElements.define must rethrow an exception thrown while getting "prototype" property of the constructor',
			({ HTMLElement, customElements }) => {
				var err = { name: 'expectedError' };
				var proxy = new Proxy(class extends HTMLElement {}, {
					get: function (target, name) {
						throw err;
					},
				});
				{
					let thrown: unknown;
					let didThrow = false;
					try {
						(function () {
							customElements.define(
								'element-with-string-prototype',
								proxy as unknown as CustomElementConstructor,
							);
						})();
					} catch (error) {
						didThrow = true;
						thrown = error;
					}
					expect(didThrow).toBe(true);
					expect(thrown).toBe(err);
				}
			},
		);
		context.test(
			'customElements.define must throw when "prototype" property of the constructor is not an object',
			({ HTMLElement, TypeError, customElements }) => {
				var returnedValue: unknown;
				var proxy = new Proxy(class extends HTMLElement {}, {
					get: function (target, name) {
						return returnedValue;
					},
				});

				returnedValue = null;
				expect(function () {
					customElements.define(
						'element-with-string-prototype',
						proxy as unknown as CustomElementConstructor,
					);
				}, 'customElements.define must throw when "prototype" property of the constructor is null').toThrow(
					expect.objectContaining({ constructor: TypeError }),
				);
				returnedValue = undefined;
				expect(function () {
					customElements.define(
						'element-with-string-prototype',
						proxy as unknown as CustomElementConstructor,
					);
				}, 'customElements.define must throw when "prototype" property of the constructor is undefined').toThrow(
					expect.objectContaining({ constructor: TypeError }),
				);
				returnedValue = 'hello';
				expect(function () {
					customElements.define(
						'element-with-string-prototype',
						proxy as unknown as CustomElementConstructor,
					);
				}, 'customElements.define must throw when "prototype" property of the constructor is a string').toThrow(
					expect.objectContaining({ constructor: TypeError }),
				);
				returnedValue = 1;
				expect(function () {
					customElements.define(
						'element-with-string-prototype',
						proxy as unknown as CustomElementConstructor,
					);
				}, 'customElements.define must throw when "prototype" property of the constructor is a number').toThrow(
					expect.objectContaining({ constructor: TypeError }),
				);
			},
		);
		context.test(
			'customElements.define must get callbacks of the constructor prototype',
			({ Element, customElements }) => {
				const moveBefore_supported = 'moveBefore' in Element.prototype;

				var constructor: (() => void) & {
					observedAttributes?: unknown;
					disabledFeatures?: unknown;
				} = function () {};
				var calls: PropertyKey[] = [];
				constructor.prototype = new Proxy(constructor.prototype, {
					get: function (target, name) {
						calls.push(name);
						return (target as unknown as Record<PropertyKey, unknown>)[name];
					},
				});
				customElements.define(
					'element-with-proxy-prototype',
					constructor as unknown as CustomElementConstructor,
				);
				{
					const actualArray = calls;
					const expectedArray = moveBefore_supported
						? [
								'connectedCallback',
								'disconnectedCallback',
								'connectedMoveCallback',
								'adoptedCallback',
								'attributeChangedCallback',
							]
						: [
								'connectedCallback',
								'disconnectedCallback',
								'adoptedCallback',
								'attributeChangedCallback',
							];
					expect(actualArray.length).toBe(expectedArray.length);
					for (let index = 0; index < expectedArray.length; index++)
						expect(actualArray[index]).toBe(expectedArray[index]);
				}
			},
		);
		context.test(
			'customElements.define must rethrow an exception thrown while getting callbacks on the constructor prototype',
			({ customElements }) => {
				var constructor: (() => void) & {
					observedAttributes?: unknown;
					disabledFeatures?: unknown;
				} = function () {};
				var calls: PropertyKey[] = [];
				var err = { name: 'expectedError' };
				constructor.prototype = new Proxy(constructor.prototype, {
					get: function (target, name) {
						calls.push(name);
						if (name == 'disconnectedCallback') throw err;
						return (target as unknown as Record<PropertyKey, unknown>)[name];
					},
				});
				{
					let thrown: unknown;
					let didThrow = false;
					try {
						(function () {
							customElements.define(
								'element-with-throwing-callback',
								constructor as unknown as CustomElementConstructor,
							);
						})();
					} catch (error) {
						didThrow = true;
						thrown = error;
					}
					expect(didThrow).toBe(true);
					expect(thrown).toBe(err);
				}
				{
					const actualArray = calls;
					const expectedArray = ['connectedCallback', 'disconnectedCallback'];
					expect(
						actualArray.length,
						'customElements.define must not get callbacks after one of the get throws',
					).toBe(expectedArray.length);
					for (let index = 0; index < expectedArray.length; index++)
						expect(
							actualArray[index],
							'customElements.define must not get callbacks after one of the get throws',
						).toBe(expectedArray[index]);
				}
			},
		);
		context.test(
			'customElements.define must rethrow an exception thrown while converting a callback value to Function callback type',
			({ Element, TypeError, customElements }) => {
				const moveBefore_supported = 'moveBefore' in Element.prototype;

				var constructor: (() => void) & {
					observedAttributes?: unknown;
					disabledFeatures?: unknown;
				} = function () {};
				var calls: PropertyKey[] = [];
				constructor.prototype = new Proxy(constructor.prototype, {
					get: function (target, name) {
						calls.push(name);
						if (name == 'adoptedCallback') return 1;
						return (target as unknown as Record<PropertyKey, unknown>)[name];
					},
				});
				expect(function () {
					customElements.define(
						'element-with-throwing-callback',
						constructor as unknown as CustomElementConstructor,
					);
				}).toThrow(expect.objectContaining({ constructor: TypeError }));
				{
					const actualArray = calls;
					const expectedArray = moveBefore_supported
						? [
								'connectedCallback',
								'disconnectedCallback',
								'connectedMoveCallback',
								'adoptedCallback',
							]
						: ['connectedCallback', 'disconnectedCallback', 'adoptedCallback'];
					expect(
						actualArray.length,
						'customElements.define must not get callbacks after one of the conversion throws',
					).toBe(expectedArray.length);
					for (let index = 0; index < expectedArray.length; index++)
						expect(
							actualArray[index],
							'customElements.define must not get callbacks after one of the conversion throws',
						).toBe(expectedArray[index]);
				}
			},
		);
		context.test(
			'customElements.define must get "observedAttributes" property on the constructor prototype when "attributeChangedCallback" is present',
			({ Element, customElements }) => {
				const moveBefore_supported = 'moveBefore' in Element.prototype;

				var constructor: (() => void) & {
					observedAttributes?: unknown;
					disabledFeatures?: unknown;
				} = function () {};
				constructor.prototype.attributeChangedCallback = function () {};
				var prototypeCalls: (PropertyKey | number)[] = [];
				var callOrder = 0;
				constructor.prototype = new Proxy(constructor.prototype, {
					get: function (target, name) {
						if (name == 'prototype' || name == 'observedAttributes')
							throw 'Unexpected access to observedAttributes';
						prototypeCalls.push(callOrder++);
						prototypeCalls.push(name);
						return (target as unknown as Record<PropertyKey, unknown>)[name];
					},
				});
				var constructorCalls: (PropertyKey | number)[] = [];
				var proxy = new Proxy(constructor, {
					get: function (target, name) {
						constructorCalls.push(callOrder++);
						constructorCalls.push(name);
						return (target as unknown as Record<PropertyKey, unknown>)[name];
					},
				});
				customElements.define(
					'element-with-attribute-changed-callback',
					proxy as unknown as CustomElementConstructor,
				);
				{
					const actualArray = prototypeCalls;
					const expectedArray = moveBefore_supported
						? [
								1,
								'connectedCallback',
								2,
								'disconnectedCallback',
								3,
								'connectedMoveCallback',
								4,
								'adoptedCallback',
								5,
								'attributeChangedCallback',
							]
						: [
								1,
								'connectedCallback',
								2,
								'disconnectedCallback',
								3,
								'adoptedCallback',
								4,
								'attributeChangedCallback',
							];
					expect(actualArray.length).toBe(expectedArray.length);
					for (let index = 0; index < expectedArray.length; index++)
						expect(actualArray[index]).toBe(expectedArray[index]);
				}
				{
					const actualArray = constructorCalls;
					const expectedArray = [
						0,
						'prototype',
						6,
						'observedAttributes',
						7,
						'disabledFeatures',
						8,
						'formAssociated',
					];
					expect(actualArray.length).toBe(expectedArray.length);
					for (let index = 0; index < expectedArray.length; index++)
						expect(actualArray[index]).toBe(expectedArray[index]);
				}
			},
		);
		context.test(
			'customElements.define must rethrow an exception thrown while getting observedAttributes on the constructor prototype',
			({ customElements }) => {
				var constructor: (() => void) & {
					observedAttributes?: unknown;
					disabledFeatures?: unknown;
				} = function () {};
				constructor.prototype.attributeChangedCallback = function () {};
				var calls: PropertyKey[] = [];
				var err = { name: 'expectedError' };
				var proxy = new Proxy(constructor, {
					get: function (target, name) {
						calls.push(name);
						if (name == 'observedAttributes') throw err;
						return (target as unknown as Record<PropertyKey, unknown>)[name];
					},
				});
				{
					let thrown: unknown;
					let didThrow = false;
					try {
						(function () {
							customElements.define(
								'element-with-throwing-observed-attributes',
								proxy as unknown as CustomElementConstructor,
							);
						})();
					} catch (error) {
						didThrow = true;
						thrown = error;
					}
					expect(didThrow).toBe(true);
					expect(thrown).toBe(err);
				}
				{
					const actualArray = calls;
					const expectedArray = ['prototype', 'observedAttributes'];
					expect(
						actualArray.length,
						'customElements.define must get "prototype" and "observedAttributes" on the constructor',
					).toBe(expectedArray.length);
					for (let index = 0; index < expectedArray.length; index++)
						expect(
							actualArray[index],
							'customElements.define must get "prototype" and "observedAttributes" on the constructor',
						).toBe(expectedArray[index]);
				}
			},
		);
		context.test(
			'customElements.define must rethrow an exception thrown while converting the value of observedAttributes to sequence<DOMString>',
			({ TypeError, customElements }) => {
				var constructor: (() => void) & {
					observedAttributes?: unknown;
					disabledFeatures?: unknown;
				} = function () {};
				constructor.prototype.attributeChangedCallback = function () {};
				var calls: PropertyKey[] = [];
				var proxy = new Proxy(constructor, {
					get: function (target, name) {
						calls.push(name);
						if (name == 'observedAttributes') return 1;
						return (target as unknown as Record<PropertyKey, unknown>)[name];
					},
				});
				expect(function () {
					customElements.define(
						'element-with-invalid-observed-attributes',
						proxy as unknown as CustomElementConstructor,
					);
				}).toThrow(expect.objectContaining({ constructor: TypeError }));
				{
					const actualArray = calls;
					const expectedArray = ['prototype', 'observedAttributes'];
					expect(
						actualArray.length,
						'customElements.define must get "prototype" and "observedAttributes" on the constructor',
					).toBe(expectedArray.length);
					for (let index = 0; index < expectedArray.length; index++)
						expect(
							actualArray[index],
							'customElements.define must get "prototype" and "observedAttributes" on the constructor',
						).toBe(expectedArray[index]);
				}
			},
		);
		context.test(
			'customElements.define must rethrow an exception thrown while iterating over observedAttributes to sequence<DOMString>',
			({ customElements }) => {
				var err = { name: 'SomeError' };
				var constructor: (() => void) & {
					observedAttributes?: unknown;
					disabledFeatures?: unknown;
				} = function () {};
				constructor.prototype.attributeChangedCallback = function () {};
				constructor.observedAttributes = {
					[Symbol.iterator]: function* () {
						yield 'foo';
						throw err;
					},
				};
				{
					let thrown: unknown;
					let didThrow = false;
					try {
						(function () {
							customElements.define(
								'element-with-generator-observed-attributes',
								constructor as unknown as CustomElementConstructor,
							);
						})();
					} catch (error) {
						didThrow = true;
						thrown = error;
					}
					expect(didThrow).toBe(true);
					expect(thrown).toBe(err);
				}
			},
		);
		context.test(
			'customElements.define must rethrow an exception thrown while retrieving Symbol.iterator on observedAttributes',
			({ TypeError, customElements }) => {
				var constructor: (() => void) & {
					observedAttributes?: unknown;
					disabledFeatures?: unknown;
				} = function () {};
				constructor.prototype.attributeChangedCallback = function () {};
				constructor.observedAttributes = { [Symbol.iterator]: 1 };
				expect(function () {
					customElements.define(
						'element-with-observed-attributes-with-uncallable-iterator',
						constructor as unknown as CustomElementConstructor,
					);
				}).toThrow(expect.objectContaining({ constructor: TypeError }));
			},
		);
		context.test(
			'customElements.define must not throw even if "observedAttributes" fails to convert if "attributeChangedCallback" is not defined',
			({ customElements }) => {
				var constructor: (() => void) & {
					observedAttributes?: unknown;
					disabledFeatures?: unknown;
				} = function () {};
				constructor.observedAttributes = 1;
				customElements.define(
					'element-without-callback-with-invalid-observed-attributes',
					constructor as unknown as CustomElementConstructor,
				);
			},
		);
		context.test(
			'customElements.define must rethrow an exception thrown while getting disabledFeatures on the constructor prototype',
			({ customElements }) => {
				var constructor: (() => void) & {
					observedAttributes?: unknown;
					disabledFeatures?: unknown;
				} = function () {};
				var calls: PropertyKey[] = [];
				var err = { name: 'expectedError' };
				var proxy = new Proxy(constructor, {
					get: function (target, name) {
						calls.push(name);
						if (name == 'disabledFeatures') throw err;
						return (target as unknown as Record<PropertyKey, unknown>)[name];
					},
				});
				{
					let thrown: unknown;
					let didThrow = false;
					try {
						(() =>
							customElements.define(
								'element-with-throwing-disabled-features',
								proxy as unknown as CustomElementConstructor,
							))();
					} catch (error) {
						didThrow = true;
						thrown = error;
					}
					expect(didThrow).toBe(true);
					expect(thrown).toBe(err);
				}
				{
					const actualArray = calls;
					const expectedArray = ['prototype', 'disabledFeatures'];
					expect(
						actualArray.length,
						'customElements.define must get "prototype" and "disabledFeatures" on the constructor',
					).toBe(expectedArray.length);
					for (let index = 0; index < expectedArray.length; index++)
						expect(
							actualArray[index],
							'customElements.define must get "prototype" and "disabledFeatures" on the constructor',
						).toBe(expectedArray[index]);
				}
			},
		);
		context.test(
			'customElements.define must rethrow an exception thrown while converting the value of disabledFeatures to sequence<DOMString>',
			({ TypeError, customElements }) => {
				var constructor: (() => void) & {
					observedAttributes?: unknown;
					disabledFeatures?: unknown;
				} = function () {};
				var calls: PropertyKey[] = [];
				var proxy = new Proxy(constructor, {
					get: function (target, name) {
						calls.push(name);
						if (name == 'disabledFeatures') return 1;
						return (target as unknown as Record<PropertyKey, unknown>)[name];
					},
				});
				expect(() =>
					customElements.define(
						'element-with-invalid-disabled-features',
						proxy as unknown as CustomElementConstructor,
					),
				).toThrow(expect.objectContaining({ constructor: TypeError }));
				{
					const actualArray = calls;
					const expectedArray = ['prototype', 'disabledFeatures'];
					expect(
						actualArray.length,
						'customElements.define must get "prototype" and "disabledFeatures" on the constructor',
					).toBe(expectedArray.length);
					for (let index = 0; index < expectedArray.length; index++)
						expect(
							actualArray[index],
							'customElements.define must get "prototype" and "disabledFeatures" on the constructor',
						).toBe(expectedArray[index]);
				}
			},
		);
		context.test(
			'customElements.define must rethrow an exception thrown while iterating over disabledFeatures to sequence<DOMString>',
			({ customElements }) => {
				var constructor: (() => void) & {
					observedAttributes?: unknown;
					disabledFeatures?: unknown;
				} = function () {};
				var err = { name: 'SomeError' };
				constructor.disabledFeatures = {
					[Symbol.iterator]: function* () {
						yield 'foo';
						throw err;
					},
				};
				{
					let thrown: unknown;
					let didThrow = false;
					try {
						(() =>
							customElements.define(
								'element-with-generator-disabled-features',
								constructor as unknown as CustomElementConstructor,
							))();
					} catch (error) {
						didThrow = true;
						thrown = error;
					}
					expect(didThrow).toBe(true);
					expect(thrown).toBe(err);
				}
			},
		);
		context.test(
			'customElements.define must rethrow an exception thrown while retrieving Symbol.iterator on disabledFeatures',
			({ TypeError, customElements }) => {
				var constructor: (() => void) & {
					observedAttributes?: unknown;
					disabledFeatures?: unknown;
				} = function () {};
				constructor.disabledFeatures = { [Symbol.iterator]: 1 };
				expect(() =>
					customElements.define(
						'element-with-disabled-features-with-uncallable-iterator',
						constructor as unknown as CustomElementConstructor,
					),
				).toThrow(expect.objectContaining({ constructor: TypeError }));
			},
		);
	}

	{
		const { expect } = context.runner;
		context.test(
			'customElements.define must not throw when defining another custom element in a different global object during Get(constructor, "prototype")',
			async ({ document, HTMLElement, customElements, step, cleanup }) => {
				await new Promise<void>((resolve) => {
					const iframe = document.createElement('iframe');
					cleanup(() => iframe.remove());
					iframe.onload = () => {
						step(() => {
							const innerWindow = iframe.contentWindow as Window & typeof globalThis;
							var InnerCustomElement = class extends innerWindow.HTMLElement {};
							var calls: PropertyKey[] = [];
							var proxy = new Proxy(class extends HTMLElement {}, {
								get(target, name) {
									calls.push(name);
									if (name === 'prototype')
										innerWindow.customElements.define('another-custom-element', InnerCustomElement);
									return (target as unknown as Record<PropertyKey, unknown>)[name];
								},
							});
							customElements.define('element-with-inner-element-define', proxy);
							const expected = ['prototype', 'disabledFeatures', 'formAssociated'];
							expect(
								calls.length,
								'customElements.define must get "prototype", "disabledFeatures", and "formAssociated" on the constructor',
							).toBe(expected.length);
							for (let i = 0; i < expected.length; i++)
								expect(
									calls[i],
									'customElements.define must get "prototype", "disabledFeatures", and "formAssociated" on the constructor',
								).toBe(expected[i]);
							expect(
								iframe.contentDocument!.createElement('another-custom-element') instanceof
									InnerCustomElement,
							).toBe(true);
						})();
						document.body.removeChild(iframe);
						resolve();
					};
					document.body.appendChild(iframe);
				});
			},
		);
	}
}
