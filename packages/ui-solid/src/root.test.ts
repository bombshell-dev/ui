import {
	HostApi,
	createHost,
	type HostElement,
	type HostElementChild,
	type HostLiteral,
} from '@clack/ui';
import type { InputEvent } from '@clack/ui';
import type { Dispatched, HostEventListener } from '@clack/ui/events';
import { createSignal } from 'solid-js';
import { assert, describe, expect, test, vi } from 'vitest';
import {
	Box,
	Text,
	createComponent,
	createElement,
	createRoot,
	effect,
	insert,
	setProp,
} from './index.ts';

const reactiveRuntime = (() => {
	const [value, setValue] = createSignal(0);
	let observed = -1;
	effect(() => (observed = value()));
	setValue(1);
	return observed === 1;
})();

function element(child: HostElementChild): HostElement {
	assert(child.type === 'element');
	return child;
}

function literal(child: HostElementChild): HostLiteral {
	assert(child.type === 'literal');
	return child;
}

describe('createRoot', () => {
	test('builds and attaches a Solid subtree through the Host', () => {
		const host = createHost();
		const root = createRoot(host.element);

		root.render(() =>
			createComponent(Box, {
				layout: { direction: 'ttb' },
				get children() {
					return createComponent(Text, { color: 15, children: 'hello' });
				},
			}),
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

		root.render(() => createElement('probe'));

		expect(root.element).toBe(container);
		expect(host.element.children).toEqual([container]);
		expect(element(container.children[0]!)).toMatchObject({ name: 'probe' });

		root.unmount();

		expect(container.children).toEqual([]);
		expect(container.node).not.toBeNull();
	});

	test.runIf(reactiveRuntime)('updates and removes properties and updates text literals', () => {
		const host = createHost();
		const root = createRoot(host.element);
		const [state, setState] = createSignal({
			added: undefined as number | undefined,
			content: 'first',
			nullable: null,
			removable: 'yes' as string | undefined,
		});
		let probe!: HostElement;

		root.render(() => {
			probe = element(createElement('probe'));
			effect((previous: ReturnType<typeof state> | undefined) => {
				const current = state();
				setProp(probe, 'added', current.added, previous?.added);
				setProp(probe, 'nullable', current.nullable, previous?.nullable);
				setProp(probe, 'removable', current.removable, previous?.removable);
				return current;
			});
			insert(probe, () => state().content);
			return probe;
		});

		const text = literal(probe.children[0]!);
		setState({ added: 0, content: 'second', nullable: null, removable: undefined });

		expect(probe.properties).toEqual({ added: 0, nullable: null });
		expect(literal(probe.children[0]!)).toBe(text);
		expect(text.content).toBe('second');
	});

	test.runIf(reactiveRuntime)(
		'moves reactive children within the same parent without recreating them',
		() => {
			const host = createHost();
			const root = createRoot(host.element);
			const [order, setOrder] = createSignal<HostElement[]>([]);
			let list!: HostElement;
			let first!: HostElement;
			let second!: HostElement;
			let third!: HostElement;

			root.render(() => {
				list = element(createElement('list'));
				first = element(createElement('item'));
				second = element(createElement('item'));
				third = element(createElement('item'));
				setOrder([first, second, third]);
				insert(list, order);
				return list;
			});

			setOrder([third, first, second]);

			expect(list.children).toEqual([third, first, second]);
		},
	);

	test('routes element creation through Host middleware', () => {
		const host = createHost();
		const createElementCall = vi.fn();
		HostApi.around(host.root, {
			createElement([node, name], next) {
				createElementCall(name);
				return next(node, name);
			},
		});
		const root = createRoot(host.element);

		root.render(() => createElement('custom-element'));

		expect(createElementCall).toHaveBeenCalledWith('custom-element');
	});

	test('delivers Host events through Solid event properties', () => {
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
		let input!: HostElement;

		root.render(() => {
			input = element(createElement('input'));
			setProp(input, 'onInput', first);
			return input;
		});
		const event: Dispatched<InputEvent> = {
			type: 'input',
			target: input,
			currentTarget: input,
			value: 'hello',
			stopPropagation: () => {},
		};
		listener!(event);

		expect(first).toHaveBeenCalledWith(event);
		expect(input.properties).toEqual({});

		setProp(input, 'onInput', second, first);
		listener!(event);

		expect(first).toHaveBeenCalledTimes(1);
		expect(second).toHaveBeenCalledWith(event);
	});

	test.runIf(reactiveRuntime)('applies fine-grained updates scheduled by Solid signals', () => {
		const host = createHost();
		const root = createRoot(host.element);
		const [count, setCount] = createSignal(0);
		let text!: HostElement;

		root.render(() => {
			text = element(createElement('text'));
			insert(text, count);
			return text;
		});

		const instance = literal(text.children[0]!);
		setCount(1);

		expect(literal(text.children[0]!)).toBe(instance);
		expect(instance.content).toBe('1');
	});

	test('unmounts and detaches the Solid subtree', () => {
		const host = createHost();
		const root = createRoot(host.element);
		let box!: HostElement;
		let text!: HostElement;
		root.render(() => {
			box = element(createElement('box'));
			text = element(createElement('text'));
			insert(box, text);
			return box;
		});

		root.unmount();

		expect(host.element.children).toEqual([]);
		expect(box.node).toBeNull();
		expect(text.node).toBeNull();
	});
});
