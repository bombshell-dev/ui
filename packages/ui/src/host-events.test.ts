import { describe, expect, test, vi } from 'vitest';
import { HostDOMEvent } from './browser-types.ts';
import { installBrowserFacade } from './browser-facade.ts';
import { createHost } from './host.ts';
import { EventApi, emit } from './event-api.ts';

describe('Host event contracts', () => {
	test('delivers directly through the neutral Host entry point without a browser facade', () => {
		const host = createHost();
		const child = host.createElement('button');
		host.element.append(child);
		const listener = vi.fn((event) => {
			expect(event.nativeEvent).toBeUndefined();
			expect(event.currentTarget).toBe(child);
		});
		child.addEventListener('click', listener);
		const event = { type: 'click' as const, target: child };
		expect(EventApi.at(child.node!).dispatchEvent(event)).toEqual({
			handled: true,
			stopped: false,
		});
		expect(listener).toHaveBeenCalledWith(event);
		expect(child).not.toHaveProperty('ownerDocument');
	});

	test('allows emission policy to handle an event without delegating delivery', () => {
		const host = createHost();
		const child = host.createElement('button');
		host.element.append(child);
		const listener = vi.fn();
		child.addEventListener('click', listener);
		EventApi.decorate(child.node!, () => ({
			emit() {
				return { handled: true, stopped: false };
			},
		}));
		expect(emit(child, { type: 'click' })).toEqual({ handled: true, stopped: false });
		expect(listener).not.toHaveBeenCalled();
	});

	test('uses exact semantic names without native pointer normalization', () => {
		const host = createHost();
		const child = host.createElement('button');
		host.element.append(child);
		const semantic = vi.fn();
		const native = vi.fn();
		child.addEventListener('pointerDown', semantic);
		// Deliberately use a non-semantic name to verify that the core does not normalize it.
		child.addEventListener('pointerdown' as 'pointerDown', native);
		emit(child, { type: 'pointerDown' });
		expect(semantic).toHaveBeenCalledOnce();
		expect(native).not.toHaveBeenCalled();
		child.removeEventListener('pointerDown', semantic);
		emit(child, { type: 'pointerDown' });
		expect(semantic).toHaveBeenCalledOnce();
	});

	test('honors downstream handling and stopping before delivering listeners', () => {
		const host = createHost();
		const child = host.createElement('button');
		host.element.append(child);
		const listener = vi.fn();
		child.addEventListener('click', listener);
		EventApi.decorate(child.node!, () => ({
			emit() {
				return { handled: true, stopped: true };
			},
		}));
		expect(emit(child, { type: 'click' })).toEqual({ handled: true, stopped: true });
		expect(listener).not.toHaveBeenCalled();
	});

	test('delivers native pointer names and event identity through document and window', () => {
		const host = createHost();
		const browser = installBrowserFacade(host);
		const child = browser.document.createElement('button');
		host.element.append(child);
		const { document } = browser;
		const event = new HostDOMEvent('pointerdown', { bubbles: true, cancelable: true });
		const calls: string[] = [];
		child.addEventListener('pointerdown', (received) => {
			expect(received).toBe(event);
			expect(received.type).toBe('pointerdown');
			expect(received.currentTarget).toBe(child);
			calls.push('child');
		});
		host.addEventListener(child, 'pointerDown', (received) => {
			expect(received.nativeEvent).toBe(event);
			calls.push('react');
		});
		document.addEventListener('pointerdown', (received) => {
			expect(received.currentTarget).toBe(document);
			calls.push('document');
		});
		document.defaultView.addEventListener('pointerdown', (received) => {
			expect(received.currentTarget).toBe(document.defaultView);
			calls.push('window');
		});
		expect(child.dispatchEvent(event)).toBe(true);
		expect(calls).toEqual(['child', 'react', 'document', 'window']);
		expect(event.target).toBe(child);
		expect(event.currentTarget).toBeNull();
	});

	test('preserves native listener identity and removal', () => {
		const host = createHost();
		const browser = installBrowserFacade(host);
		const child = browser.document.createElement('button');
		host.element.append(child);
		const listener = vi.fn();
		child.addEventListener('pointerdown', listener);
		child.addEventListener('pointerdown', listener);
		child.dispatchEvent(new HostDOMEvent('pointerdown'));
		expect(listener).toHaveBeenCalledOnce();
		child.removeEventListener('pointerdown', listener);
		child.dispatchEvent(new HostDOMEvent('pointerdown'));
		expect(listener).toHaveBeenCalledOnce();
	});

	test('native cancellation stops propagation and preserves prevention', () => {
		const host = createHost();
		const browser = installBrowserFacade(host);
		const child = browser.document.createElement('button');
		host.element.append(child);
		const parent = vi.fn();
		const global = vi.fn();
		host.element.addEventListener('click', parent);
		browser.document.addEventListener('click', global);
		child.addEventListener('click', (event) => {
			event.stopPropagation?.();
			event.preventDefault?.();
		});
		expect(
			child.dispatchEvent(new HostDOMEvent('click', { bubbles: true, cancelable: true })),
		).toBe(false);
		expect(parent).not.toHaveBeenCalled();
		expect(global).not.toHaveBeenCalled();
	});

	test('does not forward non-bubbling events', () => {
		const host = createHost();
		const browser = installBrowserFacade(host);
		const child = browser.document.createElement('button');
		host.element.append(child);
		const listener = vi.fn();
		browser.document.addEventListener('pointermove', listener);
		child.dispatchEvent(new HostDOMEvent('pointermove'));
		expect(listener).not.toHaveBeenCalled();
	});

	test('honors cancellation performed through the underlying native event', () => {
		const host = createHost();
		const browser = installBrowserFacade(host);
		const child = browser.document.createElement('button');
		host.element.append(child);
		const parent = vi.fn();
		const global = vi.fn();
		browser.element(host.element).addEventListener('pointerdown', parent);
		browser.document.addEventListener('pointerdown', global);
		host.addEventListener(child, 'pointerDown', (event) => {
			event.nativeEvent!.preventDefault();
			event.nativeEvent!.stopPropagation();
		});
		const event = new HostDOMEvent('pointerdown', { bubbles: true, cancelable: true });
		expect(child.dispatchEvent(event)).toBe(false);
		expect(event.defaultPrevented).toBe(true);
		expect(event.cancelBubble).toBe(true);
		expect(parent).not.toHaveBeenCalled();
		expect(global).not.toHaveBeenCalled();
	});

	test('document cancellation prevents window delivery', () => {
		const host = createHost();
		const browser = installBrowserFacade(host);
		const { document } = browser;
		const listener = vi.fn();
		document.addEventListener('pointerup', (event) => event.stopPropagation());
		document.defaultView.addEventListener('pointerup', listener);
		browser.dispatchDocumentEvent(new HostDOMEvent('pointerup', { bubbles: true }));
		expect(listener).not.toHaveBeenCalled();
	});

	test('retargets pointer events to the active capture owner', () => {
		const host = createHost();
		const browser = installBrowserFacade(host);
		const first = browser.document.createElement('button');
		const second = browser.document.createElement('button');
		host.element.append(first, second);
		const listener = vi.fn();
		first.addEventListener('pointermove', listener);
		first.setPointerCapture(7);
		const event = new HostDOMEvent('pointermove', { pointerId: 7, bubbles: true });
		second.dispatchEvent(event);
		expect(listener).toHaveBeenCalledWith(event);
		expect(event.target).toBe(first);
		first.releasePointerCapture(7);
		expect(first.hasPointerCapture(7)).toBe(false);
	});
});
