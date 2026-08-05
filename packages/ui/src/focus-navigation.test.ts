import type { KeyDown, KeyEvent, KeyRepeat, KeyUp } from '@bomb.sh/tty';
import type { Node } from '@bomb.sh/tree';
import { describe, expect, test } from 'vitest';
import { DispatchApi, useDispatch } from './dispatch.ts';
import { getFocus, setFocusable, useFocus } from './focus.ts';
import { useFocusNavigation } from './focus-navigation.ts';
import { createHost, type Host } from './host.ts';
import { KeyboardApi, useKeyboard } from './keyboard.ts';

const { dispatch } = DispatchApi.methods;

describe('focus navigation', () => {
	test.each([
		{ event: keydown('Tab'), expected: 'second' },
		{ event: keyrepeat('Tab'), expected: 'second' },
		{ event: keydown('Backtab'), expected: 'third' },
		{ event: keyrepeat('Backtab'), expected: 'third' },
	])('$event.type $event.code moves focus and consumes the event', ({ event, expected }) => {
		const { host, first, second, third } = setup();
		const delegated: RecordedKeyEvent[] = [];
		recordKeyboard(first, delegated);

		dispatch(host.root, event);

		expect(getFocus(host.root)).toBe(expected === 'second' ? second : third);
		expect(delegated).toEqual([]);
	});

	test.each([keydown('a'), keyrepeat('a'), keyup('Tab'), keyup('Backtab')])(
		'delegates $type $code without moving focus',
		(event) => {
			const { host, first } = setup();
			const delegated: RecordedKeyEvent[] = [];
			recordKeyboard(first, delegated);

			dispatch(host.root, event);

			expect(getFocus(host.root)).toBe(first);
			expect(delegated).toEqual([{ node: first, event }]);
		},
	);
});

interface Setup {
	host: Host;
	first: Node;
	second: Node;
	third: Node;
}

interface RecordedKeyEvent {
	node: Node;
	event: KeyEvent;
}

function setup(): Setup {
	const host = createHost();
	useDispatch(host);
	useFocus(host);
	useKeyboard(host);
	useFocusNavigation(host);

	return {
		host,
		first: createFocusable(host),
		second: createFocusable(host),
		third: createFocusable(host),
	};
}

function createFocusable(host: Host): Node {
	const element = host.createElement('box');
	host.insertBefore(host.element, element);
	setFocusable(element.node!);
	return element.node!;
}

function keydown(code: KeyDown['code']): KeyDown {
	return { type: 'keydown', key: code, code };
}

function keyrepeat(code: KeyRepeat['code']): KeyRepeat {
	return { type: 'keyrepeat', key: code, code };
}

function keyup(code: KeyUp['code']): KeyUp {
	return { type: 'keyup', key: code, code };
}

function recordKeyboard(node: Node, events: RecordedKeyEvent[]): void {
	KeyboardApi.around(node, {
		keydown([target, event]) {
			events.push({ node: target, event });
		},
		keyup([target, event]) {
			events.push({ node: target, event });
		},
		keyrepeat([target, event]) {
			events.push({ node: target, event });
		},
	});
}
