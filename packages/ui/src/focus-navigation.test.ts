import type { KeyDown, KeyEvent, KeyRepeat, KeyUp } from '@bomb.sh/tty';
import type { Node } from './core.ts';
import { describe, expect, test } from 'vitest';
import { DispatchApi, installDispatch } from './dispatch.ts';
import { getFocus, setFocusable, installFocus } from './focus.ts';
import { installFocusNavigation } from './focus-navigation.ts';
import { createHost, type Host } from './host.ts';
import { KeyboardApi, installKeyboard } from './keyboard.ts';

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
	installDispatch(host);
	installFocus(host);
	installKeyboard(host);
	installFocusNavigation(host);

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
