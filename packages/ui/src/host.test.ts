import { createContext, LifecycleApi } from './core.ts';
import { describe, expect, test, vi } from 'vitest';
import { ComponentElement, defineComponent } from './component.ts';
import { createHost, HostApi, CrossHostInsertionError } from './host.ts';
import { getElement, getElementHost, setElementHost } from './elements.ts';
import { HostDOMEvent } from './browser-types.ts';
import { installBrowserFacade } from './browser-facade.ts';

describe('host', () => {
	test.each(['element', 'literal'] as const)(
		'rejects cross-Host %s moves before detaching or mutating children',
		(type) => {
			const source = createHost();
			const recipient = createHost();
			const element = source.createElement('button');
			const literal = source.createLiteral('text');
			source.element.append(element, literal);
			const child = type === 'element' ? element : literal;
			const node = element.node;
			element.detach = vi.fn();
			expect(() => recipient.insertBefore(recipient.element, child)).toThrow(
				CrossHostInsertionError,
			);
			expect(source.element.childNodes).toEqual([element, literal]);
			expect(recipient.element.childNodes).toEqual([]);
			expect(child.parent).toBe(source.element);
			expect(element.node).toBe(node);
			expect(element.detach).not.toHaveBeenCalled();
			expect(getElementHost(child)).toBe(source);
		},
	);

	test('requires the parent, redirected container, and anchor to belong to the receiving Host', () => {
		const host = createHost();
		const foreign = createHost();
		const parent = host.createElement('box');
		const child = host.createElement('button');
		const other = foreign.createElement('box');
		foreign.element.append(other);
		expect(() => host.insertBefore(other, child)).toThrow(CrossHostInsertionError);
		expect(() => foreign.insertBefore(parent, child)).toThrow(CrossHostInsertionError);
		expect(() => HostApi.at(other.node!).insertBefore(parent, child)).toThrow(
			CrossHostInsertionError,
		);
		parent.childrenContainer = other;
		expect(() => host.insertBefore(parent, child)).toThrow(CrossHostInsertionError);
		delete parent.childrenContainer;
		expect(() => host.insertBefore(parent, child, other)).toThrow(CrossHostInsertionError);
		expect(parent.childNodes).toEqual([]);
		expect(other.childNodes).toEqual([]);
		expect(child.parent).toBeNull();
		expect(child.node).toBeNull();
	});

	test('does not permit rebinding immutable creator ownership', () => {
		const host = createHost();
		const child = host.createElement('button');
		setElementHost(child, host);
		expect(() => setElementHost(child, createHost())).toThrow(
			'A Host node cannot change its creator Host',
		);
		expect(getElementHost(child)).toBe(host);
	});

	test('keeps browser APIs out of bare Hosts and nodes', () => {
		const host = createHost();
		const element = host.createElement('button', { disabled: true, value: 'core' });
		const literal = host.createLiteral('text');
		for (const name of [
			'document',
			'window',
			'dispatchDOMEvent',
			'getBoundingClientRect',
			'emit',
			'dispatchEvent',
			'getEventParent',
			'listeners',
		]) {
			expect(host[name as keyof typeof host]).toBeUndefined();
		}
		for (const node of [host.element, element, literal]) {
			for (const name of [
				'ownerDocument',
				'style',
				'querySelector',
				'dispatchEvent',
				'nodeType',
				'disabled',
				'value',
			]) {
				expect(node).not.toHaveProperty(name);
			}
		}
		expect(element.properties).toEqual({ disabled: true, value: 'core' });
		expect(host.viewport).toEqual({ width: 80, height: 24 });
	});

	test('preserves node owners independently of attachment and browser installation', () => {
		const host = createHost();
		const child = host.createElement('box');
		const literal = host.createLiteral('text');
		child.append(literal);
		for (const node of [host.element, child, literal]) expect(getElementHost(node)).toBe(host);
		host.element.append(child);
		child.remove();
		expect(getElementHost(child)).toBe(host);
		expect(getElementHost(literal)).toBe(host);
		expect(getElementHost(child.cloneNode(true))).toBe(host);
	});

	test('tracks literal connectivity through its structural parent', () => {
		const host = createHost();
		const literal = host.createLiteral('text');
		const parent = host.createElement('box', literal);
		expect(literal.isConnected).toBe(false);
		host.element.append(parent);
		expect(literal.isConnected).toBe(true);
		parent.remove();
		expect(literal.isConnected).toBe(false);
	});

	test('creates elements with properties and primitive children', () => {
		const host = createHost();
		const text = host.createElement('text', { color: 'cyan' }, 'hello ', 42, false, null, [
			'world',
		]);

		expect(text.properties).toEqual({ color: 'cyan' });
		expect(
			text.childNodes.map((child) => (child.type === 'literal' ? child.content : child)),
		).toEqual(['hello ', '42', 'world']);
	});

	test('exposes element identity without conflating HostElements with TTY primitives', () => {
		const host = createHost();
		const button = host.createElement('button');

		expect(button).toMatchObject({
			type: 'element',
			name: 'button',
		});
		expect(button).not.toHaveProperty('directive');
	});

	test('composes children with DOM-like element methods', () => {
		const host = createHost();
		const parent = host.createElement('box');
		const first = host.createElement('text');
		const second = host.createElement('text');

		parent.append(first);
		parent.prepend('before');
		parent.append(second);
		second.setProperty('color', 'cyan');

		expect(parent.childNodes).toEqual([
			expect.objectContaining({ type: 'literal', content: 'before' }),
			first,
			second,
		]);
		expect(second.properties).toEqual({ color: 'cyan' });

		second.remove();
		expect(parent.childNodes).toHaveLength(2);
		parent.append(second);
		parent.replaceChildren('only');
		expect(parent.childNodes).toHaveLength(1);
		expect(parent.childNodes[0]).toMatchObject({ type: 'literal', content: 'only' });
		expect(parent.children).toEqual([]);
	});

	test('supports textContent for composed host elements', () => {
		const host = createHost();
		const parent = host.createElement('box', {}, host.createElement('text', {}, 'hello '), 'world');

		expect(parent.textContent).toBe('hello world');
		parent.textContent = 'replacement';

		expect(parent.textContent).toBe('replacement');
		expect(parent.childNodes).toHaveLength(1);
	});

	test('defines reusable custom elements for host-created and adapter-created nodes', () => {
		const host = createHost();
		class GreetingElement extends ComponentElement {
			override create(): void {
				this.element.append(this.element.createElement('text', {}, 'hello'));
			}
		}
		const Greeting = defineComponent('greeting', GreetingElement);
		Greeting.register(host);

		const greeting = Greeting.create(host);
		host.element.append(greeting);
		const adapterCreated = host.createElement('greeting');
		host.element.append(adapterCreated);

		expect(greeting.children[0]).toMatchObject({ name: 'text' });
		expect(adapterCreated.children[0]).toMatchObject({ name: 'text' });
	});

	test('runs component connection lifecycle around attachment', () => {
		const host = createHost();
		const lifecycle: string[] = [];
		class LifecycleElement extends ComponentElement {
			override connectedCallback(): void {
				lifecycle.push('connected');
			}

			override disconnectedCallback(): void {
				lifecycle.push('disconnected');
			}
		}
		const Lifecycle = defineComponent('lifecycle-element', LifecycleElement);
		Lifecycle.register(host);
		const element = Lifecycle.create(host);

		host.element.append(element);
		element.remove();

		expect(lifecycle).toEqual(['connected', 'disconnected']);
	});

	test('creates class components once and updates them after property changes', () => {
		const host = createHost();
		const updates: Array<{ previous: unknown; current: unknown }> = [];
		class StatefulElement extends ComponentElement<{ value?: string }> {
			override create(): void {
				this.element.append(this.element.createElement('text', {}, this.props.value ?? ''));
			}

			override propertyChanged({ previous, value }: { previous: unknown; value: unknown }): void {
				updates.push({ previous, current: value });
				const text = this.element.children[0];
				if (text?.type === 'element') {
					text.textContent = this.props.value ?? '';
				}
			}
		}
		const Stateful = defineComponent('stateful', StatefulElement);
		Stateful.register(host);
		const element = Stateful.create(host, { value: 'one' });
		host.element.append(element);

		element.setProperty('value', 'two');
		element.setProperty('value', 'three');

		expect(updates).toEqual([
			{ previous: 'one', current: 'two' },
			{ previous: 'two', current: 'three' },
		]);
	});

	test('still accepts functional component definitions', () => {
		const host = createHost();
		const Greeting = defineComponent('functional-greeting', (element) => {
			element.append(element.createElement('text', {}, 'hello'));
		});
		Greeting.register(host);

		const greeting = Greeting.create(host);

		expect(greeting.children[0]).toMatchObject({ name: 'text' });
	});

	test('a prebuilt subtree inherits host context when attached', () => {
		const host = createHost();
		const marker = createContext<string>('@test/host/attachment');
		marker.set(host.element.node!, 'from host');

		const box = host.createElement('box');
		const text = host.createElement('text');
		const literal = host.createLiteral('hello');

		host.insertBefore(text, literal);
		host.insertBefore(box, text);

		expect(text.node).toBeNull();

		host.insertBefore(host.element, box);

		expect(marker.expect(text.node!)).toBe('from host');
		expect(HostApi.at(text.node!).getHost()).toBe(host);
	});

	test('each attached node resolves its own element', () => {
		const host = createHost();
		const parent = host.createElement('box');
		const child = host.createElement('text');

		host.insertBefore(parent, child);
		host.insertBefore(host.element, parent);

		expect(getElement(host.root)).toBe(host.element);
		expect(getElement(parent.node!)).toBe(parent);
		expect(getElement(child.node!)).toBe(child);
	});

	test('detaching a child does not detach its parent', () => {
		const host = createHost();
		const parent = host.createElement('box');
		const child = host.createElement('text');
		const parentDetach = vi.fn();
		const childDetach = vi.fn();
		parent.detach = parentDetach;
		child.detach = childDetach;

		host.insertBefore(parent, child);
		host.insertBefore(host.element, parent);
		const parentNode = parent.node;
		const childNode = child.node;

		host.removeChild(parent, child);

		expect(parent.node).toBe(parentNode);
		expect(parentDetach).not.toHaveBeenCalled();
		expect(child.node).toBeNull();
		expect(childDetach).toHaveBeenCalledOnce();
		expect(childDetach).toHaveBeenCalledWith(childNode);
	});

	test('moving an attached element to a detached parent detaches it', () => {
		const host = createHost();
		const attached = host.createElement('box');
		const detached = host.createElement('box');
		const child = host.createElement('text');

		host.insertBefore(host.element, attached);
		host.insertBefore(attached, child);

		expect(child.node).not.toBeNull();
		expect(detached.node).toBeNull();

		host.insertBefore(detached, child);

		expect(attached.children).toEqual([]);
		expect(detached.children).toEqual([child]);
		expect(child.node).toBeNull();
	});

	test('moving an element within the same parent changes its position', () => {
		const host = createHost();
		const parent = host.createElement('box');
		const first = host.createElement('text');
		const second = host.createElement('text');
		const third = host.createElement('text');

		host.insertBefore(host.element, parent);
		host.insertBefore(parent, third);
		host.insertBefore(parent, second, third);
		host.insertBefore(parent, first, second);

		const node = third.node;
		host.insertBefore(parent, third, first);

		expect(parent.children).toEqual([third, first, second]);
		expect(third.parent).toBe(parent);
		expect(third.node).toBe(node);
	});

	test('moving an attached element to another attached parent reattaches it', () => {
		const host = createHost();
		const marker = createContext<string>('@test/host/move');
		const first = host.createElement('box');
		const second = host.createElement('box');
		const child = host.createElement('text');

		host.insertBefore(host.element, first);
		host.insertBefore(host.element, second);
		marker.set(first.node!, 'first');
		marker.set(second.node!, 'second');
		host.insertBefore(first, child);

		const firstNode = child.node;
		expect(marker.expect(firstNode!)).toBe('first');

		host.insertBefore(second, child);

		expect(first.children).toEqual([]);
		expect(second.children).toEqual([child]);
		expect(child.node).not.toBe(firstNode);
		expect(marker.expect(child.node!)).toBe('second');
	});

	test('setProperty adds and replaces a property', () => {
		const host = createHost();
		const element = host.createElement('box');

		host.setProperty(element, 'color', 'cyan');
		host.setProperty(element, 'gap', 1);
		expect(element.properties).toEqual({ color: 'cyan', gap: 1 });

		host.setProperty(element, 'color', 'green');
		expect(element.properties).toEqual({ color: 'green', gap: 1 });
	});

	test('setProperty removes a property when its value is undefined', () => {
		const host = createHost();
		const element = host.createElement('box');

		host.setProperty(element, 'color', 'cyan');
		host.setProperty(element, 'gap', 1);
		host.setProperty(element, 'color', undefined);

		expect(element.properties).toEqual({ gap: 1 });
		expect(element.properties).not.toHaveProperty('color');
	});

	test('setProperty preserves null as an explicit value', () => {
		const host = createHost();
		const element = host.createElement('box');

		host.setProperty(element, 'value', null);

		expect(element.properties).toHaveProperty('value', null);
	});

	test('setText updates a text literal without replacing it', () => {
		const host = createHost();
		const parent = host.createElement('text');
		const literal = host.createLiteral('hello');

		host.insertBefore(parent, literal);
		const instance = parent.childNodes[0];

		host.setText(literal, 'world');

		expect(literal.content).toBe('world');
		expect(parent.childNodes).toEqual([literal]);
		expect(parent.childNodes[0]).toBe(instance);
		expect(literal.parent).toBe(parent);
	});

	test('setText preserves an empty text literal', () => {
		const host = createHost();
		const parent = host.createElement('text');
		const literal = host.createLiteral('hello');

		host.insertBefore(parent, literal);
		host.setText(literal, '');

		expect(literal.content).toBe('');
		expect(parent.childNodes).toEqual([literal]);
	});

	test('removeChild removes a text literal', () => {
		const host = createHost();
		const parent = host.createElement('text');
		const literal = host.createLiteral('hello');

		host.insertBefore(parent, literal);
		host.removeChild(parent, literal);

		expect(parent.childNodes).toEqual([]);
		expect(literal.parent).toBeNull();
	});

	test('removeChild detaches a subtree', () => {
		const host = createHost();
		const parent = host.createElement('box');
		const child = host.createElement('box');
		const grandchild = host.createElement('text');

		host.insertBefore(child, grandchild);
		host.insertBefore(parent, child);
		host.insertBefore(host.element, parent);

		expect(child.node).not.toBeNull();
		expect(grandchild.node).not.toBeNull();

		host.removeChild(parent, child);

		expect(parent.children).toEqual([]);
		expect(child.parent).toBeNull();
		expect(child.children).toEqual([grandchild]);
		expect(grandchild.parent).toBe(child);
		expect(child.node).toBeNull();
		expect(grandchild.node).toBeNull();
	});

	test('treats input type attributes as properties, not node discriminators', () => {
		const host = createHost();
		const input = host.createElement('input', { type: 'checkbox', checked: true }, 'label');
		expect(input.type).toBe('element');
		expect(input.properties).toEqual({ type: 'checkbox', checked: true });
		expect(input.textContent).toBe('label');
		const parent = host.createElement('div', input);
		expect(parent.children).toEqual([input]);
		const literal = host.createLiteral('text');
		expect(host.createElement('div', literal).childNodes).toEqual([literal]);
	});

	test('attachment callbacks see their physical parent and position', () => {
		const host = createHost();
		const parent = host.createElement('div');
		const existing = host.createElement('span');
		parent.append(existing);
		host.element.append(parent);
		const child = host.createElement('button');
		child.attach = vi.fn((node) => {
			expect(child.parentElement).toBe(parent);
			expect(parent.firstChild).toBe(child);
			expect(child.nextSibling).toBe(existing);
			expect(node.parent).toBe(parent.node);
		});
		parent.insertBefore(child, existing);
		expect(child.attach).toHaveBeenCalledOnce();
	});

	test('attachment callbacks can remove themselves without attaching descendants afterward', () => {
		const host = createHost();
		const descendant = host.createElement('span');
		const child = host.createElement('div', descendant);
		child.attach = vi.fn(() => child.remove());
		child.detach = vi.fn();
		descendant.attach = vi.fn();
		host.element.append(child);
		expect(child.attach).toHaveBeenCalledOnce();
		expect(child.detach).toHaveBeenCalledOnce();
		expect(child.parent).toBeNull();
		expect(child.node).toBeNull();
		expect(host.element.children).toEqual([]);
		expect(descendant.node).toBeNull();
		expect(descendant.attach).not.toHaveBeenCalled();
	});

	test('recursive destruction dispatches child-local lifecycle decorators', () => {
		const host = createHost();
		const grandchild = host.createElement('span');
		const child = host.createElement('div', grandchild);
		const parent = host.createElement('div', child);
		host.element.append(parent);
		const childNode = child.node!;
		const grandchildNode = grandchild.node!;
		const destroyed: unknown[] = [];
		LifecycleApi.decorate(childNode, () => ({
			destroy(node) {
				destroyed.push(node);
				return super.destroy(node);
			},
		}));
		child.detach = vi.fn();
		grandchild.detach = vi.fn();
		parent.remove();
		expect(destroyed).toEqual([childNode, grandchildNode]);
		expect(child.detach).toHaveBeenCalledOnce();
		expect(grandchild.detach).toHaveBeenCalledOnce();
		expect(parent.node).toBeNull();
		expect(child.node).toBeNull();
		expect(grandchild.node).toBeNull();
		expect(childNode.children.size).toBe(0);
		expect(host.root.children.size).toBe(0);
	});

	test('exposes mixed-node and element-only traversal independently', () => {
		const host = createHost();
		const first = host.createElement('button');
		const second = host.createElement('button');
		const before = host.createLiteral('before');
		const middle = host.createLiteral('middle');
		const after = host.createLiteral('after');
		const parent = host.createElement('div', before, first, middle, second, after);
		expect(parent.childNodes).toEqual([before, first, middle, second, after]);
		expect(parent.children).toEqual([first, second]);
		expect(parent.firstChild).toBe(before);
		expect(parent.lastChild).toBe(after);
		expect(parent.firstElementChild).toBe(first);
		expect(parent.lastElementChild).toBe(second);
		expect(first.previousSibling).toBe(before);
		expect(first.nextSibling).toBe(middle);
		expect(first.nextElementSibling).toBe(second);
		expect(first.previousElementSibling).toBeNull();
		expect(second.previousElementSibling).toBe(first);
		expect(second.nextElementSibling).toBeNull();
		expect(middle.parentNode).toBe(parent);
		expect(middle.parentElement).toBe(parent);
		expect(middle.previousSibling).toBe(first);
		expect(middle.nextSibling).toBe(second);
		expect(before.previousSibling).toBeNull();
		expect(after.nextSibling).toBeNull();
		parent.removeChild(middle);
		expect(first.nextSibling).toBe(second);
		expect(middle.parentNode).toBeNull();
		expect(middle.nextSibling).toBeNull();
		expect(middle.previousSibling).toBeNull();
	});

	test('node mutation APIs return nodes and preserve text anchors when moving nodes', () => {
		const host = createHost();
		const parent = host.createElement('div');
		const other = host.createElement('div');
		const text = host.createLiteral('anchor');
		const child = host.createElement('span');
		expect(parent.appendChild(text)).toBe(text);
		expect(parent.insertBefore(child, text)).toBe(child);
		expect(parent.insertBefore(child, child)).toBe(child);
		expect(parent.childNodes).toEqual([child, text]);
		expect(other.appendChild(child)).toBe(child);
		expect(parent.childNodes).toEqual([text]);
		expect(other.childNodes).toEqual([child]);
		expect(other.removeChild(child)).toBe(child);
		expect(child.parentNode).toBeNull();
	});

	test('queries and compares the physical tree including internal wrappers', () => {
		const host = createHost();
		const browser = installBrowserFacade(host);
		const wrapper = host.createElement('section', { className: 'content' });
		const nested = browser.element(
			host.createElement('input', { id: 'nested', type: 'range', tabIndex: 0 }),
		);
		const direct = host.createElement('button', { id: 'direct' });
		const parent = browser.element(host.createElement('div', { id: 'parent' }, wrapper, direct));
		parent.childrenContainer = wrapper;
		parent.append(nested);
		host.element.append(parent);
		expect(parent.querySelectorAll('section, input, button')).toEqual([wrapper, nested, direct]);
		expect(parent.querySelector(':scope > button')).toBe(direct);
		expect(parent.querySelector('input[type="range"]')).toBe(nested);
		expect(parent.querySelector('#parent')).toBeNull();
		expect(nested.matches('[tabindex]:not([tabindex="-1"])')).toBe(true);
		expect(nested.closest('.content')).toBe(wrapper);
		expect(nested.closest('#parent')).toBe(parent);
		expect(nested.closest('input')).toBe(nested);
		expect(parent.compareDocumentPosition(nested)).toBe(20);
		expect(nested.compareDocumentPosition(parent)).toBe(10);
		expect(nested.compareDocumentPosition(direct)).toBe(4);
		expect(browser.element(direct).compareDocumentPosition(nested)).toBe(2);
		expect(parent.compareDocumentPosition(host.createElement('div'))).toBe(1);
	});

	test('document queries include the document element and preserve root scope', () => {
		const host = createHost();
		const document = installBrowserFacade(host).document;
		const child = document.createElement('button');
		host.element.append(child);
		expect(document.documentElement).toBe(host.element);
		expect(document.querySelectorAll('*')).toEqual([host.element, child]);
		expect(document.querySelectorAll(':scope')).toEqual([host.element]);
		expect(document.querySelectorAll(':scope > button').map((element) => element.name)).toEqual([
			'button',
		]);
		expect(document.querySelector(':scope > button')).toBe(child);
	});

	test('the HTML document element matches browser root selectors', () => {
		const host = createHost();
		const document = installBrowserFacade(host).document;
		expect(document.documentElement.tagName).toBe('HTML');
		expect(document.documentElement.matches('html,body')).toBe(true);
		expect(document.querySelector('html') === document.documentElement).toBe(true);
	});

	test('text DOM aliases and clones share values but not identity or mutations', () => {
		const host = createHost();
		const document = installBrowserFacade(host).document;
		const text = document.createTextNode('one');
		expect(text.nodeType).toBe(3);
		expect(text.nodeName).toBe('#text');
		expect(text.ownerDocument).toBe(document);
		expect(text.firstChild).toBeNull();
		expect(text.lastChild).toBeNull();
		const parent = host.createElement('div', text);
		text.data = 'two';
		expect(text.nodeValue).toBe('two');
		expect(text.textContent).toBe('two');
		expect(parent.textContent).toBe('two');
		text.nodeValue = 'three';
		expect(text.content).toBe('three');
		text.textContent = 'four';
		expect(text.data).toBe('four');
		const clone = text.cloneNode(true);
		expect(clone).not.toBe(text);
		expect(clone.ownerDocument).toBe(document);
		expect(clone.parentNode).toBeNull();
		expect(clone.textContent).toBe('four');
		clone.data = 'independent';
		expect(text.content).toBe('four');
	});

	test('clearing textContent removes an existing text child', () => {
		const host = createHost();
		const text = host.createLiteral('text');
		const parent = host.createElement('div', text);
		parent.textContent = '';
		expect(parent.childNodes).toHaveLength(0);
		expect(text.parentNode).toBeNull();
	});

	test('clones detached trees with independent styles, text and event listeners', () => {
		const host = createHost();
		const browser = installBrowserFacade(host);
		const propListener = vi.fn();
		const nativeListener = vi.fn();
		const child = browser.element(host.createElement('button', { onClick: propListener }, 'label'));
		child.addEventListener('click', nativeListener);
		const parent = browser.element(
			host.createElement('div', { id: 'original', style: { color: 'red' } }, child, 'tail'),
		);
		const shallow = parent.cloneNode();
		const clone = parent.cloneNode(true);
		expect(shallow.childNodes).toEqual([]);
		expect(clone.parentNode).toBeNull();
		expect(clone.node).toBeNull();
		expect(clone.properties).not.toBe(parent.properties);
		expect(clone.children[0]).not.toBe(child);
		expect(clone.textContent).toBe('labeltail');
		clone.style.setProperty('color', 'blue');
		expect(parent.style.getPropertyValue('color')).toBe('red');
		expect(clone.style.getPropertyValue('color')).toBe('blue');
		clone.children[0]!.textContent = 'clone';
		expect(child.textContent).toBe('label');
		const clonedChild = clone.children[0]!;
		expect(clonedChild.properties).not.toHaveProperty('onClick');
		const cloneListener = vi.fn();
		clonedChild.addEventListener('click', cloneListener);
		host.element.append(parent, clone);
		clonedChild.dispatchEvent(new HostDOMEvent('click'));
		expect(cloneListener).toHaveBeenCalledOnce();
		expect(propListener).not.toHaveBeenCalled();
		expect(nativeListener).not.toHaveBeenCalled();
		child.dispatchEvent(new HostDOMEvent('click'));
		expect(propListener).toHaveBeenCalledOnce();
		expect(nativeListener).toHaveBeenCalledOnce();
		expect(cloneListener).toHaveBeenCalledOnce();
	});
});
