import { createContext } from './core.ts';
import { describe, expect, test, vi } from 'vitest';
import { createHost, HostApi } from './host.ts';
import { getElement } from './elements.ts';

describe('host', () => {
	test('a prebuilt subtree inherits host context when attached', () => {
		const host = createHost();
		const { getHost } = HostApi.methods;
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
		expect(getHost(text.node!)).toBe(host);
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
		const instance = parent.children[0];

		host.setText(literal, 'world');

		expect(literal.content).toBe('world');
		expect(parent.children).toEqual([literal]);
		expect(parent.children[0]).toBe(instance);
		expect(literal.parent).toBe(parent);
	});

	test('setText preserves an empty text literal', () => {
		const host = createHost();
		const parent = host.createElement('text');
		const literal = host.createLiteral('hello');

		host.insertBefore(parent, literal);
		host.setText(literal, '');

		expect(literal.content).toBe('');
		expect(parent.children).toEqual([literal]);
	});

	test('removeChild removes a text literal', () => {
		const host = createHost();
		const parent = host.createElement('text');
		const literal = host.createLiteral('hello');

		host.insertBefore(parent, literal);
		host.removeChild(parent, literal);

		expect(parent.children).toEqual([]);
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
});
