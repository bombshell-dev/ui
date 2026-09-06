import type { HostEvent } from '@clack/ui/events';
import { describe, expect, test } from 'vitest';
import { addListener, dispatch, removeListener } from './events.ts';
import type { HostElement } from './elements.ts';
import { createHost, type Host } from './host.ts';

declare module '@clack/ui/events' {
	interface HostEvents {
		'@test/dispatch': HostEvent<'@test/dispatch'>;
	}
}

describe('dispatch', () => {
	test('delivers to the target and then each ancestor', () => {
		const host = createHost();
		const [outer, inner] = createTree(host, ['outer', 'inner']);
		const calls: string[] = [];
		addListener(host.element, '@test/dispatch', () => calls.push('root'));
		addListener(outer, '@test/dispatch', () => calls.push('outer'));
		addListener(inner, '@test/dispatch', () => calls.push('inner'));

		dispatch(inner, { type: '@test/dispatch', target: inner }, { bubbles: true });

		expect(calls).toEqual(['inner', 'outer', 'root']);
	});

	test('stops at the target unless the event bubbles', () => {
		const host = createHost();
		const [outer, inner] = createTree(host, ['outer', 'inner']);
		const calls: string[] = [];
		addListener(outer, '@test/dispatch', () => calls.push('outer'));
		addListener(inner, '@test/dispatch', () => calls.push('inner'));

		dispatch(inner, { type: '@test/dispatch', target: inner });

		expect(calls).toEqual(['inner']);
	});

	test('keeps target fixed while currentTarget follows the walk', () => {
		const host = createHost();
		const [outer, inner] = createTree(host, ['outer', 'inner']);
		const seen: Array<[boolean, string]> = [];
		const record = (event: { target: HostElement; currentTarget: HostElement }): void => {
			seen.push([event.target === inner, event.currentTarget.name]);
		};
		addListener(outer, '@test/dispatch', record);
		addListener(inner, '@test/dispatch', record);

		dispatch(inner, { type: '@test/dispatch', target: inner }, { bubbles: true });

		expect(seen).toEqual([
			[true, 'inner'],
			[true, 'outer'],
		]);
	});

	test('stops at the current element when a listener stops propagation', () => {
		const host = createHost();
		const [outer, inner] = createTree(host, ['outer', 'inner']);
		const calls: string[] = [];
		addListener(outer, '@test/dispatch', () => calls.push('outer'));
		addListener(inner, '@test/dispatch', (event) => {
			calls.push('inner first');
			event.stopPropagation();
		});
		addListener(inner, '@test/dispatch', () => calls.push('inner second'));

		dispatch(inner, { type: '@test/dispatch', target: inner }, { bubbles: true });

		expect(calls).toEqual(['inner first', 'inner second']);
	});

	test('skips ancestors that have no listener for the type', () => {
		const host = createHost();
		const [, inner] = createTree(host, ['outer', 'inner']);
		const calls: string[] = [];
		addListener(host.element, '@test/dispatch', () => calls.push('root'));

		dispatch(inner, { type: '@test/dispatch', target: inner }, { bubbles: true });

		expect(calls).toEqual(['root']);
	});

	test('does not deliver to a removed listener', () => {
		const host = createHost();
		const [target] = createTree(host, ['probe']);
		const calls: string[] = [];
		const listener = (): void => {
			calls.push('listener');
		};
		addListener(target, '@test/dispatch', listener);
		removeListener(target, '@test/dispatch', listener);

		dispatch(target, { type: '@test/dispatch', target });

		expect(calls).toEqual([]);
	});

	test('walks the element tree even before the target is attached', () => {
		const host = createHost();
		const [outer] = createTree(host, ['outer']);
		const inner = host.createElement('inner');
		const calls: string[] = [];
		addListener(outer, '@test/dispatch', () => calls.push('outer'));
		addListener(inner, '@test/dispatch', () => calls.push('inner'));
		host.insertBefore(outer, inner);

		dispatch(inner, { type: '@test/dispatch', target: inner }, { bubbles: true });

		expect(calls).toEqual(['inner', 'outer']);
	});
});

function createTree<const N extends readonly string[]>(
	host: Host,
	names: N,
): { [K in keyof N]: HostElement } {
	const created: HostElement[] = [];
	let parent = host.element;
	for (const name of names) {
		const element = host.createElement(name);
		host.insertBefore(parent, element);
		created.push(element);
		parent = element;
	}
	return created as { [K in keyof N]: HostElement };
}
