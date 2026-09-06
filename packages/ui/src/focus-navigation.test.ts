import type { KeyDown, KeyEvent, KeyRepeat, KeyUp } from '@bomb.sh/tty';
import type { Node } from './core.ts';
import { describe, expect, test } from 'vitest';
import { getFocus, setFocusable, useFocus } from './focus.ts';
import { useFocusNavigation } from './focus-navigation.ts';
import { createHost, type Host } from './host.ts';
import type { KeyDownEvent, KeyRepeatEvent, KeyUpEvent } from './keyboard.ts';
import { handleInput } from './ui.ts';
import { addListener, type Dispatched } from './events.ts';
import { getElement } from './elements.ts';

describe('focus navigation', () => {
	test.each([
		{ event: keydown('Tab'), expected: 'second' },
		{ event: keyrepeat('Tab'), expected: 'second' },
		{ event: keydown('Backtab'), expected: 'third' },
		{ event: keyrepeat('Backtab'), expected: 'third' },
	])('$event.type $event.code moves focus once the target declines it', ({ event, expected }) => {
		const { host, first, second, third } = setup();
		const delegated: RecordedKeyEvent[] = [];
		recordKeyboard(first, delegated);

		handleInput(host, event);

		expect(getFocus(host.root)).toBe(expected === 'second' ? second : third);
		expect(delegated).toMatchObject([{ node: first, event }]);
	});

	test('leaves focus alone when the target consumes the key', () => {
		const { host, first } = setup();
		addListener(getElement(first), 'keydown', (event) => event.stopPropagation());

		handleInput(host, keydown('Tab'));

		expect(getFocus(host.root)).toBe(first);
	});

	test.each([keydown('a'), keyrepeat('a'), keyup('Tab'), keyup('Backtab')])(
		'delegates $type $code without moving focus',
		(event) => {
			const { host, first } = setup();
			const delegated: RecordedKeyEvent[] = [];
			recordKeyboard(first, delegated);

			handleInput(host, event);

			expect(getFocus(host.root)).toBe(first);
			expect(delegated).toMatchObject([{ node: first, event }]);
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
	node: Node | null;
	event: KeyEvent;
}

function setup(): Setup {
	const host = createHost();
	useFocus(host);
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
	const element = getElement(node);
	const record = (event: Dispatched<KeyDownEvent | KeyUpEvent | KeyRepeatEvent>): void => {
		events.push({ node: event.currentTarget.node, event });
	};

	addListener(element, 'keydown', record);
	addListener(element, 'keyup', record);
	addListener(element, 'keyrepeat', record);
}
