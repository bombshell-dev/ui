import type { KeyDown, KeyEvent } from '@bomb.sh/tty';
import type { Node } from './core.ts';
import { describe, expect, test } from 'vitest';
import { DispatchApi } from './dispatch.ts';
import { FocusApi } from './focus.ts';
import { createHost, type Host } from './host.ts';
import { KeyboardApi } from './keyboard.ts';
import { Input } from './elements/input.ts';

describe('keyboard dispatch', () => {
	test.each(['keydown', 'keyrepeat'] as const)(
		'node-local middleware can intercept and delegate input %s defaults',
		(type) => {
			const host = setupKeyboardHost();
			Input.register(host);
			const input = host.createElement('input');
			host.insertBefore(host.element, input);
			const observed: string[] = [];
			KeyboardApi.decorate(input.node!, () => ({
				keydown(event) {
					observed.push(event.text!);
					if (event.text !== 'x') super.keydown(event);
				},
				keyrepeat(event) {
					observed.push(event.text!);
					if (event.text !== 'x') super.keyrepeat(event);
				},
			}));

			DispatchApi.at(host.root).dispatch({ ...keydown('x', 'x'), type });
			expect(input.properties.value).toBe('');
			DispatchApi.at(host.root).dispatch({ ...keydown('y', 'y'), type });
			expect(input.properties.value).toBe('y');
			expect(observed).toEqual(['x', 'y']);
		},
	);

	test('routes keydown, keyup, and keyrepeat to the currently focused node', () => {
		const host = setupKeyboardHost();
		const first = createFocusable(host);
		const second = createFocusable(host);
		const firstEvents: RecordedKeyEvent[] = [];
		const secondEvents: RecordedKeyEvent[] = [];
		recordKeyboard(first, firstEvents);
		recordKeyboard(second, secondEvents);
		setFocus(second);

		const events: KeyEvent[] = [
			{ type: 'keydown', key: 'a', code: 'a', text: 'a' },
			{ type: 'keyup', key: 'a', code: 'a' },
			{ type: 'keyrepeat', key: 'a', code: 'a', text: 'a' },
		];
		for (const event of events) {
			expect(DispatchApi.at(host.root).dispatch(event).ok).toBe(true);
		}

		expect(firstEvents).toEqual([]);
		expect(secondEvents.map(({ node }) => node)).toEqual([second, second, second]);
		for (const [index, event] of events.entries()) {
			expect(secondEvents[index]?.event).toBe(event);
		}
	});

	test('returns ordinary dispatch success without a handled payload', () => {
		const host = setupKeyboardHost();
		const target = createFocusable(host);
		recordKeyboard(target, []);

		expect(DispatchApi.at(host.root).dispatch(keydown('a', 'a'))).toEqual({ ok: true });
	});

	test('delegates non-key and malformed key-like events unchanged', () => {
		const host = setupKeyboardHost();
		const delegated: unknown[] = [];
		DispatchApi.decorate(host.root, () => ({
			dispatch(event) {
				delegated.push(event);
				return super.dispatch(event);
			},
		}));

		DispatchApi.at(host.root).dispatch(keydown('a', 'a'));
		const others: unknown[] = [
			{ type: 'resize', width: 80, height: 24 },
			{ type: 'keydown', code: 'a' },
			{ type: 'keydown', key: 'a' },
			{ type: 'keypress', key: 'a', code: 'a' },
		];
		for (const event of others) {
			DispatchApi.at(host.root).dispatch(event);
		}

		expect(delegated).toEqual(others);
	});
});

interface RecordedKeyEvent {
	node: Node;
	event: KeyEvent;
}

function setupKeyboardHost(): Host {
	const host = createHost();
	DispatchApi.init(host.root);
	FocusApi.init(host.root);
	KeyboardApi.init(host.root);
	return host;
}

function createFocusable(host: Host): Node {
	const element = host.createElement('box');
	host.insertBefore(host.element, element);
	setFocusable(element.node!);
	return element.node!;
}

function setFocus(node: Node): void {
	FocusApi.at(node).setFocus(node);
}

function setFocusable(node: Node): void {
	FocusApi.at(node).setFocusable();
}

function keydown(code: KeyDown['code'], text?: string): KeyDown {
	return {
		type: 'keydown',
		key: text ?? code,
		code,
		...(text === undefined ? {} : { text }),
	};
}

function recordKeyboard(node: Node, events: RecordedKeyEvent[]): void {
	KeyboardApi.decorate(node, () => ({
		keydown(event) {
			events.push({ node: this.node, event });
		},
		keyup(event) {
			events.push({ node: this.node, event });
		},
		keyrepeat(event) {
			events.push({ node: this.node, event });
		},
	}));
}
