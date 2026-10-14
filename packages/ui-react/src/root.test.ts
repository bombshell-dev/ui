// oxlint-disable max-params -- HostApi decorator signatures mirror the methods they wrap.
import {
	HostApi,
	EventApi,
	HostDOMEvent,
	createHost,
	emit,
	type HostElement,
	type HostLiteral,
	type InputEvent,
	Box as CoreBox,
	Text as CoreText,
	Dialog,
	Input,
	registerComponents,
	installBrowserFacade,
} from '@clack/ui';
import type { HostEvent, HostEventListener } from '@clack/ui/events';
import {
	createElement as h,
	type ReactElement,
	type ReactNode,
	type ReactPortal,
	useEffect,
	useState,
} from 'react';
import { assert, describe, expect, test, vi } from 'vitest';
import { Box, Text, createRoot } from './index.ts';
import { reconciler } from './reconciler.ts';

function element(child: HostElement['childNodes'][number]): HostElement {
	assert(child.type === 'element');
	return child;
}

function literal(child: HostElement['childNodes'][number]): HostLiteral {
	assert(child.type === 'literal');
	return child;
}

function item(key: string): ReactElement {
	return h('item', { key, name: key });
}

function createPortal(children: ReactNode, container: HostElement): ReactPortal {
	// @types/react-reconciler omits the ReactElement fields from its ReactPortal declaration.
	return reconciler.createPortal(children, container, null, null) as unknown as ReactPortal;
}

function Counter(): ReactElement {
	const [count, setCount] = useState(0);
	useEffect(() => setCount(1), []);
	return h(Text, {}, String(count));
}

