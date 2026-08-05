import type { KeyDown, KeyEvent, KeyRepeat, KeyUp } from '@bomb.sh/tty';
import type { Node } from './core.ts';
import { describe, expect, test } from 'vitest';
import { DispatchApi } from './dispatch.ts';
import { FocusApi } from './focus.ts';
import { useFocusNavigation } from './focus-navigation.ts';
import { createHost, type Host } from './host.ts';
import { KeyboardApi } from './keyboard.ts';

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

		DispatchApi.at(host.root).dispatch(event);

		expect(getFocus(host.root)).toBe(expected === 'second' ? second : third);
		expect(delegated).toEqual([]);
	});

	test.each([keydown('a'), keyrepeat('a'), keyup('Tab'), keyup('Backtab')])(
		'delegates $type $code without moving focus',
		(event) => {
			const { host, first } = setup();
			const delegated: RecordedKeyEvent[] = [];
			recordKeyboard(first, delegated);

			DispatchApi.at(host.root).dispatch(event);

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
	DispatchApi.init(host.root);
	FocusApi.init(host.root);
	KeyboardApi.init(host.root);
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

function getFocus(node: Node): Node {
	return FocusApi.at(node).getFocus();
}

function setFocusable(node: Node): void {
	FocusApi.at(node).setFocusable();
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
