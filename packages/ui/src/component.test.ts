import { describe, expect, test, vi } from 'vitest';
import {
	ComponentElement,
	defineComponent,
	defineElement,
	registerComponents,
	type CreateResult,
	type Registration,
} from './component.ts';
import { createHost } from './host.ts';
import type { HostElement, PropertyChange } from './elements.ts';
import { Box } from './primitives/box.ts';
import { Text } from './primitives/text.ts';
import { Button } from './elements/button.ts';
import { Dialog } from './components/dialog.ts';
import * as html from './elements/html.ts';

describe('shared definition runtime', () => {
	test('components emit through their persistent element before and after connection', () => {
		const host = createHost();
		let instance!: Emitter;
		class Emitter extends ComponentElement {
			constructor(element: HostElement) {
				super(element);
				instance = this;
			}
			override connectedCallback(): void {
				this.emit({ type: 'click' });
			}
		}
		const Definition = defineComponent('emitter', Emitter);
		Definition.register(host);
		const element = Definition.create(host);
		const listener = vi.fn();
		element.addEventListener('click', listener);
		expect(instance.emit({ type: 'click' })).toEqual({ handled: true, stopped: false });
		host.element.append(element);
		element.remove();
		expect(instance.emit({ type: 'click' })).toEqual({ handled: true, stopped: false });
		expect(listener).toHaveBeenCalledTimes(3);
		expect(listener.mock.calls.every(([event]) => event.target === element)).toBe(true);
		expect(element).not.toHaveProperty('ownerDocument');
	});
	test('forwards parent property changes from projected child connection, including reconnect', () => {
		const host = createHost();
		class ChangingChild extends ComponentElement {
			override connectedCallback(): void {
				parent.setProperty('bg', 123);
			}
		}
		const Child = defineElement('changing-child', ChangingChild);
		registerComponents(host, [html.Div, Child]);
		const parent = html.Div.create(host, { bg: 456 }, Child.create(host));
		host.element.append(parent);
		const implementation = parent.childrenContainer!;
		expect(parent.properties.bg).toBe(123);
		expect(implementation.properties.bg).toBe(123);
		host.removeChild(host.element, parent);
		parent.setProperty('bg', 456);
		expect(implementation.properties.bg).toBe(456);
		host.element.append(parent);
		expect(parent.children).toEqual([implementation]);
		expect(parent.childrenContainer).toBe(implementation);
		expect(implementation.properties.bg).toBe(123);
	});

	test('defers changes until manual void creation finishes and creates once on reconnect', () => {
		const host = createHost();
		const created = vi.fn();
		const changed = vi.fn();
		class ChangingChild extends ComponentElement {
			override connectedCallback(): void {
				parent.setProperty('bg', 123);
			}
		}
		const Child = defineElement('manual-changing-child', ChangingChild);
		class Manual extends ComponentElement {
			private implementation!: HostElement;
			override create(): void {
				created();
				const implementation = Box.create(this.host, { bg: 456 }, Child.create(this.host));
				this.element.append(implementation);
				expect(changed).not.toHaveBeenCalled();
				this.implementation = implementation;
			}
			override propertyChanged(change: PropertyChange): void {
				changed(change);
				this.implementation.setProperty(change.name, change.value);
			}
		}
		const Definition = defineComponent('manual', { define: Manual, dependencies: [Box, Child] });
		Definition.register(host);
		const parent = Definition.create(host, { bg: 456 });
		host.element.append(parent);
		const implementation = parent.children[0];
		expect(changed).toHaveBeenCalledExactlyOnceWith(
			expect.objectContaining({ name: 'bg', value: 123 }),
		);
		expect(implementation.properties.bg).toBe(123);
		host.removeChild(host.element, parent);
		parent.setProperty('bg', 456);
		host.element.append(parent);
		expect(created).toHaveBeenCalledOnce();
		expect(parent.children).toEqual([implementation]);
		expect(implementation.properties.bg).toBe(123);
	});

	test('keeps a projected tree when child connection removes its parent', () => {
		const host = createHost();
		const created = vi.fn();
		const connected = vi.fn();
		const disconnected = vi.fn();
		let removeParent = true;
		class RemovingChild extends ComponentElement {
			override connectedCallback(): void {
				if (removeParent) host.removeChild(host.element, parent);
			}
		}
		const Child = defineElement('removing-child', RemovingChild);
		class Projected extends ComponentElement {
			override create(): CreateResult {
				created();
				const implementation = Box.create(this.host);
				return { implementation, contentContainer: implementation };
			}
			override connectedCallback(): void {
				connected(this.element.childrenContainer);
			}
			override disconnectedCallback(): void {
				disconnected();
			}
		}
		const Definition = defineComponent('self-removing', {
			define: Projected,
			dependencies: [Box, Child],
		});
		Definition.register(host);
		const child = Child.create(host);
		const parent = Definition.create(host, {}, 'before', child, 'after');
		host.element.append(parent);
		const implementation = parent.childrenContainer!;
		expect(parent.node).toBeNull();
		expect(connected).not.toHaveBeenCalled();
		expect(disconnected).toHaveBeenCalledOnce();
		expect(implementation.childNodes).toEqual([
			expect.objectContaining({ content: 'before' }),
			child,
			expect.objectContaining({ content: 'after' }),
		]);
		removeParent = false;
		host.element.append(parent);
		expect(created).toHaveBeenCalledOnce();
		expect(connected).toHaveBeenCalledExactlyOnceWith(implementation);
		expect(parent.children).toEqual([implementation]);
	});

	test('distinguishes standard elements, components, and primitives', () => {
		expect(Box.kind).toBe('primitive');
		expect(Text.kind).toBe('primitive');
		expect(Dialog.kind).toBe('component');
		expect(Button.kind).toBe('element');
		for (const definition of Object.values(html)) {
			if (typeof definition === 'object' && 'kind' in definition)
				expect(definition.kind).toBe('element');
		}
	});

	test.each([defineComponent, defineElement])(
		'projects once before connection and keeps roots on reconnect',
		(define) => {
			const host = createHost();
			const created = vi.fn();
			const connected = vi.fn();
			const childConnected = vi.fn();
			class ConsumerChild extends ComponentElement {
				override connectedCallback(): void {
					childConnected(this.element.parent?.childNodes.slice());
				}
			}
			const Child = defineElement('consumer-child', ConsumerChild);
			class Projected extends ComponentElement {
				override create(): CreateResult {
					created();
					const container = Box.create(this.host);
					return {
						implementation: Box.create(
							this.host,
							{},
							Text.create(this.host, {}, 'decoration'),
							container,
						),
						contentContainer: container,
					};
				}
				override connectedCallback(): void {
					connected(this.element.childrenContainer);
					this.element.append('connected');
				}
			}
			const Projection = define('projection', {
				define: Projected,
				dependencies: [Box, Text, Child],
			});
			Projection.register(host);
			const child = Child.create(host);
			const element = Projection.create(host, {}, 'before', child, 'after');
			const initial = element.childNodes.slice();
			host.element.append(element);
			const root = element.children[0];
			const container = element.childrenContainer!;
			expect(childConnected).toHaveBeenCalledExactlyOnceWith(initial);
			expect(connected).toHaveBeenCalledWith(container);
			expect(container.childNodes.slice(0, 3)).toEqual(initial);
			expect(element.children).toEqual([root]);
			expect(element.textContent).toBe('beforeafterconnected');
			host.removeChild(host.element, element);
			element.append('detached');
			host.element.append(element);
			expect(created).toHaveBeenCalledOnce();
			expect(connected).toHaveBeenCalledTimes(2);
			expect(element.children).toEqual([root]);
			expect(element.childrenContainer).toBe(container);
			expect(element.textContent).toBe('beforeafterconnecteddetachedconnected');
		},
	);

	test('retains concrete create results and accepts public registrations', () => {
		const host = createHost();
		class Concrete extends ComponentElement {
			override create(): HostElement {
				return Box.create(this.host, {}, 'implementation');
			}
		}
		const ConcreteComponent = defineComponent('concrete', {
			define: Concrete,
			dependencies: [Box],
		});
		const custom: Registration = { register: vi.fn() };
		registerComponents(host, [custom, ConcreteComponent, custom]);
		expect(custom.register).toHaveBeenCalledExactlyOnceWith(host);
		const element = ConcreteComponent.create(host);
		host.element.append(element);
		expect(element.textContent).toBe('implementation');
	});
});
