import type { KeyDown, KeyEvent } from '@bomb.sh/tty';
import type { Node } from './core.ts';
import { describe, expect, test } from 'vitest';
import { DispatchApi, useDispatch } from './dispatch.ts';
import { setFocus, setFocusable, useFocus } from './focus.ts';
import { createHost, type Host } from './host.ts';
import { useKeyboard, type KeyDownEvent, type KeyRepeatEvent, type KeyUpEvent } from './keyboard.ts';
import { addListener, type Dispatched } from './events.ts';
import { getElement } from './elements.ts';

const { dispatch } = DispatchApi.methods;

describe('keyboard dispatch', () => {
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
			expect(dispatch(host.root, event).ok).toBe(true);
		}

		expect(firstEvents).toEqual([]);
		expect(secondEvents.map(({ node }) => node)).toEqual([second, second, second]);
		for (const [index, event] of events.entries()) {
			expect(secondEvents[index]?.event).toMatchObject(event);
		}
	});

	test('returns ordinary dispatch success without a handled payload', () => {
		const host = setupKeyboardHost();
		const target = createFocusable(host);
		recordKeyboard(target, []);

		expect(dispatch(host.root, keydown('a', 'a'))).toEqual({ ok: true });
	});

	test('delegates non-key and malformed key-like events unchanged', () => {
		const host = setupKeyboardHost();
		const delegated: unknown[] = [];
		DispatchApi.around(host.root, {
			dispatch([node, event], next) {
				delegated.push(event);
				return next(node, event);
			},
		});

		dispatch(host.root, keydown('a', 'a'));
		const others: unknown[] = [
			{ type: 'resize', width: 80, height: 24 },
			{ type: 'keydown', code: 'a' },
			{ type: 'keydown', key: 'a' },
			{ type: 'keypress', key: 'a', code: 'a' },
		];
		for (const event of others) {
			dispatch(host.root, event);
		}

		expect(delegated).toEqual(others);
	});
});

interface RecordedKeyEvent {
	node: Node | null;
	event: KeyEvent;
}

function setupKeyboardHost(): Host {
	const host = createHost();
	useDispatch(host);
	useFocus(host);
	useKeyboard(host);
	return host;
}

function createFocusable(host: Host): Node {
	const element = host.createElement('box');
	host.insertBefore(host.element, element);
	setFocusable(element.node!);
	return element.node!;
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
	const element = getElement(node);
	const record = (event: Dispatched<KeyDownEvent | KeyUpEvent | KeyRepeatEvent>): void => {
		events.push({ node: event.currentTarget.node, event });
	};

	addListener(element, 'keydown', record);
	addListener(element, 'keyup', record);
	addListener(element, 'keyrepeat', record);
}
