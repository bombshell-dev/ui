import type { CompatibilityContext } from '../../shared/context.ts';
import {
	create_window_in_test,
	create_constructor_log,
	create_connected_callback_log,
	create_disconnected_callback_log,
	create_adopted_callback_log,
	create_attribute_changed_callback_log,
	assert_constructor_log_entry,
	assert_connected_log_entry,
	assert_adopted_log_entry,
	assert_attribute_log_entry,
	type CallbackLog,
	type AttributeArguments,
} from './resources/custom-elements-helpers.js.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'Upgrading a custom element must invoke attributeChangedCallback and connectedCallback before start upgrading another element',
		async (fixture) => {
			const { document } = fixture;
			const contentWindow = await create_window_in_test(document, fixture);

			const contentDocument = contentWindow.document;
			contentDocument.write('<test-element id="first-element">');
			contentDocument.write('<test-element id="second-element">');

			const element1 = contentDocument.getElementById('first-element')!;
			const element2 = contentDocument.getElementById('second-element')!;
			expect(Object.getPrototypeOf(element1)).toBe(contentWindow.HTMLElement.prototype);
			expect(Object.getPrototypeOf(element2)).toBe(contentWindow.HTMLElement.prototype);

			let log: CallbackLog[] = [];
			class TestElement extends contentWindow.HTMLElement {
				constructor() {
					super();
					log.push(create_constructor_log(this));
				}
				connectedCallback(...args: unknown[]) {
					log.push(create_connected_callback_log(this, ...args));
				}
				attributeChangedCallback(...args: AttributeArguments) {
					log.push(create_attribute_changed_callback_log(this, ...args));
				}
				static get observedAttributes() {
					return ['id'];
				}
			}
			contentWindow.customElements.define('test-element', TestElement);
			expect(Object.getPrototypeOf(element1)).toBe(TestElement.prototype);
			expect(Object.getPrototypeOf(element2)).toBe(TestElement.prototype);

			expect(log.length).toBe(6);
			assert_constructor_log_entry(expect, log[0]!, element1);
			assert_attribute_log_entry(expect, log[1]!, {
				name: 'id',
				oldValue: null,
				newValue: 'first-element',
				namespace: null,
			});
			assert_connected_log_entry(expect, log[2]!, element1);
			assert_constructor_log_entry(expect, log[3]!, element2);
			assert_attribute_log_entry(expect, log[4]!, {
				name: 'id',
				oldValue: null,
				newValue: 'second-element',
				namespace: null,
			});
			assert_connected_log_entry(expect, log[5]!, element2);
		},
	);
	context.test(
		'Upgrading a custom element must not invoke attributeChangedCallback for the attribute that is changed during upgrading',
		async (fixture) => {
			const { document } = fixture;
			const contentWindow = await create_window_in_test(document, fixture);

			const contentDocument = contentWindow.document;
			contentDocument.write('<test-element>');

			const element = contentDocument.querySelector('test-element');
			expect(Object.getPrototypeOf(element)).toBe(contentWindow.HTMLElement.prototype);

			let log: CallbackLog[] = [];
			class TestElement extends contentWindow.HTMLElement {
				constructor() {
					super();
					this.id = 'foo';
					this.setAttribute('id', 'foo');
					this.removeAttribute('id');
					this.style.fontSize = '10px';
					log.push(create_constructor_log(this));
				}
				connectedCallback(...args: unknown[]) {
					log.push(create_connected_callback_log(this, ...args));
				}
				attributeChangedCallback(...args: AttributeArguments) {
					log.push(create_attribute_changed_callback_log(this, ...args));
				}
				static get observedAttributes() {
					return ['id', 'style'];
				}
			}
			contentWindow.customElements.define('test-element', TestElement);
			expect(Object.getPrototypeOf(element)).toBe(TestElement.prototype);

			expect(log.length).toBe(2);
			assert_constructor_log_entry(expect, log[0]!, element);
			assert_connected_log_entry(expect, log[1]!, element);
		},
	);
	context.test(
		'Upgrading a custom element must not invoke disconnectedCallback if the element is disconnected during upgrading',
		async (fixture) => {
			const { document } = fixture;
			const contentWindow = await create_window_in_test(document, fixture);

			const contentDocument = contentWindow.document;
			contentDocument.write('<test-element>');

			const element = contentDocument.querySelector('test-element');
			expect(Object.getPrototypeOf(element)).toBe(contentWindow.HTMLElement.prototype);

			let log: CallbackLog[] = [];
			class TestElement extends contentWindow.HTMLElement {
				constructor() {
					super();
					this.remove();
					log.push(create_constructor_log(this));
				}
				connectedCallback(...args: unknown[]) {
					log.push(create_connected_callback_log(this, ...args));
				}
				disconnectedCallback(...args: unknown[]) {
					log.push(create_disconnected_callback_log(this, ...args));
				}
			}
			contentWindow.customElements.define('test-element', TestElement);
			expect(Object.getPrototypeOf(element)).toBe(TestElement.prototype);

			expect(log.length).toBe(2);
			assert_constructor_log_entry(expect, log[0]!, element);
			assert_connected_log_entry(expect, log[1]!, element);
		},
	);
	context.test(
		'Upgrading a disconnected custom element must not invoke connectedCallback if the element is connected during upgrading',
		async (fixture) => {
			const { document } = fixture;
			const contentWindow = await create_window_in_test(document, fixture);

			const contentDocument = contentWindow.document;
			const element = contentDocument.createElement('test-element');
			expect(Object.getPrototypeOf(element)).toBe(contentWindow.HTMLElement.prototype);

			let log: CallbackLog[] = [];
			class TestElement extends contentWindow.HTMLElement {
				constructor() {
					super();
					contentDocument.documentElement.appendChild(this);
					log.push(create_constructor_log(this));
				}
				connectedCallback(...args: unknown[]) {
					log.push(create_connected_callback_log(this, ...args));
				}
			}
			contentWindow.customElements.define('test-element', TestElement);
			contentWindow.customElements.upgrade(element);

			expect(Object.getPrototypeOf(element)).toBe(TestElement.prototype);

			expect(log.length).toBe(1);
			assert_constructor_log_entry(expect, log[0]!, element);
		},
	);
	context.test(
		'Mutating a undefined custom element while upgrading a custom element must not enqueue or invoke reactions on the mutated element',
		async (fixture) => {
			const { document } = fixture;
			const contentWindow = await create_window_in_test(document, fixture);

			const contentDocument = contentWindow.document;
			contentDocument.write('<test-element id="first-element">');
			contentDocument.write('<test-element id="second-element">');

			const element1 = contentDocument.getElementById('first-element')!;
			const element2 = contentDocument.getElementById('second-element')!;
			expect(Object.getPrototypeOf(element1)).toBe(contentWindow.HTMLElement.prototype);
			expect(Object.getPrototypeOf(element2)).toBe(contentWindow.HTMLElement.prototype);

			let log: CallbackLog[] = [];
			class TestElement extends contentWindow.HTMLElement {
				constructor() {
					super();
					log.push(create_constructor_log(this));
					if (this == element1) {
						element2.setAttribute('title', 'hi');
						element2.removeAttribute('title');
						element2.setAttribute('class', 'foo');
					}
				}
				connectedCallback(...args: unknown[]) {
					log.push(create_connected_callback_log(this, ...args));
				}
				attributeChangedCallback(...args: AttributeArguments) {
					log.push(create_attribute_changed_callback_log(this, ...args));
				}
				static get observedAttributes() {
					return ['id', 'class', 'title'];
				}
			}
			contentWindow.customElements.define('test-element', TestElement);
			expect(Object.getPrototypeOf(element1)).toBe(TestElement.prototype);
			expect(Object.getPrototypeOf(element2)).toBe(TestElement.prototype);

			expect(log.length).toBe(7);
			assert_constructor_log_entry(expect, log[0]!, element1);
			assert_attribute_log_entry(expect, log[1]!, {
				name: 'id',
				oldValue: null,
				newValue: 'first-element',
				namespace: null,
			});
			assert_connected_log_entry(expect, log[2]!, element1);
			assert_constructor_log_entry(expect, log[3]!, element2);
			assert_attribute_log_entry(expect, log[4]!, {
				name: 'id',
				oldValue: null,
				newValue: 'second-element',
				namespace: null,
			});
			assert_attribute_log_entry(expect, log[5]!, {
				name: 'class',
				oldValue: null,
				newValue: 'foo',
				namespace: null,
			});
			assert_connected_log_entry(expect, log[6]!, element2);
		},
	);
	context.test(
		'Mutating another custom element inside adopted callback must invoke all pending callbacks on the mutated element',
		async (fixture) => {
			const { document } = fixture;
			const contentWindow = await create_window_in_test(document, fixture);

			let log: CallbackLog[] = [];
			let element1: HTMLElement;
			let element2: HTMLElement;
			class TestElement extends contentWindow.HTMLElement {
				constructor() {
					super();
					log.push(create_constructor_log(this));
				}
				adoptedCallback(...args: unknown[]) {
					log.push(create_adopted_callback_log(this, ...args));
					if (this == element1) element3.setAttribute('id', 'foo');
				}
				connectedCallback(...args: unknown[]) {
					log.push(create_connected_callback_log(this, ...args));
				}
				attributeChangedCallback(...args: AttributeArguments) {
					log.push(create_attribute_changed_callback_log(this, ...args));
				}
				static get observedAttributes() {
					return ['id', 'class'];
				}
			}

			contentWindow.customElements.define('test-element', TestElement);

			let contentDocument = contentWindow.document;
			element1 = contentDocument.createElement('test-element');
			element2 = contentDocument.createElement('test-element');
			const element3 = contentDocument.createElement('test-element');
			expect(Object.getPrototypeOf(element1)).toBe(TestElement.prototype);
			expect(Object.getPrototypeOf(element2)).toBe(TestElement.prototype);
			expect(Object.getPrototypeOf(element3)).toBe(TestElement.prototype);

			expect(log.length).toBe(3);
			assert_constructor_log_entry(expect, log[0]!, element1);
			assert_constructor_log_entry(expect, log[1]!, element2);
			assert_constructor_log_entry(expect, log[2]!, element3);
			log = [];

			const container = contentDocument.createElement('div');
			container.appendChild(element1);
			container.appendChild(element2);
			container.appendChild(element3);

			const anotherDocument = document.implementation.createHTMLDocument();
			anotherDocument.documentElement.appendChild(container);

			expect(log.length).toBe(7);
			assert_adopted_log_entry(expect, log[0]!, element1);
			assert_adopted_log_entry(expect, log[1]!, element3);
			assert_connected_log_entry(expect, log[2]!, element3);
			assert_attribute_log_entry(expect, log[3]!, {
				name: 'id',
				oldValue: null,
				newValue: 'foo',
				namespace: null,
			});
			assert_connected_log_entry(expect, log[4]!, element1);
			assert_adopted_log_entry(expect, log[5]!, element2);
			assert_connected_log_entry(expect, log[6]!, element2);
		},
	);
}
