import { HostApi, createHost, type HostElement, type HostLiteral } from '@clack/ui';
import type { InputEvent } from '@clack/ui';
import type { HostEventListener } from '@clack/ui/events';
import { createElement as h, type ReactElement, useEffect, useState } from 'react';
import { assert, describe, expect, test, vi } from 'vitest';
import { Box, Text, createRoot } from './index.ts';

function element(child: HostElement['children'][number]): HostElement {
	assert(child.type === 'element');
	return child;
}

function literal(child: HostElement['children'][number]): HostLiteral {
	assert(child.type === 'literal');
	return child;
}

function item(key: string): ReactElement {
	return h('item', { key, name: key });
}

function Counter(): ReactElement {
	const [count, setCount] = useState(0);
	useEffect(() => setCount(1), []);
	return h(Text, {}, String(count));
}

describe('createRoot', () => {
	test('builds and attaches a React subtree through the Host', () => {
		const host = createHost();
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
		expect(literal(text.children[0]!)).toMatchObject({ content: 'hello', parent: text });
	});

	test('mounts within the supplied attached element', () => {
		const host = createHost();
		const container = host.createElement('container');
		host.insertBefore(host.element, container);
		const root = createRoot(container);

		root.render(h('probe'));

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

		root.render(h('probe', { nullable: null, removable: 'yes' }, 'first'));
		const probe = element(host.element.children[0]!);
		const text = literal(probe.children[0]!);

		root.render(h('probe', { nullable: null, added: 0, ignored: undefined }, 'second'));

		expect(element(host.element.children[0]!)).toBe(probe);
		expect(probe.properties).toEqual({ nullable: null, added: 0 });
		expect(literal(probe.children[0]!)).toBe(text);
		expect(text.content).toBe('second');
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

		root.render(h('custom-element'));

		expect(createElement).toHaveBeenCalledWith('custom-element');
	});

	test('delivers Host events through React event properties', () => {
		const host = createHost();
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

	test('applies updates scheduled by React hooks', async () => {
		const host = createHost();
		const onCommit = vi.fn();
		const root = createRoot(host.element, { onCommit });

		root.render(h(Counter));

		const text = element(host.element.children[0]!);
		await vi.waitFor(() => expect(literal(text.children[0]!).content).toBe('1'));
		expect(onCommit).toHaveBeenCalledTimes(2);
	});

	test('unmounts and detaches the React subtree', () => {
		const host = createHost();
		const onCommit = vi.fn();
		const root = createRoot(host.element, { onCommit });
		root.render(h(Box, {}, h(Text, {}, 'bye')));
		const box = element(host.element.children[0]!);
		const text = element(box.children[0]!);

		root.unmount();

		expect(host.element.children).toEqual([]);
		expect(box.node).toBeNull();
		expect(text.node).toBeNull();
		expect(onCommit).toHaveBeenCalledTimes(2);
	});
});
