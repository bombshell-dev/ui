import type { HostEvent } from '@clack/ui/events';
import { describe, expect, expectTypeOf, test } from 'vitest';
import type { Node } from './core.ts';
import type { HostElement } from './elements.ts';
import { createHost, type Host, HostApi } from './host.ts';
import type { AnyHostEvent } from './events.ts';

interface ProbeEvent extends HostEvent<'@test/probe'> {
	readonly value: number;
}

declare module '@clack/ui/events' {
	interface HostEvents {
		'@test/focus': HostEvent<'@test/focus'>;
		'@test/input': HostEvent<'@test/input'>;
		'@test/probe': ProbeEvent;
	}
}

describe('event listeners', () => {
	test('delivers an event to a listener registered before attachment', () => {
		const host = createHost();
		const target = host.createElement('probe');
		const events: EventSnapshot[] = [];
		host.addEventListener(target, '@test/input', (event: HostEvent) => {
			events.push(snapshot(event, target));
		});

		expect(target.node).toBeNull();
		host.insertBefore(host.element, target);

		emit(target.node!, { type: '@test/input', value: 'hello' });

		expect(events).toEqual([
			{
				type: '@test/input',
				value: 'hello',
				target: true,
			},
		]);
	});

	test('scopes listeners by element and event type', () => {
		const host = createHost();
		const first = attach(host, 'first');
		const second = attach(host, 'second');
		const calls: string[] = [];
		host.addEventListener(first, '@test/input', () => calls.push('first input'));
		host.addEventListener(first, '@test/focus', () => calls.push('first focus'));
		host.addEventListener(second, '@test/input', () => calls.push('second input'));

		emit(first.node!, { type: '@test/input' });

		expect(calls).toEqual(['first input']);
	});

	test('invokes distinct listeners in registration order without duplicating one listener', () => {
		const host = createHost();
		const target = attach(host, 'probe');
		const calls: string[] = [];
		const first = (): void => {
			calls.push('first');
		};
		const second = (): void => {
			calls.push('second');
		};
		host.addEventListener(target, '@test/input', first);
		host.addEventListener(target, '@test/input', first);
		host.addEventListener(target, '@test/input', second);

		emit(target.node!, { type: '@test/input' });

		expect(calls).toEqual(['first', 'second']);
	});

	test('defers listeners added during an emission until the next event', () => {
		const host = createHost();
		const target = attach(host, 'probe');
		const calls: string[] = [];
		const later = (): void => {
			calls.push('later');
		};
		host.addEventListener(target, '@test/input', () => {
			calls.push('first');
			host.addEventListener(target, '@test/input', later);
		});

		emit(target.node!, { type: '@test/input' });

		expect(calls).toEqual(['first']);

		emit(target.node!, { type: '@test/input' });

		expect(calls).toEqual(['first', 'first', 'later']);
	});

	test('infers listener events from the host event map', () => {
		const host = createHost();
		const target = attach(host, 'probe');
		let value: number | undefined;
		host.addEventListener(target, '@test/probe', (event) => {
			expectTypeOf(event).toEqualTypeOf<ProbeEvent>();
			value = event.value;
		});

		emit(target.node!, { type: '@test/probe', value: 42 });

		expect(value).toBe(42);
	});

	test('removes a listener by element, event type, and identity', () => {
		const host = createHost();
		const target = attach(host, 'probe');
		const calls: string[] = [];
		const listener = (event: HostEvent): void => {
			calls.push(event.type);
		};
		host.addEventListener(target, '@test/input', listener);
		host.addEventListener(target, '@test/focus', listener);

		host.removeEventListener(target, '@test/input', listener);
		host.removeEventListener(target, '@test/input', listener);
		emit(target.node!, { type: '@test/input' });
		emit(target.node!, { type: '@test/focus' });

		expect(calls).toEqual(['@test/focus']);
	});

	test('preserves listeners when an element is detached and reattached', () => {
		const host = createHost();
		const first = attach(host, 'first');
		const second = attach(host, 'second');
		const target = host.createElement('probe');
		let calls = 0;
		host.addEventListener(target, '@test/input', () => calls++);
		host.insertBefore(first, target);
		const firstNode = target.node;

		emit(target.node!, { type: '@test/input' });
		host.insertBefore(second, target);
		emit(target.node!, { type: '@test/input' });

		expect(target.node).not.toBe(firstNode);
		expect(calls).toBe(2);
	});

	test('propagates listener errors to the emitter', () => {
		const host = createHost();
		const target = attach(host, 'probe');
		const reason = new Error('listener failed');
		host.addEventListener(target, '@test/input', () => {
			throw reason;
		});

		expect(() => emit(target.node!, { type: '@test/input' })).toThrowError(reason);
	});
});

interface EventSnapshot {
	type: string;
	value: unknown;
	target: boolean;
}

function attach(host: Host, name: string): HostElement {
	const element = host.createElement(name);
	host.insertBefore(host.element, element);
	return element;
}

function snapshot(event: HostEvent, target: HostElement): EventSnapshot {
	return {
		type: event.type,
		value: 'value' in event ? event.value : undefined,
		target: event.target === target,
	};
}

function emit(node: Node, event: AnyHostEvent): void {
	HostApi.at(node).emit(event);
}
