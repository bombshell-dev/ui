import type { Dispatched, HostEvent } from '@clack/ui/events';
import { describe, expect, expectTypeOf, test } from 'vitest';
import { dispatch } from './events.ts';
import type { HostElement } from './elements.ts';
import { createHost, type Host } from './host.ts';

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
		host.addEventListener(target, '@test/probe', (event) => {
			events.push(snapshot(event, target));
		});

		expect(target.node).toBeNull();
		host.insertBefore(host.element, target);

		dispatch(target, { type: '@test/probe', target, value: 42 });

		expect(events).toEqual([
			{
				type: '@test/probe',
				value: 42,
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

		dispatch(first, { type: '@test/input', target: first });

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

		dispatch(target, { type: '@test/input', target: target });

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

		dispatch(target, { type: '@test/input', target: target });

		expect(calls).toEqual(['first']);

		dispatch(target, { type: '@test/input', target: target });

		expect(calls).toEqual(['first', 'first', 'later']);
	});

	test('infers listener events from the host event map', () => {
		const host = createHost();
		const target = attach(host, 'probe');
		let value: number | undefined;
		host.addEventListener(target, '@test/probe', (event) => {
			expectTypeOf(event).toEqualTypeOf<Dispatched<ProbeEvent>>();
			value = event.value;
		});

		dispatch(target, { type: '@test/probe', target, value: 42 });

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
		dispatch(target, { type: '@test/input', target: target });
		dispatch(target, { type: '@test/focus', target: target });

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

		dispatch(target, { type: '@test/input', target: target });
		host.insertBefore(second, target);
		dispatch(target, { type: '@test/input', target: target });

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

		expect(() => dispatch(target, { type: '@test/input', target: target })).toThrowError(reason);
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
