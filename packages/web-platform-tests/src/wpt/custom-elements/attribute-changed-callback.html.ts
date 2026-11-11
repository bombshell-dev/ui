import type { CompatibilityContext } from '../../shared/context.ts';
import {
	define_new_custom_element,
	create_attribute_changed_callback_log,
	assert_attribute_log_entry,
	type AttributeArguments,
	type CallbackLog,
} from './resources/custom-elements-helpers.js.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'setAttribute and removeAttribute must enqueue and invoke attributeChangedCallback',
		({ document, HTMLElement, customElements }) => {
			var customElement = define_new_custom_element(HTMLElement, customElements, [
				'title',
				'id',
				'r',
			]);

			const instance = document.createElement(customElement.name);
			{
				const actualArray = customElement.takeLog().types();
				const expectedArray = ['constructed'];
				expect(actualArray.length).toBe(expectedArray.length);
				for (let index = 0; index < expectedArray.length; index++)
					expect(actualArray[index]).toBe(expectedArray[index]);
			}

			instance.setAttribute('title', 'foo');
			expect(instance.getAttribute('title')).toBe('foo');
			var logEntries = customElement.takeLog();
			{
				const actualArray = logEntries.types();
				const expectedArray = ['attributeChanged'];
				expect(actualArray.length).toBe(expectedArray.length);
				for (let index = 0; index < expectedArray.length; index++)
					expect(actualArray[index]).toBe(expectedArray[index]);
			}
			assert_attribute_log_entry(expect, logEntries.last(), {
				name: 'title',
				oldValue: null,
				newValue: 'foo',
				namespace: null,
			});

			instance.removeAttribute('title');
			expect(instance.getAttribute('title')).toBe(null);
			var logEntries = customElement.takeLog();
			{
				const actualArray = logEntries.types();
				const expectedArray = ['attributeChanged'];
				expect(actualArray.length).toBe(expectedArray.length);
				for (let index = 0; index < expectedArray.length; index++)
					expect(actualArray[index]).toBe(expectedArray[index]);
			}
			assert_attribute_log_entry(expect, logEntries.last(), {
				name: 'title',
				oldValue: 'foo',
				newValue: null,
				namespace: null,
			});
		},
	);
	context.test(
		'setAttributeNS and removeAttributeNS must enqueue and invoke attributeChangedCallback',
		({ document, HTMLElement, customElements }) => {
			var customElement = define_new_custom_element(HTMLElement, customElements, [
				'title',
				'id',
				'r',
			]);

			var instance = document.createElement(customElement.name);
			{
				const actualArray = customElement.takeLog().types();
				const expectedArray = ['constructed'];
				expect(actualArray.length).toBe(expectedArray.length);
				for (let index = 0; index < expectedArray.length; index++)
					expect(actualArray[index]).toBe(expectedArray[index]);
			}

			instance.setAttributeNS('http://www.w3.org/2000/svg', 'title', 'hello');
			expect(instance.getAttribute('title')).toBe('hello');
			var logEntries = customElement.takeLog();
			{
				const actualArray = logEntries.types();
				const expectedArray = ['attributeChanged'];
				expect(actualArray.length).toBe(expectedArray.length);
				for (let index = 0; index < expectedArray.length; index++)
					expect(actualArray[index]).toBe(expectedArray[index]);
			}
			assert_attribute_log_entry(expect, logEntries.last(), {
				name: 'title',
				oldValue: null,
				newValue: 'hello',
				namespace: 'http://www.w3.org/2000/svg',
			});

			instance.removeAttributeNS('http://www.w3.org/2000/svg', 'title');
			expect(instance.getAttribute('title')).toBe(null);
			var logEntries = customElement.takeLog();
			{
				const actualArray = logEntries.types();
				const expectedArray = ['attributeChanged'];
				expect(actualArray.length).toBe(expectedArray.length);
				for (let index = 0; index < expectedArray.length; index++)
					expect(actualArray[index]).toBe(expectedArray[index]);
			}
			assert_attribute_log_entry(expect, logEntries.last(), {
				name: 'title',
				oldValue: 'hello',
				newValue: null,
				namespace: 'http://www.w3.org/2000/svg',
			});
		},
	);
	context.test(
		'setAttributeNode and removeAttributeNode must enqueue and invoke attributeChangedCallback for an HTML attribute',
		({ document, HTMLElement, customElements }) => {
			var customElement = define_new_custom_element(HTMLElement, customElements, [
				'title',
				'id',
				'r',
			]);

			var instance = document.createElement(customElement.name);
			{
				const actualArray = customElement.takeLog().types();
				const expectedArray = ['constructed'];
				expect(actualArray.length).toBe(expectedArray.length);
				for (let index = 0; index < expectedArray.length; index++)
					expect(actualArray[index]).toBe(expectedArray[index]);
			}

			var attr = document.createAttribute('id');
			attr.value = 'bar';
			instance.setAttributeNode(attr);

			expect(instance.getAttribute('id')).toBe('bar');
			var logEntries = customElement.takeLog();
			{
				const actualArray = logEntries.types();
				const expectedArray = ['attributeChanged'];
				expect(actualArray.length).toBe(expectedArray.length);
				for (let index = 0; index < expectedArray.length; index++)
					expect(actualArray[index]).toBe(expectedArray[index]);
			}
			assert_attribute_log_entry(expect, logEntries.last(), {
				name: 'id',
				oldValue: null,
				newValue: 'bar',
				namespace: null,
			});

			instance.removeAttributeNode(attr);
			expect(instance.getAttribute('id')).toBe(null);
			var logEntries = customElement.takeLog();
			{
				const actualArray = logEntries.types();
				const expectedArray = ['attributeChanged'];
				expect(actualArray.length).toBe(expectedArray.length);
				for (let index = 0; index < expectedArray.length; index++)
					expect(actualArray[index]).toBe(expectedArray[index]);
			}
			assert_attribute_log_entry(expect, logEntries.last(), {
				name: 'id',
				oldValue: 'bar',
				newValue: null,
				namespace: null,
			});
		},
	);
	context.test(
		'setAttributeNode and removeAttributeNS must enqueue and invoke attributeChangedCallback for an SVG attribute',
		({ document, HTMLElement, customElements }) => {
			var customElement = define_new_custom_element(HTMLElement, customElements, [
				'title',
				'id',
				'r',
			]);

			const instance = document.createElement(customElement.name);
			{
				const actualArray = customElement.takeLog().types();
				const expectedArray = ['constructed'];
				expect(actualArray.length).toBe(expectedArray.length);
				for (let index = 0; index < expectedArray.length; index++)
					expect(actualArray[index]).toBe(expectedArray[index]);
			}

			const attr = document.createAttributeNS('http://www.w3.org/2000/svg', 'r');
			attr.value = '100';
			instance.setAttributeNode(attr);

			expect(instance.getAttribute('r')).toBe('100');
			var logEntries = customElement.takeLog();
			{
				const actualArray = logEntries.types();
				const expectedArray = ['attributeChanged'];
				expect(actualArray.length).toBe(expectedArray.length);
				for (let index = 0; index < expectedArray.length; index++)
					expect(actualArray[index]).toBe(expectedArray[index]);
			}
			assert_attribute_log_entry(expect, logEntries.last(), {
				name: 'r',
				oldValue: null,
				newValue: '100',
				namespace: 'http://www.w3.org/2000/svg',
			});

			instance.removeAttributeNode(attr);
			expect(instance.getAttribute('r')).toBe(null);
			var logEntries = customElement.takeLog();
			{
				const actualArray = logEntries.types();
				const expectedArray = ['attributeChanged'];
				expect(actualArray.length).toBe(expectedArray.length);
				for (let index = 0; index < expectedArray.length; index++)
					expect(actualArray[index]).toBe(expectedArray[index]);
			}
			assert_attribute_log_entry(expect, logEntries.last(), {
				name: 'r',
				oldValue: '100',
				newValue: null,
				namespace: 'http://www.w3.org/2000/svg',
			});
		},
	);
	context.test(
		'toggleAttribute must enqueue and invoke attributeChangedCallback',
		({ document, HTMLElement, customElements }) => {
			var customElement = define_new_custom_element(HTMLElement, customElements, [
				'title',
				'id',
				'r',
			]);

			const instance = document.createElement(customElement.name);
			{
				const actualArray = customElement.takeLog().types();
				const expectedArray = ['constructed'];
				expect(actualArray.length).toBe(expectedArray.length);
				for (let index = 0; index < expectedArray.length; index++)
					expect(actualArray[index]).toBe(expectedArray[index]);
			}

			instance.toggleAttribute('title', true);
			expect(instance.hasAttribute('title')).toBe(true);
			var logEntries = customElement.takeLog();
			{
				const actualArray = logEntries.types();
				const expectedArray = ['attributeChanged'];
				expect(actualArray.length).toBe(expectedArray.length);
				for (let index = 0; index < expectedArray.length; index++)
					expect(actualArray[index]).toBe(expectedArray[index]);
			}
			assert_attribute_log_entry(expect, logEntries.last(), {
				name: 'title',
				oldValue: null,
				newValue: '',
				namespace: null,
			});

			instance.toggleAttribute('title');
			expect(instance.hasAttribute('title')).toBe(false);
			var logEntries = customElement.takeLog();
			{
				const actualArray = logEntries.types();
				const expectedArray = ['attributeChanged'];
				expect(actualArray.length).toBe(expectedArray.length);
				for (let index = 0; index < expectedArray.length; index++)
					expect(actualArray[index]).toBe(expectedArray[index]);
			}
			assert_attribute_log_entry(expect, logEntries.last(), {
				name: 'title',
				oldValue: '',
				newValue: null,
				namespace: null,
			});
		},
	);
	context.test(
		'Mutating attributeChangedCallback after calling customElements.define must not affect the callback being invoked',
		({ document, HTMLElement, customElements }) => {
			var customElement = define_new_custom_element(HTMLElement, customElements, [
				'title',
				'id',
				'r',
			]);

			const callsToOld: CallbackLog[] = [];
			const callsToNew: CallbackLog[] = [];
			class CustomElement extends HTMLElement {
				declare static observedAttributes: Iterable<string>;
				declare attributeChangedCallback: (...args: AttributeArguments) => void;
			}
			CustomElement.prototype.attributeChangedCallback = function (...args: AttributeArguments) {
				callsToOld.push(create_attribute_changed_callback_log(this, ...args));
			};
			CustomElement.observedAttributes = ['title'];
			customElements.define('element-with-mutated-attribute-changed-callback', CustomElement);
			CustomElement.prototype.attributeChangedCallback = function (...args: AttributeArguments) {
				callsToNew.push(create_attribute_changed_callback_log(this, ...args));
			};

			const instance = document.createElement('element-with-mutated-attribute-changed-callback');
			instance.setAttribute('title', 'hi');
			expect(instance.getAttribute('title')).toBe('hi');
			{
				const actualArray = callsToNew;
				const expectedArray: never[] = [];
				expect(actualArray.length).toBe(expectedArray.length);
				for (let index = 0; index < expectedArray.length; index++)
					expect(actualArray[index]).toBe(expectedArray[index]);
			}
			expect(callsToOld.length).toBe(1);
			assert_attribute_log_entry(expect, callsToOld[0]!, {
				name: 'title',
				oldValue: null,
				newValue: 'hi',
				namespace: null,
			});
		},
	);
	context.test(
		'attributedChangedCallback must not be invoked when the observed attributes does not contain the attribute',
		({ document, HTMLElement, customElements }) => {
			var customElement = define_new_custom_element(HTMLElement, customElements, [
				'title',
				'id',
				'r',
			]);

			const calls: CallbackLog[] = [];
			class CustomElement extends HTMLElement {
				declare static observedAttributes: Iterable<string>;
				attributeChangedCallback(...args: AttributeArguments) {
					calls.push(create_attribute_changed_callback_log(this, ...args));
				}
			}
			CustomElement.observedAttributes = ['title'];
			customElements.define('element-not-observing-id-attribute', CustomElement);

			const instance = document.createElement('element-not-observing-id-attribute');
			expect(calls.length).toBe(0);
			instance.setAttribute('title', 'hi');
			expect(calls.length).toBe(1);
			assert_attribute_log_entry(expect, calls[0]!, {
				name: 'title',
				oldValue: null,
				newValue: 'hi',
				namespace: null,
			});
			instance.setAttribute('id', 'some');
			expect(calls.length).toBe(1);
			assert_attribute_log_entry(expect, calls[0]!, {
				name: 'title',
				oldValue: null,
				newValue: 'hi',
				namespace: null,
			});
		},
	);
	context.test(
		'Mutating observedAttributes after calling customElements.define must not affect the set of attributes for which attributedChangedCallback is invoked',
		({ document, HTMLElement, customElements }) => {
			var customElement = define_new_custom_element(HTMLElement, customElements, [
				'title',
				'id',
				'r',
			]);

			const calls: CallbackLog[] = [];
			class CustomElement extends HTMLElement {
				declare static observedAttributes: Iterable<string>;
				declare attributeChangedCallback: (...args: AttributeArguments) => void;
			}
			CustomElement.prototype.attributeChangedCallback = function (...args: AttributeArguments) {
				calls.push(create_attribute_changed_callback_log(this, ...args));
			};
			CustomElement.observedAttributes = ['title', 'lang'];
			customElements.define('element-with-mutated-observed-attributes', CustomElement);
			CustomElement.observedAttributes = ['title', 'id'];

			const instance = document.createElement('element-with-mutated-observed-attributes');
			instance.setAttribute('title', 'hi');
			expect(calls.length).toBe(1);
			assert_attribute_log_entry(expect, calls[0]!, {
				name: 'title',
				oldValue: null,
				newValue: 'hi',
				namespace: null,
			});

			instance.setAttribute('id', 'some');
			expect(calls.length).toBe(1);

			instance.setAttribute('lang', 'en');
			expect(calls.length).toBe(2);
			assert_attribute_log_entry(expect, calls[1]!, {
				name: 'lang',
				oldValue: null,
				newValue: 'en',
				namespace: null,
			});
		},
	);
	context.test(
		'attributedChangedCallback must be enqueued for attributes specified in a non-Array iterable observedAttributes',
		({ document, HTMLElement, customElements }) => {
			var customElement = define_new_custom_element(HTMLElement, customElements, [
				'title',
				'id',
				'r',
			]);

			var calls: CallbackLog[] = [];
			class CustomElement extends HTMLElement {
				declare static observedAttributes: Iterable<string>;
				declare attributeChangedCallback: (...args: AttributeArguments) => void;
			}
			CustomElement.prototype.attributeChangedCallback = function (...args: AttributeArguments) {
				calls.push(create_attribute_changed_callback_log(this, ...args));
			};
			CustomElement.observedAttributes = {
				[Symbol.iterator]: function* () {
					yield 'lang';
					yield 'style';
				},
			};
			customElements.define('element-with-generator-observed-attributes', CustomElement);

			var instance = document.createElement('element-with-generator-observed-attributes');
			instance.setAttribute('lang', 'en');
			expect(calls.length).toBe(1);
			assert_attribute_log_entry(expect, calls[0]!, {
				name: 'lang',
				oldValue: null,
				newValue: 'en',
				namespace: null,
			});

			instance.setAttribute('lang', 'ja');
			expect(calls.length).toBe(2);
			assert_attribute_log_entry(expect, calls[1]!, {
				name: 'lang',
				oldValue: 'en',
				newValue: 'ja',
				namespace: null,
			});

			instance.setAttribute('title', 'hello');
			expect(calls.length).toBe(2);

			instance.setAttribute('style', 'font-size: 2rem');
			expect(calls.length).toBe(3);
			assert_attribute_log_entry(expect, calls[2]!, {
				name: 'style',
				oldValue: null,
				newValue: 'font-size: 2rem',
				namespace: null,
			});
		},
	);
	context.test(
		'attributedChangedCallback must be enqueued for style attribute change by mutating inline style declaration',
		({ document, HTMLElement, customElements }) => {
			var customElement = define_new_custom_element(HTMLElement, customElements, [
				'title',
				'id',
				'r',
			]);

			var calls: CallbackLog[] = [];
			class CustomElement extends HTMLElement {
				declare static observedAttributes: Iterable<string>;
				declare attributeChangedCallback: (...args: AttributeArguments) => void;
			}
			CustomElement.prototype.attributeChangedCallback = function (...args: AttributeArguments) {
				calls.push(create_attribute_changed_callback_log(this, ...args));
			};
			CustomElement.observedAttributes = ['style'];
			customElements.define('element-with-style-attribute-observation', CustomElement);

			var instance = document.createElement('element-with-style-attribute-observation');
			expect(calls.length).toBe(0);

			instance.style.fontSize = '10px';
			expect(calls.length).toBe(1);
			assert_attribute_log_entry(expect, calls[0]!, {
				name: 'style',
				oldValue: null,
				newValue: 'font-size: 10px;',
				namespace: null,
			});

			instance.style.fontSize = '20px';
			expect(calls.length).toBe(2);
			assert_attribute_log_entry(expect, calls[1]!, {
				name: 'style',
				oldValue: 'font-size: 10px;',
				newValue: 'font-size: 20px;',
				namespace: null,
			});
		},
	);
	context.test(
		'attributedChangedCallback must not be enqueued when mutating inline style declaration if the style attribute is not observed',
		({ document, HTMLElement, customElements }) => {
			var customElement = define_new_custom_element(HTMLElement, customElements, [
				'title',
				'id',
				'r',
			]);

			var calls: CallbackLog[] = [];
			class CustomElement extends HTMLElement {
				declare static observedAttributes: Iterable<string>;
				declare attributeChangedCallback: (...args: AttributeArguments) => void;
			}
			CustomElement.prototype.attributeChangedCallback = function (...args: AttributeArguments) {
				calls.push(create_attribute_changed_callback_log(this, ...args));
			};
			CustomElement.observedAttributes = ['title'];
			customElements.define('element-with-no-style-attribute-observation', CustomElement);

			var instance = document.createElement('element-with-no-style-attribute-observation');
			expect(calls.length).toBe(0);
			instance.style.fontSize = '10px';
			expect(calls.length).toBe(0);
			instance.title = 'hello';
			assert_attribute_log_entry(expect, calls[0]!, {
				name: 'title',
				oldValue: null,
				newValue: 'hello',
				namespace: null,
			});
		},
	);
	context.test(
		'Upgrading a parser created element must enqueue and invoke attributeChangedCallback for an HTML attribute',
		({ HTMLElement, customElements }) => {
			var customElement = define_new_custom_element(HTMLElement, customElements, [
				'title',
				'id',
				'r',
			]);

			var calls: CallbackLog[] = [];
			class CustomElement extends HTMLElement {
				declare static observedAttributes: Iterable<string>;
				declare attributeChangedCallback: (...args: AttributeArguments) => void;
			}
			CustomElement.prototype.attributeChangedCallback = function (...args: AttributeArguments) {
				calls.push(create_attribute_changed_callback_log(this, ...args));
			};
			CustomElement.observedAttributes = ['title'];
			customElements.define('parser-created-element', CustomElement);
			assert_attribute_log_entry(expect, calls[0]!, {
				name: 'title',
				oldValue: null,
				newValue: '',
				namespace: null,
			});
		},
		{
			document: {
				contentType: 'text/html',
				content:
					'<!doctype html><div id="log"></div><parser-created-element title></parser-created-element>',
			},
		},
	);
	context.test(
		'Upgrading a cloned element must enqueue and invoke attributeChangedCallback for an HTML attribute',
		({ document, HTMLElement, customElements }) => {
			var customElement = define_new_custom_element(HTMLElement, customElements, [
				'title',
				'id',
				'r',
			]);

			var calls: CallbackLog[] = [];
			class CustomElement extends HTMLElement {
				declare static observedAttributes: Iterable<string>;
				declare attributeChangedCallback: (...args: AttributeArguments) => void;
			}
			CustomElement.prototype.attributeChangedCallback = function (...args: AttributeArguments) {
				calls.push(create_attribute_changed_callback_log(this, ...args));
			};
			CustomElement.observedAttributes = ['title'];
			customElements.define('cloned-element-with-attribute', CustomElement);

			var instance = document.createElement('cloned-element-with-attribute');
			expect(calls.length).toBe(0);
			instance.title = '';
			assert_attribute_log_entry(expect, calls[0]!, {
				name: 'title',
				oldValue: null,
				newValue: '',
				namespace: null,
			});

			calls = [];
			var clone = instance.cloneNode(false);
			assert_attribute_log_entry(expect, calls[0]!, {
				name: 'title',
				oldValue: null,
				newValue: '',
				namespace: null,
			});
		},
	);
}
