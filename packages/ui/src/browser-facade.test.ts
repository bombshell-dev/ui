import { describe, expect, test, vi } from 'vitest';
import { BrowserFacade, installBrowserFacade } from './browser-facade.ts';
import { HostDOMEvent } from './browser-types.ts';
import { createHost, HostApi, CrossHostInsertionError } from './host.ts';
import { getElementHost } from './elements.ts';
import { Api, LifecycleApi, Node } from './core.ts';
import { EventApi, emit } from './event-api.ts';
import type { AnyHostEvent } from './events.ts';
import type { InputEvent } from './elements/input.ts';

describe('browser facade installation', () => {
	test('constructs an ordinary facade without creating node scope contexts', () => {
		const host = createHost();
		const scope = new Node(host.root);
		const contexts = new Map(host.root.contexts);
		const browser = new BrowserFacade(host);
		expect(browser).toBeInstanceOf(BrowserFacade);
		expect(browser).not.toBeInstanceOf(Api);
		expect(browser.constructor).toBe(BrowserFacade);
		expect(browser.host).toBe(host);
		expect(browser.document.defaultView).toBe(browser.window);
		expect(browser.document.body).toBe(host.element);
		expect(browser).not.toHaveProperty('node');
		expect(host.root.contexts).toEqual(contexts);
		expect(scope.contexts).toBeUndefined();
	});

	test('repeated installation adds creation and event hooks only once', () => {
		const host = createHost();
		const browser = installBrowserFacade(host);
		const contexts = new Map(host.root.contexts);
		const enhanceElement = vi.spyOn(browser, 'element');
		const enhanceLiteral = vi.spyOn(browser, 'literal');
		const adapt = vi.spyOn(browser, 'dispatchEvent');
		for (let count = 0; count < 3; count++) expect(installBrowserFacade(host)).toBe(browser);
		expect(host.root.contexts).toEqual(contexts);
		expect(enhanceElement).not.toHaveBeenCalled();
		expect(enhanceLiteral).not.toHaveBeenCalled();
		const child = host.createElement('button');
		const literal = host.createLiteral('text');
		expect(enhanceElement).toHaveBeenCalledExactlyOnceWith(child);
		expect(enhanceLiteral).toHaveBeenCalledExactlyOnceWith(literal);
		host.element.append(child);
		const local = vi.fn();
		const global = vi.fn();
		child.addEventListener('click', local);
		browser.document.addEventListener('click', global);
		browser.document.addEventListener('click', global);
		emit(child, { type: 'click', bubbles: true });
		expect(adapt).toHaveBeenCalledOnce();
		expect(local).toHaveBeenCalledOnce();
		expect(global).toHaveBeenCalledOnce();
	});

	test('multiple local Hosts have independent ordinary facades and event pipelines', () => {
		const firstHost = createHost();
		const secondHost = createHost();
		const document = Reflect.get(globalThis, 'document');
		const window = Reflect.get(globalThis, 'window');
		const first = installBrowserFacade(firstHost);
		const second = installBrowserFacade(secondHost);
		expect(first).not.toBe(second);
		expect(first.document).not.toBe(second.document);
		expect(first.window).not.toBe(second.window);
		const firstListener = vi.fn();
		const secondListener = vi.fn();
		first.document.addEventListener('click', firstListener);
		second.document.addEventListener('click', secondListener);
		for (const [host, browser] of [
			[firstHost, first],
			[secondHost, second],
		] as const) {
			expect(browser).toBeInstanceOf(BrowserFacade);
			expect(browser).not.toBeInstanceOf(Api);
			expect(browser.host).toBe(host);
			expect(installBrowserFacade(host)).toBe(browser);
			const child = browser.document.createElement('button');
			host.element.append(child);
			expect(child.ownerDocument).toBe(browser.document);
			emit(child, { type: 'click', bubbles: true });
			expect(firstListener).toHaveBeenCalledOnce();
			expect(secondListener).toHaveBeenCalledTimes(host === firstHost ? 0 : 1);
		}
		first.window.innerWidth = 100;
		expect(second.window.innerWidth).toBe(80);
		expect(Reflect.get(globalThis, 'document')).toBe(document);
		expect(Reflect.get(globalThis, 'window')).toBe(window);
	});

	test('is idempotent and enhances existing nodes in place without installing globals or definitions', () => {
		const host = createHost();
		const literal = host.createLiteral('text');
		const child = host.createElement('button', literal);
		host.element.append(child);
		const document = Reflect.get(globalThis, 'document');
		const window = Reflect.get(globalThis, 'window');
		const definitions = HostApi.at(host.root).definitions.size;
		const browser = installBrowserFacade(host);
		expect(installBrowserFacade(host)).toBe(browser);
		expect(browser).toBeInstanceOf(BrowserFacade);
		expect(browser).not.toBeInstanceOf(Api);
		expect(browser.constructor).toBe(BrowserFacade);
		expect(Object.getPrototypeOf(browser)).toBe(BrowserFacade.prototype);
		expect(browser.host).toBe(host);
		expect(browser.document.defaultView.document).toBe(browser.document);
		for (const method of ['at', 'init', 'decorate']) {
			expect(BrowserFacade).not.toHaveProperty(method);
		}
		expect(browser).not.toHaveProperty('node');
		expect([...host.root.contexts!.keys()].some((key) => /Browser(Api|Facade)/.test(key))).toBe(
			false,
		);
		expect(browser.element(child)).toBe(child);
		expect(browser.literal(literal)).toBe(literal);
		expect(browser.element(child).ownerDocument).toBe(browser.document);
		expect(browser.literal(literal).ownerDocument).toBe(browser.document);
		expect(browser.document.documentElement).toBe(host.element);
		expect(browser.window).toBe(browser.document.defaultView);
		expect(browser.document.documentElement.tagName).toBe('HTML');
		expect(Reflect.get(globalThis, 'document')).toBe(document);
		expect(Reflect.get(globalThis, 'window')).toBe(window);
		expect(HostApi.at(host.root).definitions.size).toBe(definitions);
		expect(getElementHost(child)).toBe(host);
	});

	test('decorates future creation and explicitly enhanced detached nodes', () => {
		const host = createHost();
		const existing = host.createElement('input', { type: 'checkbox' }, 'before');
		const browser = installBrowserFacade(host);
		expect(existing).not.toHaveProperty('ownerDocument');
		expect(browser.element(existing)).toBe(existing);
		expect(browser.element(existing).getAttribute('type')).toBe('checkbox');
		expect(
			browser.literal(existing.childNodes[0] as ReturnType<typeof host.createLiteral>).data,
		).toBe('before');
		expect(host.createElement('button')).toHaveProperty('ownerDocument', browser.document);
		expect(host.createLiteral('after')).toHaveProperty('ownerDocument', browser.document);
		const created = browser.document.createElement('input');
		created.value = 'value';
		created.disabled = true;
		expect(created.properties).toEqual({ value: 'value', disabled: true });
	});

	test('enhances inserted pre-install subtrees before connection callbacks run', () => {
		const host = createHost();
		const literal = host.createLiteral('text');
		const child = host.createElement('button', literal);
		const subtree = host.createElement('div', child);
		const browser = installBrowserFacade(host);
		child.attach = vi.fn(() => {
			expect(browser.element(child).ownerDocument).toBe(browser.document);
			expect(child).toHaveProperty('dispatchEvent');
			expect(literal).toHaveProperty('ownerDocument', browser.document);
			expect(child.parent).toBe(subtree);
		});
		host.element.append(subtree);
		expect(child.attach).toHaveBeenCalledOnce();
	});

	test.each(['element', 'literal'] as const)(
		'rejects foreign %s insertion without mutation or installing the source facade',
		(type) => {
			const owner = createHost();
			const literal = owner.createLiteral('text');
			const child = owner.createElement('button', literal);
			owner.element.append(child);
			const childNode = child.node;
			const detach = vi.fn();
			child.detach = detach;
			const listener = vi.fn();
			child.addEventListener('click', listener);
			const recipient = createHost();
			const detachedParent = recipient.createElement('box');
			const recipientBrowser = installBrowserFacade(recipient);
			const global = vi.fn();
			recipientBrowser.document.addEventListener('click', global);
			const document = Reflect.get(globalThis, 'document');
			const window = Reflect.get(globalThis, 'window');
			const foreign = type === 'element' ? child : literal;
			expect(() => recipient.element.append(foreign)).toThrow(CrossHostInsertionError);
			expect(() => recipient.insertBefore(detachedParent, foreign)).toThrow(
				CrossHostInsertionError,
			);
			expect(detachedParent).not.toHaveProperty('ownerDocument');
			expect(detachedParent.childNodes).toEqual([]);
			expect(child.parent).toBe(owner.element);
			expect(literal.parent).toBe(child);
			expect(owner.element.childNodes).toEqual([child]);
			expect(child.childNodes).toEqual([literal]);
			expect(recipient.element.childNodes).toEqual([]);
			expect(child.node).toBe(childNode);
			expect(childNode!.parent).toBe(owner.root);
			expect(owner.root.children.has(childNode!)).toBe(true);
			expect(recipient.root.children.size).toBe(0);
			expect(detach).not.toHaveBeenCalled();
			expect(child).not.toHaveProperty('ownerDocument');
			expect(literal).not.toHaveProperty('ownerDocument');
			expect(owner.element).not.toHaveProperty('ownerDocument');
			expect(owner.element).not.toHaveProperty('querySelector');
			expect(child).not.toHaveProperty('querySelector');
			expect(Reflect.get(globalThis, 'document')).toBe(document);
			expect(Reflect.get(globalThis, 'window')).toBe(window);
			expect(getElementHost(child)).toBe(owner);
			expect(getElementHost(literal)).toBe(owner);
			emit(child, { type: 'click' });
			expect(listener).toHaveBeenCalledOnce();
			expect(listener.mock.calls[0]![0].nativeEvent).toBeUndefined();
			expect(global).not.toHaveBeenCalled();
		},
	);

	test('rejects foreign facade lookups and parent APIs without enhancing either Host', () => {
		const owner = createHost();
		const parent = owner.createElement('box');
		const child = owner.createElement('button');
		const literal = owner.createLiteral('text');
		const recipient = createHost();
		const browser = installBrowserFacade(recipient);
		expect(() => browser.element(child)).toThrow('Cannot enhance a node owned by another Host');
		expect(() => browser.literal(literal)).toThrow('Cannot enhance a node owned by another Host');
		expect(() => recipient.insertBefore(parent, child)).toThrow(CrossHostInsertionError);
		expect(parent.childNodes).toEqual([]);
		for (const node of [parent, child, literal]) expect(node).not.toHaveProperty('ownerDocument');
		expect(owner.element).not.toHaveProperty('ownerDocument');
		expect(owner.element).not.toHaveProperty('querySelector');
		expect(child).not.toHaveProperty('querySelector');
		const listener = vi.fn();
		child.addEventListener('click', listener);
		emit(child, { type: 'click' });
		expect(listener).toHaveBeenCalledOnce();
		expect(listener.mock.calls[0]![0].nativeEvent).toBeUndefined();
	});

	test('preserves same-Host ownership and listeners through detached enhancement and reattachment', () => {
		const host = createHost();
		const child = host.createElement('button');
		const listener = vi.fn();
		child.addEventListener('click', listener);
		const browser = installBrowserFacade(host);
		expect(browser.element(child)).toBe(child);
		expect(getElementHost(child)).toBe(host);
		host.element.append(child);
		child.remove();
		expect(getElementHost(child)).toBe(host);
		host.element.append(child);
		emit(child, { type: 'click' });
		expect(listener).toHaveBeenCalledOnce();
	});

	test('preserves existing semantic listeners and native cancellation after enhancement', () => {
		const host = createHost();
		const child = host.createElement('button');
		host.element.append(child);
		const before = vi.fn();
		child.addEventListener('click', before);
		const browser = installBrowserFacade(host);
		const element = browser.element(child);
		const native = vi.fn((event: HostDOMEvent) => event.preventDefault());
		element.addEventListener('click', native);
		const event = new HostDOMEvent('click', { cancelable: true });
		expect(element.dispatchEvent(event)).toBe(false);
		expect(before).toHaveBeenCalledOnce();
		expect(before.mock.calls[0]![0].nativeEvent).toBe(event);
		expect(native).toHaveBeenCalledWith(event);
		element.removeEventListener('click', before);
		element.dispatchEvent(new HostDOMEvent('click'));
		expect(before).toHaveBeenCalledOnce();
	});

	test.each(['connected', 'detached'] as const)(
		'suppresses %s emission before browser adaptation and defaults',
		(connection) => {
			const host = createHost();
			const browser = installBrowserFacade(host);
			const child = browser.element(host.createElement('input', { type: 'checkbox' }));
			if (connection === 'connected') host.element.append(child);
			const adapt = vi.spyOn(browser, 'dispatchEvent');
			const listener = vi.fn();
			child.addEventListener('click', listener);
			child.addEventListener('input', listener);
			child.addEventListener('change', listener);
			browser.document.addEventListener('click', listener);
			EventApi.decorate(child.node ?? host.root, () => ({
				emit() {
					return { handled: true, stopped: true };
				},
			}));
			expect(emit(child, { type: 'click' })).toEqual({ handled: true, stopped: true });
			const event = new HostDOMEvent('click', { bubbles: true });
			child.dispatchEvent(event);
			expect(event.cancelBubble).toBe(true);
			expect(child.checked).toBe(false);
			expect(adapt).not.toHaveBeenCalled();
			expect(listener).not.toHaveBeenCalled();
		},
	);

	test('uses one event listener store for detached native registration and semantic delivery', () => {
		const host = createHost();
		const browser = installBrowserFacade(host);
		const child = browser.document.createElement('button');
		const listener = vi.fn();
		child.addEventListener('pointerdown', listener);
		child.addEventListener('pointerdown', listener);
		expect(EventApi.at(host.root).hasEventListener(child, 'pointerDown')).toBe(true);
		host.element.append(child);
		emit(child, { type: 'pointerDown' });
		expect(listener).toHaveBeenCalledOnce();
		expect(listener.mock.calls[0]![0]).toBeInstanceOf(HostDOMEvent);
		child.removeEventListener('pointerdown', listener);
		expect(EventApi.at(host.root).hasEventListener(child, 'pointerDown')).toBe(false);
		child.dispatchEvent(new HostDOMEvent('pointerdown'));
		expect(listener).toHaveBeenCalledOnce();
		child.addEventListener('pointerdown', listener);
		child.remove();
		child.removeEventListener('pointerdown', listener);
		host.element.append(child);
		emit(child, { type: 'pointerDown' });
		expect(listener).toHaveBeenCalledOnce();
	});

	test('converts raw Host bounds into browser rects and shares viewport dimensions', () => {
		const host = createHost();
		const child = host.createElement('box');
		host.element.append(child);
		const bounds = { x: 2, y: 3, width: 7, height: 5 };
		host.setRenderInfo(
			new Map([[LifecycleApi.at(child.node!).id(child.node!), { bounds }]]) as Parameters<
				typeof host.setRenderInfo
			>[0],
		);
		expect(host.getBounds(child)).toBe(bounds);
		expect(host.getBounds(host.element)).toBe(bounds);
		const browser = installBrowserFacade(host);
		expect(browser.element(child).getBoundingClientRect()).toMatchObject({
			...bounds,
			top: 3,
			left: 2,
			right: 9,
			bottom: 8,
		});
		expect(browser.element(child).getBoundingClientRect().toJSON()).toEqual(bounds);
		expect(browser.document.defaultView.innerWidth).toBe(80);
		host.viewport.width = 100;
		expect(browser.document.defaultView.innerWidth).toBe(100);
		browser.document.defaultView.innerHeight = 40;
		expect(host.viewport.height).toBe(40);
		expect(browser.element(host.element).clientHeight).toBe(40);
		expect(browser.document.createElement('div').getBoundingClientRect()).toMatchObject({
			x: 0,
			y: 0,
			width: 0,
			height: 0,
		});
	});
});