describe('createRoot', () => {
	test('controlled input write-backs preserve middle-edit caret position', async () => {
		const host = createHost();
		registerComponents(host, [Input]);
		function ControlledInput(): ReactElement {
			const [value, setValue] = useState('abcd');
			return h('input', {
				value,
				'data-value': value,
				onInput: (event: InputEvent) => setValue(event.value),
			});
		}
		const root = createRoot(host.element);
		root.render(h(ControlledInput));
		const input = element(host.element.children[0]!);
		input.keydown!({ type: 'keydown', key: 'ArrowLeft', code: 'ArrowLeft' });
		input.keydown!({ type: 'keydown', key: 'ArrowLeft', code: 'ArrowLeft' });
		input.keydown!({ type: 'keydown', key: 'X', code: 'x', text: 'X' });
		await vi.waitFor(() => expect(input.properties['data-value']).toBe('abXcd'));
		expect(input.properties.caret).toBe(3);
		input.keydown!({ type: 'keydown', key: 'Y', code: 'y', text: 'Y' });
		await vi.waitFor(() => expect(input.properties['data-value']).toBe('abXYcd'));
		expect(input.properties.caret).toBe(4);
		root.unmount();
	});
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

	test('builds and attaches a React subtree through the Host', () => {
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
		const text = literal(probe.childNodes[0]!);

		root.render(h('probe', { nullable: null, added: 0, ignored: undefined }, 'second'));

		expect(element(host.element.children[0]!)).toBe(probe);
		expect(probe.properties).toEqual({ nullable: null, added: 0 });
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

		root.render(h('text', null, 'fresh'));
		const fresh = element(body.children[0]!);
		expect(stale.parent).toBeNull();
		expect(stale.node).toBeNull();
		expect(staleText.parent).toBeNull();
		expect(dialog.children).toEqual(scaffold);
		expect(body.children).toEqual([fresh]);

		root.unmount();

		expect(body.children).toEqual([]);
		expect(dialog.children).toEqual(scaffold);
		expect(element(scaffold[0]!).node).not.toBeNull();
		expect(fresh.node).toBeNull();
	});

	test('tears down a nested portal after its container has been detached', () => {
		const host = createHost();
		const onError = vi.fn();
		const root = createRoot(host.element, { onError });
		root.render(h('container'));
		const container = element(host.element.children[0]!);
		const nestedContainer = host.createElement('nested-container');
		host.insertBefore(container, nestedContainer);
		root.render(
			h(
				'container',
				null,
				createPortal(
					h(
						'text',
						null,
						'portal',
						createPortal(h('text', null, 'nested portal'), nestedContainer),
					),
					container,
				),
			),
		);
		const portalChild = element(container.children[1]!);
		const nestedChild = element(nestedContainer.children[0]!);

		root.unmount();

		expect(onError).not.toHaveBeenCalled();
		expect(container.node).toBeNull();
		expect(container.children).toEqual([nestedContainer]);
		expect(nestedContainer.node).toBeNull();
		expect(nestedContainer.children).toEqual([]);
		expect(portalChild.parent).toBeNull();
		expect(portalChild.node).toBeNull();
		expect(nestedChild.parent).toBeNull();
		expect(nestedChild.node).toBeNull();
		expect(host.element.children).toEqual([]);
	});

	test.each(['semantic', 'native'])(
		'bubbles %s portal events once through logical ancestors, not unrelated physical parents',
		(source) => {
			const host = createHost();
			const browser = installBrowserFacade(host);
			const root = createRoot(host.element);
			const physical = vi.fn();
			root.render(h('physical', { key: 'physical', onClick: physical }));
			const container = element(host.element.children[0]!);
			const calls: string[] = [];
			const logical = vi.fn((event: HostEvent<'click'>) => {
				calls.push('logical');
				expect(event.currentTarget).toBe(ancestor);
				expect(event.target).toBe(child);
			});
			root.render([
				h('physical', { key: 'physical', onClick: physical }),
				h(
					'logical',
					{ key: 'logical', onClick: logical },
					createPortal(h('text', { onClick: () => calls.push('child') }), container),
				),
			]);
			const ancestor = element(host.element.children[1]!);
			const child = element(container.children[0]!);
			expect(EventApi.at(host.root).getEventParent(child)).toBe(ancestor);
			expect(EventApi.at(host.root).getEventParent(ancestor)).toBe(host.element);

			if (source === 'semantic') emit(child, { type: 'click' });
			else browser.element(child).dispatchEvent(new HostDOMEvent('click', { bubbles: true }));

			expect(calls).toEqual(['child', 'logical']);
			expect(logical).toHaveBeenCalledTimes(1);
			expect(physical).not.toHaveBeenCalled();
		},
	);

	test.each(['semantic', 'native'])(
		'bubbles retained %s elements through physical parents after React unmount',
		async (source) => {
			const host = createHost();
			const browser = installBrowserFacade(host);
			const root = createRoot(host.element);
			root.render(h('parent', null, h('child')));
			const parent = element(host.element.children[0]!);
			const child = element(parent.children[0]!);
			const destination = host.createElement('destination');
			const calls: string[] = [];
			host.addEventListener(parent, 'click', () => calls.push('parent'));
			host.addEventListener(destination, 'click', () => calls.push('destination'));
			host.addEventListener(host.element, 'click', () => calls.push('host'));
			const documentClick = vi.fn();
			browser.document.addEventListener('click', documentClick);
			root.unmount();
			host.insertBefore(host.element, destination);

			for (const phase of ['immediate', 'passive']) {
				if (phase === 'passive') {
					await new Promise<void>((resolve) => setTimeout(resolve, 0));
					reconciler.flushPassiveEffects();
				}
				expect(child.parent).toBe(parent);
				expect(child.node).toBeNull();
				expect(EventApi.at(host.root).getEventParent(child)).toBe(parent);
				calls.length = 0;
				documentClick.mockClear();
				if (source === 'semantic') emit(child, { type: 'click' });
				else browser.element(child).dispatchEvent(new HostDOMEvent('click', { bubbles: true }));
				expect(calls).toEqual(['parent']);
				expect(documentClick).not.toHaveBeenCalled();

				host.insertBefore(destination, child);
				expect(EventApi.at(host.root).getEventParent(child)).toBe(destination);
				calls.length = 0;
				if (source === 'semantic') emit(child, { type: 'click' });
				else browser.element(child).dispatchEvent(new HostDOMEvent('click', { bubbles: true }));
				expect(calls).toEqual(['destination', 'host']);
				expect(documentClick).toHaveBeenCalledTimes(1);
				host.removeChild(destination, child);
				host.insertBefore(parent, child);
			}
		},
	);

	test('continues ordinary React bubbling through the Host mount container', () => {
		const host = createHost();
		const browser = installBrowserFacade(host);
		const mount = host.createElement('mount');
		host.insertBefore(host.element, mount);
		const calls: string[] = [];
		host.addEventListener(mount, 'click', () => calls.push('mount'));
		host.addEventListener(host.element, 'click', () => calls.push('host'));
		const root = createRoot(mount);
		root.render(h('text', { onClick: () => calls.push('react') }, 'child'));
		expect(EventApi.at(host.root).getEventParent(mount.children[0]!)).toBe(mount);
		expect(EventApi.at(host.root).getEventParent(mount)).toBe(host.element);
		browser.element(mount.children[0]!).dispatchEvent(new HostDOMEvent('click', { bubbles: true }));
		expect(calls).toEqual(['react', 'mount', 'host']);
		root.unmount();
	});

	test('honors cancellation and updated listeners along portal ancestry', () => {
		const host = createHost();
		const browser = installBrowserFacade(host);
		const mount = host.createElement('mount');
		host.insertBefore(host.element, mount);
		const root = createRoot(mount);
		const container = host.createElement('container');
		host.insertBefore(host.element, container);
		const ancestor = vi.fn();
		const first = vi.fn((event: HostEvent<'click'>) => event.stopPropagation!());
		const second = vi.fn((event: HostEvent<'click'>) => event.preventDefault!());
		const tree = (onClick: typeof first) =>
			h('logical', { onClick: ancestor }, createPortal(h('text', { onClick }), container));
		root.render(tree(first));
		const child = element(container.children[0]!);
		const stopped = new HostDOMEvent('click', { bubbles: true });

		browser.element(child).dispatchEvent(stopped);

		expect(stopped.cancelBubble).toBe(true);
		expect(ancestor).not.toHaveBeenCalled();
		root.render(tree(second));
		const cancelled = new HostDOMEvent('click', { bubbles: true, cancelable: true });
		expect(browser.element(child).dispatchEvent(cancelled)).toBe(false);
		expect(first).toHaveBeenCalledTimes(1);
		expect(second).toHaveBeenCalledTimes(1);
		expect(ancestor).toHaveBeenCalledTimes(1);
		expect(cancelled.defaultPrevented).toBe(true);

		browser.element(child).dispatchEvent(new HostDOMEvent('click', { bubbles: false }));
		expect(second).toHaveBeenCalledTimes(2);
		expect(ancestor).toHaveBeenCalledTimes(1);
	});

	test('reconciles dynamic children inside composed component slots', () => {
		const host = createHost();
		registerComponents(host, [Dialog, CoreText]);
		const root = createRoot(host.element);

		root.render(h('dialog', null, h('text', { key: 'first' }, 'first')));
		const dialog = element(host.element.children[0]!);
		const panel = element(dialog.children[0]!);
		const body = element(panel.children[2]!);
		const first = element(body.children[0]!);

		root.render(
			h(
				'dialog',
				null,
				h('text', { key: 'second' }, 'second'),
				h('text', { key: 'third' }, 'third'),
			),
		);
		const second = element(body.children[0]!);
		const third = element(body.children[1]!);
		root.render(h('dialog', null, h('text', { key: 'third' }, 'third')));

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

		root.render(h('custom-element'));

		expect(createElement).toHaveBeenCalledWith('custom-element');
	});

	test('delivers Host events through React event properties', () => {
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
		expect(listener).toBe(first);
		expect(EventApi.at(host.root).hasEventListener(input, 'input')).toBe(true);
		EventApi.at(host.root).dispatchEvent(event);

		expect(first).toHaveBeenCalledWith(event);
		expect(input.properties).toEqual({});

		root.render(h('input', { onInput: second }));
		expect(listener).toBe(second);
		EventApi.at(host.root).dispatchEvent(event);

		expect(first).toHaveBeenCalledTimes(1);
		expect(second).toHaveBeenCalledWith(event);

		root.render(h('input'));
		expect(listener).toBeUndefined();
		expect(EventApi.at(host.root).hasEventListener(input, 'input')).toBe(false);
		EventApi.at(host.root).dispatchEvent(event);
		expect(second).toHaveBeenCalledTimes(1);
	});

	test('applies updates scheduled by React hooks', async () => {
		const host = createHost();
		registerComponents(host, [CoreText]);
		const onCommit = vi.fn();
		const root = createRoot(host.element, { onCommit });

		root.render(h(Counter));

		const text = element(host.element.children[0]!);
		await vi.waitFor(() => expect(literal(text.childNodes[0]!).content).toBe('1'));
		expect(onCommit).toHaveBeenCalledTimes(2);
	});

	test('unmounts and detaches the React subtree', () => {
		const host = createHost();
		registerComponents(host, [CoreBox, CoreText]);
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
