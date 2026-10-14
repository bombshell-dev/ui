import { describe, expect, test, vi } from 'vitest';
import { createHost } from './host.ts';
import { EventApi, emit, InvalidEventTargetError, CrossHostEventError } from './event-api.ts';
import type { HostEvent } from './events.ts';

describe('EventApi', () => {
	test('emits attached and detached structural events through the creator Host', () => {
		const host = createHost();
		const parent = host.createElement('parent');
		const child = host.createElement('child');
		parent.append(child);
		const calls: string[] = [];
		child.addEventListener('click', () => calls.push('child'));
		parent.addEventListener('click', () => calls.push('parent'));
		expect(emit(child, { type: 'click' })).toEqual({ handled: true, stopped: false });
		host.element.append(parent);
		expect(child.emit({ type: 'click' })).toEqual({ handled: true, stopped: false });
		parent.remove();
		expect(child.node).toBeNull();
		child.emit({ type: 'click' });
		expect(calls).toEqual(['child', 'parent', 'child', 'parent', 'child', 'parent']);
	});

	test('intercepts root and child policy separately from delivery', () => {
		const host = createHost();
		const child = host.createElement('child');
		host.element.append(child);
		const calls: string[] = [];
		EventApi.decorate(host.root, () => ({
			emit(event) {
				calls.push('root');
				return super.emit(event);
			},
			dispatchEvent(event) {
				calls.push('delivery');
				return super.dispatchEvent(event);
			},
		}));
		EventApi.decorate(child.node!, () => ({
			emit(event) {
				calls.push('child');
				const result = super.emit(event);
				return { ...result, handled: true };
			},
		}));
		expect(child.emit({ type: 'click' })).toEqual({ handled: true, stopped: false });
		expect(calls).toEqual(['root', 'child', 'delivery']);
	});

	test('allows policy middleware to stop delivery', () => {
		const host = createHost();
		const listener = vi.fn();
		host.element.addEventListener('click', listener);
		EventApi.decorate(host.root, () => ({
			emit() {
				return { handled: true, stopped: true };
			},
		}));
		expect(host.element.emit({ type: 'click' })).toEqual({ handled: true, stopped: true });
		expect(listener).not.toHaveBeenCalled();
	});

	test('uses decorated event ancestry rather than changing physical parents', () => {
		const host = createHost();
		const child = host.createElement('child');
		const logical = host.createElement('logical');
		host.element.append(child, logical);
		const listener = vi.fn();
		logical.addEventListener('click', listener);
		EventApi.decorate(child.node!, () => ({
			getEventParent(element) {
				return element === child ? logical : super.getEventParent(element);
			},
		}));
		child.emit({ type: 'click' });
		expect(listener).toHaveBeenCalledOnce();
		expect(child.parent).toBe(host.element);
	});

	test('distinguishes an invalid emitting location from cross-Host access', () => {
		const host = createHost();
		const foreign = createHost();
		const child = host.createElement('child');
		host.element.append(child);
		const api = EventApi.at(host.root);
		expect(() => api.emit({ type: 'click', target: child })).toThrow(InvalidEventTargetError);
		expect(() => api.emit({ type: 'click', target: foreign.element })).toThrow(
			InvalidEventTargetError,
		);
		expect(() => api.dispatchEvent({ type: 'click', target: foreign.element })).toThrow(
			CrossHostEventError,
		);
		expect(() => host.addEventListener(foreign.element, 'click', vi.fn())).toThrow(
			CrossHostEventError,
		);
		expect(() => host.removeEventListener(foreign.element, 'click', vi.fn())).toThrow(
			CrossHostEventError,
		);
		expect(() => api.hasEventListener(foreign.element, 'click')).toThrow(CrossHostEventError);
	});

	test('preserves listener snapshots, identity, ordering and property update cleanup', () => {
		const host = createHost();
		const child = host.createElement('child');
		const api = EventApi.at(host.root);
		const calls: string[] = [];
		const second = (): void => {
			calls.push('second');
		};
		const first = (): void => {
			calls.push('first');
			child.removeEventListener('click', second);
		};
		child.addEventListener('click', first);
		child.addEventListener('click', first);
		child.setProperty('onClick', second);
		child.emit({ type: 'click' });
		expect(calls).toEqual(['first', 'second']);
		const replacement = vi.fn();
		child.setProperty('onClick', replacement);
		child.emit({ type: 'click' });
		expect(replacement).toHaveBeenCalledOnce();
		child.setProperty('onClick', undefined);
		child.removeEventListener('click', first);
		expect(api.hasEventListener(child, 'click')).toBe(false);
		expect(child.emit({ type: 'click' })).toEqual({ handled: false, stopped: false });
	});

	test('honors bubbles and cancellation without delegating to native events', () => {
		const host = createHost();
		const child = host.createElement('child');
		host.element.append(child);
		const parent = vi.fn();
		const native = {
			cancelBubble: false,
			defaultPrevented: false,
			stopPropagation: vi.fn(),
			preventDefault: vi.fn(),
		};
		host.element.addEventListener('click', parent);
		child.addEventListener('click', (event) => {
			event.stopPropagation?.();
			event.preventDefault?.();
			expect(event.defaultPrevented).toBe(true);
		});
		expect(child.emit({ type: 'click', nativeEvent: native })).toEqual({
			handled: true,
			stopped: true,
		});
		expect(parent).not.toHaveBeenCalled();
		expect(native.stopPropagation).not.toHaveBeenCalled();
		expect(native.preventDefault).not.toHaveBeenCalled();
		const other = host.createElement('other');
		host.element.append(other);
		other.emit({ type: 'click', bubbles: false });
		expect(parent).not.toHaveBeenCalled();
	});

	test('clears currentTarget even when a listener throws', () => {
		const host = createHost();
		const event: HostEvent<'click'> = { type: 'click', target: host.element };
		const reason = new Error('listener failed');
		host.element.addEventListener('click', () => {
			throw reason;
		});
		expect(() => EventApi.at(host.root).dispatchEvent(event)).toThrow(reason);
		expect(event.currentTarget).toBeUndefined();
	});
});