describe('semantic browser event bridge', () => {
	test.each(['native', 'semantic'] as const)(
		'delivers a detached %s event through pre/post-facade listeners and structural parents only',
		(source) => {
			const host = createHost();
			const child = host.createElement('button');
			const parent = host.createElement('div', child);
			const calls: string[] = [];
			let semantic: AnyHostEvent | undefined;
			child.addEventListener('pointerDown', (event) => {
				semantic = event;
				expect(event.target).toBe(child);
				expect(event.currentTarget).toBe(child);
				calls.push('before');
			});
			const browser = installBrowserFacade(host);
			const element = browser.element(child);
			element.addEventListener('pointerdown', (event: HostDOMEvent) => {
				expect(event).toBe(semantic!.nativeEvent);
				expect(event.target).toBe(child);
				expect(event.currentTarget).toBe(child);
				calls.push('after');
			});
			browser.element(parent).addEventListener('pointerdown', (event: HostDOMEvent) => {
				expect(event).toBe(semantic!.nativeEvent);
				expect(event.target).toBe(child);
				expect(event.currentTarget).toBe(parent);
				calls.push('parent');
			});
			const global = vi.fn();
			browser.document.addEventListener('pointerdown', global);
			browser.window.addEventListener('pointerdown', global);
			expect(child.node).toBeNull();
			expect(element.isConnected).toBe(false);
			if (source === 'native') {
				const native = new HostDOMEvent('pointerdown', { bubbles: true, cancelable: true });
				expect(element.dispatchEvent(native)).toBe(true);
				expect(semantic!.nativeEvent).toBe(native);
			} else {
				expect(emit(child, { type: 'pointerDown', bubbles: true })).toEqual({
					handled: true,
					stopped: false,
				});
				expect(semantic!.nativeEvent).toBeInstanceOf(HostDOMEvent);
			}
			expect(calls).toEqual(['before', 'after', 'parent']);
			expect((semantic!.nativeEvent as HostDOMEvent).currentTarget).toBeNull();
			expect(global).not.toHaveBeenCalled();
		},
	);

	test.each([
		['native', false],
		['native', true],
		['semantic', false],
		['semantic', true],
	] as const)('runs detached %s checkbox defaults once unless canceled (%s)', (source, cancel) => {
		const host = createHost();
		const browser = installBrowserFacade(host);
		const child = browser.element(host.createElement('input', { type: 'checkbox' }));
		const local: string[] = [];
		const global = vi.fn();
		for (const type of ['click', 'input', 'change']) {
			child.addEventListener(type, (event: HostDOMEvent) => {
				local.push(event.type);
				if (cancel) event.preventDefault();
			});
			browser.document.addEventListener(type, global);
			browser.window.addEventListener(type, global);
		}
		if (source === 'native') {
			const native = new HostDOMEvent('click', { bubbles: true, cancelable: true });
			expect(child.dispatchEvent(native)).toBe(!cancel);
			expect(native.defaultPrevented).toBe(cancel);
		} else emit(child, { type: 'click', bubbles: true });
		expect(child.checked).toBe(!cancel);
		expect(local).toEqual(cancel ? ['click'] : ['click', 'input', 'change']);
		expect(global).not.toHaveBeenCalled();
	});

	test.each([
		['click', 'click'],
		['change', 'change'],
		['focus', 'focus'],
		['blur', 'blur'],
		['pointerDown', 'pointerdown'],
		['pointerMove', 'pointermove'],
		['pointerUp', 'pointerup'],
		['pointerCancel', 'pointercancel'],
	] as const)('bridges semantic %s to native %s exactly once', (type, nativeType) => {
		const host = createHost();
		const browser = installBrowserFacade(host);
		const child = browser.document.createElement('button');
		host.element.append(child);
		const calls: string[] = [];
		let native: HostDOMEvent | undefined;
		host.addEventListener(child, type, (event) => {
			expect(event.type).toBe(type);
			expect(event.currentTarget).toBe(child);
			native = event.nativeEvent as HostDOMEvent;
			calls.push('semantic');
		});
		child.addEventListener(nativeType, (event) => {
			expect(event).toBe(native);
			expect(event.type).toBe(nativeType);
			expect(event.target).toBe(child);
			expect(event.currentTarget).toBe(child);
			expect(event.pointerId).toBe(7);
			expect(event.clientX).toBe(12);
			calls.push('native');
		});
		browser.document.addEventListener(nativeType, (event) => {
			expect(event).toBe(native);
			expect(event.currentTarget).toBe(browser.document);
			calls.push('document');
		});
		browser.window.addEventListener(nativeType, (event) => {
			expect(event).toBe(native);
			expect(event.currentTarget).toBe(browser.window);
			calls.push('window');
		});
		expect(emit(child, { type, pointerId: 7, clientX: 12, bubbles: true })).toEqual({
			handled: true,
			stopped: false,
		});
		expect(calls).toEqual(['semantic', 'native', 'document', 'window']);
		expect(native!.currentTarget).toBeNull();
	});

	test('enriches the same event only after the default emit policy runs', () => {
		const host = createHost();
		const browser = installBrowserFacade(host);
		const child = browser.document.createElement('button');
		host.element.append(child);
		let semantic: AnyHostEvent | undefined;
		EventApi.decorate(child.node!, () => ({
			emit(event) {
				semantic = event;
				expect(event.nativeEvent).toBeUndefined();
				event.preventDefault!();
				return super.emit(event);
			},
		}));
		host.addEventListener(child, 'click', (event) => {
			expect(event).toBe(semantic);
			expect(event.nativeEvent).toBeInstanceOf(HostDOMEvent);
			expect(event.defaultPrevented).toBe(true);
		});
		const native = vi.fn((event: HostDOMEvent) => expect(event.defaultPrevented).toBe(true));
		child.addEventListener('click', native);
		emit(child, { type: 'click' });
		expect(native).toHaveBeenCalledOnce();
	});

	test.each(['pointerMove', 'pointerUp'] as const)(
		'retargets semantic %s to capture before listener traversal',
		(type) => {
			const host = createHost();
			const browser = installBrowserFacade(host);
			const captured = browser.document.createElement('button');
			const hit = browser.document.createElement('button');
			const parent = browser.document.createElement('div');
			parent.append(captured);
			host.element.append(parent, hit);
			captured.setPointerCapture(1);
			const hitListener = vi.fn();
			host.addEventListener(hit, type, hitListener);
			const capturedListener = vi.fn((event: AnyHostEvent) => {
				expect(event.target).toBe(captured);
				expect(event.currentTarget).toBe(captured);
			});
			host.addEventListener(captured, type, capturedListener);
			const parentListener = vi.fn();
			host.addEventListener(parent, type, parentListener);
			const global = vi.fn((event: HostDOMEvent) => expect(event.target).toBe(captured));
			browser.document.addEventListener(type.toLowerCase(), global);
			emit(hit, { type, pointerId: 1, bubbles: true });
			expect(capturedListener).toHaveBeenCalledOnce();
			expect(parentListener).toHaveBeenCalledOnce();
			expect(global).toHaveBeenCalledOnce();
			expect(hitListener).not.toHaveBeenCalled();
		},
	);

	test.each(['semantic', 'native'] as const)(
		'runs checkbox defaults once for a %s click',
		(source) => {
			const host = createHost();
			const browser = installBrowserFacade(host);
			const child = browser.element(host.createElement('input', { type: 'checkbox' }));
			host.element.append(child);
			const local: string[] = [];
			const global: string[] = [];
			for (const type of ['click', 'input', 'change']) {
				child.addEventListener(type, (event) => local.push(event.type));
				browser.document.addEventListener(type, (event) => global.push(event.type));
			}
			if (source === 'semantic') emit(child, { type: 'click', bubbles: true });
			else child.dispatchEvent(new HostDOMEvent('click', { bubbles: true }));
			expect(child.checked).toBe(true);
			expect(local).toEqual(['click', 'input', 'change']);
			expect(global).toEqual(['click', 'input', 'change']);
		},
	);

	test('links semantic and native cancellation and suppresses checkbox defaults', () => {
		const host = createHost();
		const browser = installBrowserFacade(host);
		const child = browser.element(host.createElement('input', { type: 'checkbox' }));
		host.element.append(child);
		const global = vi.fn();
		browser.document.addEventListener('click', global);
		const input = vi.fn();
		child.addEventListener('input', input);
		child.addEventListener('click', (event: HostDOMEvent) => {
			event.preventDefault();
			event.stopPropagation();
		});
		host.addEventListener(child, 'click', (event) => {
			expect(event.defaultPrevented).toBe(true);
			expect(event.cancelBubble).toBe(true);
		});
		expect(emit(child, { type: 'click', bubbles: true })).toEqual({
			handled: true,
			stopped: true,
		});
		expect(child.checked).toBe(false);
		expect(global).not.toHaveBeenCalled();
		expect(input).not.toHaveBeenCalled();
	});

	test('preserves native identity supplied to semantic emit and document cancellation', () => {
		const host = createHost();
		const browser = installBrowserFacade(host);
		const child = browser.document.createElement('button');
		host.element.append(child);
		const native = new HostDOMEvent('pointerdown', { bubbles: true, cancelable: true });
		const local = vi.fn((event: HostDOMEvent) => expect(event).toBe(native));
		child.addEventListener('pointerdown', local);
		const global = vi.fn((event: HostDOMEvent) => {
			expect(event).toBe(native);
			event.stopPropagation();
		});
		browser.document.addEventListener('pointerdown', global);
		const window = vi.fn();
		browser.window.addEventListener('pointerdown', window);
		expect(emit(child, { type: 'pointerDown', nativeEvent: native, bubbles: true })).toEqual({
			handled: true,
			stopped: true,
		});
		expect(local).toHaveBeenCalledOnce();
		expect(global).toHaveBeenCalledOnce();
		expect(window).not.toHaveBeenCalled();
		expect(native.currentTarget).toBeNull();
	});

	test.each([
		['semantic', false, true],
		['semantic', true, false],
		['raw', undefined, false],
		['raw', undefined, true],
		['native', undefined, false],
		['native', undefined, true],
		['native', undefined, undefined],
	] as const)(
		'uses one bubbling policy for %s dispatch (semantic %s, native %s)',
		(source, semanticBubbles, nativeBubbles) => {
			const host = createHost();
			const browser = installBrowserFacade(host);
			const child = browser.document.createElement('button');
			const parent = browser.document.createElement('div');
			parent.append(child);
			host.element.append(parent);
			const native = new HostDOMEvent('click', { bubbles: nativeBubbles });
			const bubbles = semanticBubbles ?? native.bubbles;
			const calls: string[] = [];
			const local = vi.fn((event: HostDOMEvent) => {
				expect(event).toBe(native);
				expect(event.bubbles).toBe(bubbles);
				calls.push('child');
			});
			child.addEventListener('click', local);
			const ancestor = vi.fn((event: HostDOMEvent) => {
				expect(event).toBe(native);
				calls.push('parent');
			});
			parent.addEventListener('click', ancestor);
			const document = vi.fn((event: HostDOMEvent) => {
				expect(event).toBe(native);
				calls.push('document');
			});
			browser.document.addEventListener('click', document);
			const window = vi.fn((event: HostDOMEvent) => {
				expect(event).toBe(native);
				calls.push('window');
			});
			browser.window.addEventListener('click', window);
			if (source === 'semantic')
				emit(child, { type: 'click', bubbles: semanticBubbles, nativeEvent: native });
			else if (source === 'raw')
				EventApi.at(child.node!).emit({ type: 'click', target: child, nativeEvent: native });
			else expect(child.dispatchEvent(native)).toBe(true);
			expect(local).toHaveBeenCalledOnce();
			expect(ancestor).toHaveBeenCalledTimes(bubbles ? 1 : 0);
			expect(document).toHaveBeenCalledTimes(bubbles ? 1 : 0);
			expect(window).toHaveBeenCalledTimes(bubbles ? 1 : 0);
			expect(calls).toEqual(bubbles ? ['child', 'parent', 'document', 'window'] : ['child']);
			expect(native.bubbles).toBe(bubbles);
			expect(native.currentTarget).toBeNull();
		},
	);

	test('honors a stopped dispatch result even without semantic cancellation', () => {
		const host = createHost();
		const browser = installBrowserFacade(host);
		EventApi.decorate(host.root, () => ({
			dispatchEvent() {
				return { handled: true, stopped: true };
			},
		}));
		const child = browser.document.createElement('button');
		host.element.append(child);
		const global = vi.fn();
		browser.document.addEventListener('click', global);
		const native = new HostDOMEvent('click', { bubbles: true });
		expect(child.dispatchEvent(native)).toBe(true);
		expect(native.cancelBubble).toBe(true);
		expect(global).not.toHaveBeenCalled();
	});

	test('bridges pure input payloads without inventing additional input or change events', () => {
		const host = createHost();
		const browser = installBrowserFacade(host);
		const child = browser.document.createElement('input');
		host.element.append(child);
		const local = vi.fn((event: HostDOMEvent) => expect(event.value).toBe('edited'));
		const global = vi.fn();
		const change = vi.fn();
		child.addEventListener('input', local);
		browser.document.addEventListener('input', global);
		browser.document.addEventListener('change', change);
		const event: Omit<InputEvent, 'target'> = { type: 'input', value: 'edited', bubbles: true };
		emit(child, event);
		expect(local).toHaveBeenCalledOnce();
		expect(global).toHaveBeenCalledOnce();
		expect(change).not.toHaveBeenCalled();
	});

	test('does not forward non-bubbling semantic events to document listeners', () => {
		const host = createHost();
		const browser = installBrowserFacade(host);
		const child = browser.document.createElement('button');
		host.element.append(child);
		const local = vi.fn();
		const global = vi.fn();
		child.addEventListener('pointermove', local);
		browser.document.addEventListener('pointermove', global);
		emit(child, { type: 'pointerMove', bubbles: false });
		expect(local).toHaveBeenCalledOnce();
		expect(global).not.toHaveBeenCalled();
	});
});
