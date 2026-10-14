// oxlint-disable max-params -- HostApi decorator signatures mirror the methods they wrap.
import {
	HostApi,
	createHost,
	type HostElement,
	type HostElementChild,
	type HostLiteral,
	type InputEvent,
	Box as CoreBox,
	Text as CoreText,
	Dialog,
	Input,
	registerComponents,
} from '@clack/ui';
import type { HostEventListener } from '@clack/ui/events';
import { createSignal } from 'solid-js';
import { assert, describe, expect, test, vi } from 'vitest';
import {
	Box,
	Text,
	createComponent,
	createElement,
	createRoot,
	createTextNode,
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
	test('does not install standard definitions, browser elements, or globals', () => {
		const document = Reflect.get(globalThis, 'document');
		const window = Reflect.get(globalThis, 'window');
		const host = createHost();
		const root = createRoot(host.element);
		root.render(() => createElement('custom-element'));
		expect(HostApi.at(host.root).definitions.size).toBe(0);
		expect('document' in HostApi.at(host.root)).toBe(false);
		expect('ownerDocument' in host.element).toBe(false);
		expect(Reflect.get(globalThis, 'document')).toBe(document);
		expect(Reflect.get(globalThis, 'window')).toBe(window);
		expect(element(host.element.children[0]!).name).toBe('custom-element');
		root.unmount();
	});

	test('builds and attaches a Solid subtree through the Host', () => {
		const host = createHost();
		registerComponents(host, [CoreBox, CoreText]);
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
		expect(literal(text.childNodes[0]!)).toMatchObject({ content: 'hello', parent: text });
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

		const text = literal(probe.childNodes[0]!);
		setState({ added: 0, content: 'second', nullable: null, removable: undefined });

		expect(probe.properties).toEqual({ added: 0, nullable: null });
		expect(literal(probe.childNodes[0]!)).toBe(text);
		expect(text.content).toBe('second');
	});

	test('clears consumer children without removing a composed root scaffold', () => {
		const host = createHost();
		registerComponents(host, [Dialog, CoreText]);
		const dialog = host.createElement('dialog');
		host.insertBefore(host.element, dialog);
		const scaffold = dialog.children.slice();
		const body = dialog.childrenContainer!;
		const stale = host.createElement('text');
		host.insertBefore(dialog, stale);
		const staleText = host.createLiteral('stale text');
		host.insertBefore(dialog, staleText);
		const root = createRoot(dialog);

		root.render(() => createElement('text'));
		const first = element(body.children[0]!);
		expect(stale.parent).toBeNull();
		expect(stale.node).toBeNull();
		expect(staleText.parent).toBeNull();
		expect(dialog.children).toEqual(scaffold);
		root.render(() => createElement('text'));
		const second = element(body.children[0]!);
		expect(first.parent).toBeNull();
		expect(first.node).toBeNull();
		expect(body.children).toEqual([second]);

		root.unmount();

		expect(body.children).toEqual([]);
		expect(dialog.children).toEqual(scaffold);
		expect(element(scaffold[0]!).node).not.toBeNull();
		expect(second.node).toBeNull();
	});

	test('unmounts a nested root after its composed container is detached', () => {
		const host = createHost();
		registerComponents(host, [Dialog, CoreText]);
		const outer = createRoot(host.element);
		outer.render(() => createElement('dialog'));
		const dialog = element(host.element.children[0]!);
		const inner = createRoot(dialog);
		inner.render(() => createElement('text'));
		const body = dialog.childrenContainer!;
		const child = element(body.children[0]!);

		outer.unmount();
		expect(dialog.node).toBeNull();
		expect(() => inner.unmount()).not.toThrow();

		expect(body.children).toEqual([]);
		expect(child.parent).toBeNull();
		expect(child.node).toBeNull();
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

	test.runIf(reactiveRuntime)('reorders mixed children and removes root text on unmount', () => {
		const host = createHost();
		const root = createRoot(host.element);
		const [children, setChildren] = createSignal<HostElementChild[]>([]);
		let first!: HostElementChild;
		let second!: HostElementChild;
		let before!: HostElementChild;
		let between!: HostElementChild;
		let after!: HostElementChild;
		let list!: HostElement;
		root.render(() => {
			list = element(createElement('list'));
			first = createElement('first');
			second = createElement('second');
			before = createTextNode('before');
			between = createTextNode('between');
			after = createTextNode('after');
			setChildren([before, first, between, second, after]);
			insert(list, children);
			return list;
		});

		setChildren([before, second, between, first, after]);

		expect(list.children).toEqual([second, first]);
		expect(list.childNodes).toEqual([before, second, between, first, after]);
		root.render(() => createTextNode('root text'));
		const rootText = literal(host.element.childNodes[0]!);
		root.unmount();
		expect(host.element.childNodes).toEqual([]);
		expect(rootText.parent).toBeNull();
	});

	test.runIf(reactiveRuntime)(
		'reconciles reactive children inside composed component slots',
		() => {
			const host = createHost();
			registerComponents(host, [Dialog, CoreText]);
			const root = createRoot(host.element);
			const [children, setChildren] = createSignal<HostElement[]>([]);
			let dialog!: HostElement;
			let first!: HostElement;
			let second!: HostElement;
			let third!: HostElement;

			root.render(() => {
				dialog = element(createElement('dialog'));
				first = element(createElement('text'));
				second = element(createElement('text'));
				third = element(createElement('text'));
				setChildren([first]);
				insert(dialog, children);
				return dialog;
			});
			const panel = element(dialog.children[0]!);
			const body = element(panel.children[2]!);

			setChildren([second, third]);
			setChildren([third]);

			expect(body.children).toEqual([third]);
			expect(first.parent).toBeNull();
			expect(second.parent).toBeNull();
		},
	);

	test('routes element creation through Host middleware', () => {
		const host = createHost();
		const createElementCall = vi.fn();
		HostApi.decorate(host.root, () => ({
			createElement(name) {
				createElementCall(name);
				return super.createElement(name);
			},
		}));
		const root = createRoot(host.element);

		root.render(() => createElement('custom-element'));

		expect(createElementCall).toHaveBeenCalledWith('custom-element');
	});

	test('delivers Host events through Solid event properties', () => {
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
		let input!: HostElement;

		root.render(() => {
			input = element(createElement('input'));
			setProp(input, 'onInput', first);
			return input;
		});
		const event: InputEvent = { type: 'input', target: input, value: 'hello' };
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
		registerComponents(host, [CoreText]);
		const root = createRoot(host.element);
		const [count, setCount] = createSignal(0);
		let text!: HostElement;

		root.render(() => {
			text = element(createElement('text'));
			insert(text, count);
			return text;
		});

		const instance = literal(text.childNodes[0]!);
		setCount(1);

		expect(literal(text.childNodes[0]!)).toBe(instance);
		expect(instance.content).toBe('1');
	});

	test('unmounts and detaches the Solid subtree', () => {
		const host = createHost();
		registerComponents(host, [CoreBox, CoreText]);
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
