// oxlint-disable max-params -- HostApi decorator signatures mirror the methods they wrap.
import {
	HostApi,
	createHost,
	type HostElement,
	type HostLiteral,
	type InputEvent,
	Box as CoreBox,
	Text as CoreText,
	Dialog,
	Input,
	registerComponents,
} from '@clack/ui';
import type { HostEventListener } from '@clack/ui/events';
import { createElement as h, type VNode } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { assert, describe, expect, test, vi } from 'vitest';
import { Box, Text, createRoot } from './index.ts';

function element(child: HostElement['childNodes'][number]): HostElement {
	assert(child.type === 'element');
	return child;
}

function literal(child: HostElement['childNodes'][number]): HostLiteral {
	assert(child.type === 'literal');
	return child;
}

function item(key: string): VNode<{ key: string; name: string }> {
	return h('item', { key, name: key });
}

function Counter(): VNode {
	const [count, setCount] = useState(0);
	useEffect(() => setCount(1), []);
	return h(Text, {}, String(count));
}

describe('createRoot', () => {
	test('does not install standard definitions, browser elements, or globals', () => {
		const document = Reflect.get(globalThis, 'document');
		const window = Reflect.get(globalThis, 'window');
		const host = createHost();
		const root = createRoot(host.element);
		root.render(h('custom-element', null, 'bare'));
		expect(HostApi.at(host.root).definitions.size).toBe(0);
		expect('document' in HostApi.at(host.root)).toBe(false);
		expect('ownerDocument' in host.element).toBe(false);
		expect(Reflect.get(globalThis, 'document')).toBe(document);
		expect(Reflect.get(globalThis, 'window')).toBe(window);
		expect(element(host.element.children[0]!).name).toBe('custom-element');
		root.unmount();
	});

	test('builds and attaches a Preact subtree through the Host', () => {
		const host = createHost();
		registerComponents(host, [CoreBox, CoreText]);
		const root = createRoot(host.element);

		root.render(h(Box, { layout: { direction: 'ttb' } }, h(Text, { color: 15 }, 'hello')));

		const box = element(host.element.children[0]!);
		const text = element(box.children[0]!);
		expect(box.name).toBe('box');
		expect(box.properties).toEqual({ layout: { direction: 'ttb' } });
		expect(box.node).not.toBeNull();
		expect(text.name).toBe('text');
		expect(text.properties).toEqual({ color: 15 });
		expect(text.node).not.toBeNull();
		expect(literal(text.childNodes[0]!)).toMatchObject({ content: 'hello', parent: text });
	});

	test('mounts within the supplied attached element', () => {
		const host = createHost();
		const container = host.createElement('container');
		host.insertBefore(host.element, container);
		const root = createRoot(container);

		root.render(h('probe', null));

		expect(root.element).toBe(container);
		expect(host.element.children).toEqual([container]);
		expect(element(container.children[0]!)).toMatchObject({ name: 'probe' });

		root.unmount();

		expect(container.children).toEqual([]);
		expect(container.node).not.toBeNull();
	});

	test('updates and removes properties and updates text literals', () => {
		const host = createHost();
		const root = createRoot(host.element);

		root.render(h('probe', { removable: 'yes', structured: { value: 1 } }, 'first'));
		const probe = element(host.element.children[0]!);
		const text = literal(probe.childNodes[0]!);

		root.render(h('probe', { added: 0, structured: { value: 2 } }, 'second'));

		expect(element(host.element.children[0]!)).toBe(probe);
		expect(probe.properties).toEqual({ added: 0, structured: { value: 2 } });
		expect(literal(probe.childNodes[0]!)).toBe(text);
		expect(text.content).toBe('second');
	});

	test('reconciles dynamic children inside composed component slots', () => {
		const host = createHost();
		registerComponents(host, [Dialog, CoreText]);
		const root = createRoot(host.element);

		root.render(h('dialog', {}, h('text', { key: 'first' }, 'first')));
		const dialog = element(host.element.children[0]!);
		const panel = element(dialog.children[0]!);
		const body = element(panel.children[2]!);
		const first = element(body.children[0]!);

		root.render(
			h('dialog', {}, h('text', { key: 'second' }, 'second'), h('text', { key: 'third' }, 'third')),
		);
		const second = element(body.children[0]!);
		const third = element(body.children[1]!);
		root.render(h('dialog', {}, h('text', { key: 'third' }, 'third')));

		expect(body.children).toEqual([third]);
		expect(first.parent).toBeNull();
		expect(second.parent).toBeNull();
	});

	test('moves keyed children within the same parent without recreating them', () => {
		const host = createHost();
		const root = createRoot(host.element);

		root.render(h('list', {}, item('first'), item('second'), item('third')));
		const list = element(host.element.children[0]!);
		const [first, second, third] = list.children;

		root.render(h('list', {}, item('third'), item('first'), item('second')));

		expect(list.children).toEqual([third, first, second]);
	});

	test('reorders mixed root children and removes text nodes on unmount', () => {
		const host = createHost();
		const root = createRoot(host.element);
		root.render(['before', item('first'), 'between', item('second'), 'after']);
		const [first, second] = host.element.children;
		const before = literal(host.element.childNodes[0]!);
		const between = literal(host.element.childNodes[2]!);
		const after = literal(host.element.childNodes[4]!);

		root.render(['before', item('second'), 'between', item('first'), 'after']);

		expect(host.element.children).toEqual([second, first]);
		expect(host.element.childNodes).toEqual([before, second, between, first, after]);
		root.unmount();
		expect(host.element.childNodes).toEqual([]);
		expect(before.parent).toBeNull();
		expect(between.parent).toBeNull();
		expect(after.parent).toBeNull();
	});

	test('routes element creation through Host middleware', () => {
		const host = createHost();
		const createElement = vi.fn();
		HostApi.decorate(host.root, () => ({
			createElement(name) {
				createElement(name);
				return super.createElement(name);
			},
		}));
		const root = createRoot(host.element);

		root.render(h('custom-element', null));

		expect(createElement).toHaveBeenCalledWith('custom-element');
	});

	test('delivers Host events through Preact event properties', () => {
		const host = createHost();
		registerComponents(host, [Input]);
		let listener: HostEventListener<'input'> | undefined;
		HostApi.decorate(host.root, () => ({
			addEventListener(target, type, current) {
				if (type === 'input') listener = current as HostEventListener<'input'>;
				return super.addEventListener(target, type, current);
			},
			removeEventListener(target, type, current) {
				if (current === listener) listener = undefined;
				return super.removeEventListener(target, type, current);
			},
		}));
		const root = createRoot(host.element);
		const first = vi.fn();
		const second = vi.fn();

		root.render(h('input', { onInput: first }));
		const input = element(host.element.children[0]!);
		const event: InputEvent = { type: 'input', target: input, value: 'hello' };
		listener!(event);

		expect(first).toHaveBeenCalledWith(event);
		expect(input.properties).toEqual({});

		root.render(h('input', { onInput: second }));
		listener!(event);

		expect(first).toHaveBeenCalledTimes(1);
		expect(second).toHaveBeenCalledWith(event);
	});

	test('applies updates scheduled by Preact hooks', async () => {
		const host = createHost();
		registerComponents(host, [CoreText]);
		const root = createRoot(host.element);

		root.render(h(Counter, {}));

		const text = element(host.element.children[0]!);
		await vi.waitFor(() => expect(literal(text.childNodes[0]!).content).toBe('1'));
	});

	test('unmounts and detaches the Preact subtree', () => {
		const host = createHost();
		registerComponents(host, [CoreBox, CoreText]);
		const root = createRoot(host.element);
		root.render(h(Box, {}, h(Text, {}, 'bye')));
		const box = element(host.element.children[0]!);
		const text = element(box.children[0]!);

		root.unmount();

		expect(host.element.children).toEqual([]);
		expect(box.node).toBeNull();
		expect(text.node).toBeNull();
	});
});
