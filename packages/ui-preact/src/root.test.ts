import { HostApi, createHost, type HostElement, type TextLiteral } from '@clack/ui';
import type { InputEvent } from '@clack/ui';
import type { HostEventListener } from '@clack/ui/events';
import { createElement as h, type VNode } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { assert, describe, expect, test, vi } from 'vitest';
import { Box, Text, createRoot } from './index.ts';

function element(child: HostElement['children'][number]): HostElement {
	assert(child.type === 'element');
	return child;
}

function literal(child: HostElement['children'][number]): TextLiteral {
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
	test('builds and attaches a Preact subtree through the Host', () => {
		const host = createHost();
		const root = createRoot(host);

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

	test('updates and removes properties and updates text literals', () => {
		const host = createHost();
		const root = createRoot(host);

		root.render(h('probe', { removable: 'yes', structured: { value: 1 } }, 'first'));
		const probe = element(host.element.children[0]!);
		const text = literal(probe.children[0]!);

		root.render(h('probe', { added: 0, structured: { value: 2 } }, 'second'));

		expect(element(host.element.children[0]!)).toBe(probe);
		expect(probe.properties).toEqual({ added: 0, structured: { value: 2 } });
		expect(literal(probe.children[0]!)).toBe(text);
		expect(text.content).toBe('second');
	});

	test('moves keyed children within the same parent without recreating them', () => {
		const host = createHost();
		const root = createRoot(host);

		root.render(h('list', {}, item('first'), item('second'), item('third')));
		const list = element(host.element.children[0]!);
		const [first, second, third] = list.children;

		root.render(h('list', {}, item('third'), item('first'), item('second')));

		expect(list.children).toEqual([third, first, second]);
	});

	test('routes element creation through Host middleware', () => {
		const host = createHost();
		const createElement = vi.fn();
		HostApi.around(host.root, {
			createElement([node, name], next) {
				createElement(name);
				return next(node, name);
			},
		});
		const root = createRoot(host);

		root.render(h('custom-element', null));

		expect(createElement).toHaveBeenCalledWith('custom-element');
	});

	test('delivers Host events through Preact event properties', () => {
		const host = createHost();
		let listener: HostEventListener<'input'> | undefined;
		HostApi.around(host.root, {
			addEventListener([node, target, type, current], next) {
				if (type === 'input') listener = current as HostEventListener<'input'>;
				return next(node, target, type, current);
			},
			removeEventListener([node, target, type, current], next) {
				if (current === listener) listener = undefined;
				return next(node, target, type, current);
			},
		});
		const root = createRoot(host);
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
		const root = createRoot(host);

		root.render(h(Counter, {}));

		const text = element(host.element.children[0]!);
		await vi.waitFor(() => expect(literal(text.children[0]!).content).toBe('1'));
	});

	test('unmounts and detaches the Preact subtree', () => {
		const host = createHost();
		const root = createRoot(host);
		root.render(h(Box, {}, h(Text, {}, 'bye')));
		const box = element(host.element.children[0]!);
		const text = element(box.children[0]!);

		root.unmount();

		expect(host.element.children).toEqual([]);
		expect(box.node).toBeNull();
		expect(text.node).toBeNull();
	});
});
