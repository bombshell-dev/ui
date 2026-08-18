import { HostApi, createHost, type HostElement, type HostLiteral } from '@clack/ui';
import type { InputEvent } from '@clack/ui';
import type { HostEventListener } from '@clack/ui/events';
import {
	Fragment,
	defineComponent,
	h,
	mergeProps,
	nextTick,
	onErrorCaptured,
	ref,
	type VNode,
} from 'vue';
import { assert, describe, expect, test, vi } from 'vitest';
import { Box, Text, createRoot } from './index.ts';

describe('createRoot', () => {
	test('builds and attaches a Vue subtree through the Host', () => {
		const host = createHost();
		const root = createRoot(host.element);

		root.render(
			h(
				Box,
				{ layout: { direction: 'ttb' } },
				{ default: () => h(Text, { color: 15 }, { default: () => 'hello' }) },
			),
		);

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

		root.render(h('probe', { removable: 'yes' }, 'first'));
		const probe = element(host.element.children[0]!);
		const text = literal(probe.children[0]!);

		root.render(h('probe', { added: 0, ignored: undefined }, 'second'));

		expect(element(host.element.children[0]!)).toBe(probe);
		expect(probe.properties).toEqual({ added: 0 });
		expect(literal(probe.children[0]!)).toBe(text);
		expect(text.content).toBe('second');
	});

	test('moves keyed children within the same parent without recreating them', () => {
		const host = createHost();
		const root = createRoot(host.element);

		root.render(h('list', {}, [item('first'), item('second'), item('third')]));
		const list = element(host.element.children[0]!);
		const [first, second, third] = list.children;

		root.render(h('list', {}, [item('third'), item('first'), item('second')]));

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
		const root = createRoot(host.element);

		root.render(h('custom-element'));

		expect(createElement).toHaveBeenCalledWith('custom-element');
	});

	test('delivers Host events through Vue event properties', () => {
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

		const mergedFirst = vi.fn();
		const mergedSecond = vi.fn();
		root.render(h('input', mergeProps({ onInput: mergedFirst }, { onInput: mergedSecond })));
		listener!(event);

		expect(mergedFirst).toHaveBeenCalledWith(event);
		expect(mergedSecond).toHaveBeenCalledWith(event);

		root.render(h('input'));

		expect(listener).toBeUndefined();
	});

	test('routes event handler failures through Vue error boundaries', () => {
		const host = createHost();
		let listener: HostEventListener<'input'> | undefined;
		HostApi.around(host.root, {
			addEventListener([node, target, type, current], next) {
				if (type === 'input') listener = current as HostEventListener<'input'>;
				return next(node, target, type, current);
			},
		});
		const root = createRoot(host.element);
		const failure = new Error('input failed');
		const captured = vi.fn();
		const Input = defineComponent(
			() => () =>
				h('input', {
					onInput() {
						throw failure;
					},
				}),
		);
		const Boundary = defineComponent(() => {
			onErrorCaptured((error) => {
				captured(error);
				return false;
			});
			return () => h(Input);
		});

		root.render(h(Boundary));
		const input = element(host.element.children[0]!);
		listener!({ type: 'input', target: input, value: 'hello' });

		expect(captured).toHaveBeenCalledWith(failure);
	});

	test('applies updates scheduled by Vue reactivity', async () => {
		const host = createHost();
		const root = createRoot(host.element);
		const count = ref(0);
		const Counter = defineComponent(() => () => h('text', {}, String(count.value)));

		root.render(h(Counter));
		const text = element(host.element.children[0]!);

		count.value = 1;
		await nextTick();

		expect(literal(text.children[0]!).content).toBe('1');
	});

	test('supports Vue fragment and conditional anchors', async () => {
		const host = createHost();
		const root = createRoot(host.element);
		const visible = ref(false);
		const App = defineComponent(
			() => () => h(Fragment, {}, [h('first'), visible.value ? h('second') : null, h('third')]),
		);

		root.render(h(App));

		expect(elementNames(host.element)).toEqual(['first', 'third']);

		visible.value = true;
		await nextTick();

		expect(elementNames(host.element)).toEqual(['first', 'second', 'third']);
	});

	test('keeps roots isolated to their own Hosts', () => {
		const firstHost = createHost();
		const secondHost = createHost();
		const firstRoot = createRoot(firstHost.element);
		const secondRoot = createRoot(secondHost.element);

		firstRoot.render(h('first'));
		secondRoot.render(h('second'));

		expect(element(firstHost.element.children[0]!).name).toBe('first');
		expect(element(secondHost.element.children[0]!).name).toBe('second');
	});

	test('exposes raw Host elements through Vue refs', () => {
		const host = createHost();
		const root = createRoot(host.element);
		const observed = ref<HostElement | null>(null);
		const App = defineComponent(
			() => () =>
				h('probe', {
					ref(value: HostElement | null) {
						observed.value = value;
					},
				}),
		);

		root.render(h(App));

		expect(observed.value).toBe(element(host.element.children[0]!));
	});

	test('unmounts and detaches the Vue subtree', () => {
		const host = createHost();
		const root = createRoot(host.element);
		root.render(h(Box, {}, { default: () => h(Text, {}, { default: () => 'bye' }) }));
		const box = element(host.element.children[0]!);
		const text = element(box.children[0]!);

		root.unmount();

		expect(host.element.children).toEqual([]);
		expect(box.node).toBeNull();
		expect(text.node).toBeNull();
	});
});

function element(child: HostElement['children'][number]): HostElement {
	assert(child.type === 'element');
	return child;
}

function literal(child: HostElement['children'][number]): HostLiteral {
	assert(child.type === 'literal');
	return child;
}

function item(key: string): VNode {
	return h('item', { key, name: key });
}

function elementNames(parent: HostElement): string[] {
	return parent.children
		.filter((child): child is HostElement => child.type === 'element')
		.map((child) => child.name);
}
