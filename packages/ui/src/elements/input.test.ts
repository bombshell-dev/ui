// oxlint-disable max-params
import type { KeyDown, KeyRepeat } from '@bomb.sh/tty';
import { type Node } from '../core.ts';
import type { Dispatched, HostEvents } from '@clack/ui/events';
import { describe, expect, expectTypeOf, test } from 'vitest';
import type { HostElement } from '../elements.ts';
import { getFocus, setFocusable, useFocus } from '../focus.ts';
import { createHost, type Host } from '../host.ts';
import { handleInput } from '../ui.ts';
import { addListener } from '../events.ts';
import { getInput, type Input, type InputProps, useInputElement } from './input.ts';

describe('input', () => {
	describe('Input', () => {
		test('starts empty with the caret at zero', () => {
			const { element } = setup();

			expectState(element, '', 0);
		});

		describe('insert', () => {
			test('inserts text at the caret and advances the caret', () => {
				const { element, input } = setup();

				input.insert('h');

				expectState(element, 'h', 1);
			});

			test('inserts a run of characters from left to right', () => {
				const { element, input } = setup();

				typeText(input, 'cat');

				expectState(element, 'cat', 3);
			});

			test('inserts text in the middle of the value', () => {
				const { element, input } = setup();
				typeText(input, 'cat');
				input.moveBack();

				input.insert('x');

				expectState(element, 'caxt', 3);
			});

			test('advances by every code point in a multi-character insertion', () => {
				const { element, input } = setup();
				typeText(input, 'ab');
				input.moveBack();

				input.insert('😀x');

				expectState(element, 'a😀xb', 3);
			});

			test('does nothing when inserting an empty string', () => {
				const { element, input } = setup();
				typeText(input, 'cat');
				input.moveBack();

				input.insert('');

				expectState(element, 'cat', 2);
			});

			test('removes line breaks from inserted text', () => {
				const { element, input } = setup();

				input.insert('a\nb\r\nc\r');

				expectState(element, 'abc', 3);
			});
		});

		describe('deleteBackward', () => {
			test('removes the code point before the caret', () => {
				const { element, input } = setup();
				typeText(input, 'cat');
				input.moveMin();
				input.moveForward();

				input.deleteBackward();

				expectState(element, 'at', 0);
			});

			test('removes the final code point when the caret is at the end', () => {
				const { element, input } = setup();
				typeText(input, 'cat');

				input.deleteBackward();

				expectState(element, 'ca', 2);
			});

			test('does nothing when the caret is at the start', () => {
				const { element, input } = setup();
				typeText(input, 'cat');
				input.moveMin();

				input.deleteBackward();

				expectState(element, 'cat', 0);
			});

			test('removes an entire multi-code-unit code point', () => {
				const { element, input } = setup();
				typeText(input, 'a😀');

				input.deleteBackward();

				expectState(element, 'a', 1);
			});
		});

		describe('deleteForward', () => {
			test('removes the code point after the caret', () => {
				const { element, input } = setup();
				typeText(input, 'cat');
				input.moveMin();
				input.moveForward();

				input.deleteForward();

				expectState(element, 'ct', 1);
			});

			test('does nothing when the caret is at the end', () => {
				const { element, input } = setup();
				typeText(input, 'cat');

				input.deleteForward();

				expectState(element, 'cat', 3);
			});

			test('removes an entire multi-code-unit code point', () => {
				const { element, input } = setup();
				typeText(input, 'a😀b');
				input.moveMin();
				input.moveForward();

				input.deleteForward();

				expectState(element, 'ab', 1);
			});
		});

		describe('caret movement', () => {
			test('moves one code point toward the start', () => {
				const { element, input } = setup();
				typeText(input, 'cat');

				input.moveBack();

				expectState(element, 'cat', 2);
			});

			test('moves one code point toward the end', () => {
				const { element, input } = setup();
				typeText(input, 'cat');
				input.moveMin();

				input.moveForward();

				expectState(element, 'cat', 1);
			});

			test('does not move before the start', () => {
				const { element, input } = setup();
				typeText(input, 'cat');
				input.moveMin();

				input.moveBack();

				expectState(element, 'cat', 0);
			});

			test('does not move past the end', () => {
				const { element, input } = setup();
				typeText(input, 'cat');

				input.moveForward();

				expectState(element, 'cat', 3);
			});

			test('moves directly to the start', () => {
				const { element, input } = setup();
				typeText(input, 'cat');

				input.moveMin();

				expectState(element, 'cat', 0);
			});

			test('moves directly to the code-point end', () => {
				const { element, input } = setup();
				typeText(input, 'a😀b');
				input.moveMin();

				input.moveMax();

				expectState(element, 'a😀b', 3);
			});
		});

		test('keeps state isolated between input elements', () => {
			const host = createHost();
			useFocus(host);
			useInputElement(host);
			const first = createInput(host);
			const second = createInput(host);

			getInput(first.node!)!.insert('x');

			expectState(first, 'x', 1);
			expectState(second, '', 0);
		});
	});

	describe('input event', () => {
		test('types the oninput prop with the registered input event', () => {
			expectTypeOf<NonNullable<InputProps['oninput']>>()
				.parameter(0)
				.toEqualTypeOf<HostEvents['input']>();
		});

		test('emits the updated value after each content mutation', () => {
			const { host, element, input } = setup();
			const events: HostEvents['input'][] = [];
			host.addEventListener(element, 'input', (event) => {
				expectTypeOf(event).toEqualTypeOf<Dispatched<HostEvents['input']>>();
				events.push(event);
			});

			input.insert('cat');
			input.deleteBackward();
			input.moveMin();
			input.deleteForward();

			expect(
				events.map((event) => ({
					type: event.type,
					target: event.target === element,
					value: event.value,
				})),
			).toEqual([
				{ type: 'input', target: true, value: 'cat' },
				{ type: 'input', target: true, value: 'ca' },
				{ type: 'input', target: true, value: 'a' },
			]);
		});

		test('does not emit when an action leaves the content unchanged', () => {
			const { host, element, input } = setup();
			let events = 0;
			host.addEventListener(element, 'input', () => events++);

			input.insert('');
			input.insert('\r\n');
			input.deleteBackward();
			input.deleteForward();
			input.moveBack();
			input.moveForward();
			input.moveMin();
			input.moveMax();

			expect(events).toBe(0);
		});
	});

	describe('keymap', () => {
		test.each([
			{
				name: 'inserts printable text',
				event: keydown('x', 'x'),
				expected: ['insert', 'x'],
			},
			{
				name: 'maps Backspace to deleteBackward',
				event: keydown('Backspace'),
				expected: ['deleteBackward'],
			},
			{
				name: 'maps Delete to deleteForward',
				event: keydown('Delete'),
				expected: ['deleteForward'],
			},
			{
				name: 'maps ArrowLeft to moveBack',
				event: keydown('ArrowLeft'),
				expected: ['moveBack'],
			},
			{
				name: 'maps ArrowRight to moveForward',
				event: keydown('ArrowRight'),
				expected: ['moveForward'],
			},
			{
				name: 'maps Home to moveMin',
				event: keydown('Home'),
				expected: ['moveMin'],
			},
			{
				name: 'maps End to moveMax',
				event: keydown('End'),
				expected: ['moveMax'],
			},
		])('$name', ({ event, expected }) => {
			const { host, input } = setupKeyboardInput();
			const calls: InputCall[] = [];
			recordInput(input, calls);

			handleInput(host, event);

			const [method, argument] = expected;
			expect(calls).toEqual([argument === undefined ? [method] : [method, argument]]);
		});

		test('uses input keydown behavior for keyrepeat', () => {
			const { host, input } = setupKeyboardInput();
			const calls: InputCall[] = [];
			recordInput(input, calls);
			const event: KeyRepeat = {
				type: 'keyrepeat',
				key: 'x',
				code: 'x',
				text: 'x',
			};

			handleInput(host, event);

			expect(calls).toEqual([['insert', 'x']]);
		});

		test('does not delegate a recognized input binding', () => {
			const { host, input } = setupKeyboardInput();
			const calls: InputCall[] = [];
			let delegations = 0;
			recordInput(input, calls);
			recordDelegatedKeydown(host, () => delegations++);

			handleInput(host, keydown('x', 'x'));

			expect(calls).toEqual([['insert', 'x']]);
			expect(delegations).toBe(0);
		});

		test('delegates an unrecognized input key exactly once', () => {
			const { host, node } = setupKeyboardInput();
			const event = keydown('Enter');
			const delegated: Array<{ target: boolean; event: boolean }> = [];
			recordDelegatedKeydown(host, (target, received) => {
				delegated.push({ target: target === node, event: received.code === event.code });
			});

			handleInput(host, event);

			expect(delegated).toEqual([{ target: true, event: true }]);
		});

		test('delegates a key targeting a non-input node exactly once', () => {
			const host = setupKeyboardHost();
			useInputElement(host);
			const target = createFocusable(host);
			const event = keydown('x', 'x');
			const delegated: Array<{ target: boolean; event: boolean }> = [];
			recordDelegatedKeydown(host, (node, received) => {
				delegated.push({ target: node === target, event: received.code === event.code });
			});

			handleInput(host, event);

			expect(delegated).toEqual([{ target: true, event: true }]);
		});

		test('makes the first attached input the keyboard target', () => {
			const { host, node, input } = setupKeyboardInput({ focus: false });
			const calls: InputCall[] = [];
			recordInput(input, calls);

			expect(getFocus(host.root) === node).toBe(true);
			handleInput(host, keydown('x', 'x'));
			expect(calls).toEqual([['insert', 'x']]);
		});
	});
});

type InputCall = [method: string, argument?: string];

function setup(): { host: Host; element: HostElement; input: Input } {
	const host = createHost();
	useFocus(host);
	useInputElement(host);
	const element = createInput(host);
	return { host, element, input: getInput(element.node!)! };
}

function setupKeyboardHost(): Host {
	const host = createHost();
	useFocus(host);
	return host;
}

function setupKeyboardInput(options: { focus?: boolean } = {}): {
	host: Host;
	node: Node;
	input: Input;
} {
	const host = setupKeyboardHost();
	useInputElement(host);
	const element = createInput(host);
	const node = element.node!;
	if (options.focus ?? true) {
		setFocusable(node);
	}
	return { host, node, input: getInput(node)! };
}

function createInput(host: Host): HostElement {
	const input = host.createElement('input');
	host.insertBefore(host.element, input);
	return input;
}

function typeText(input: Input, value: string): void {
	for (const codePoint of value) {
		input.insert(codePoint);
	}
}

function keydown(code: KeyDown['code'], text?: string): KeyDown {
	return {
		type: 'keydown',
		key: text ?? code,
		code,
		...(text === undefined ? {} : { text }),
	};
}

function createFocusable(host: Host): Node {
	const element = host.createElement('box');
	host.insertBefore(host.element, element);
	setFocusable(element.node!);
	return element.node!;
}

function recordInput(input: Input, calls: InputCall[]): void {
	input.insert = (text) => {
		calls.push(['insert', text]);
	};
	input.deleteBackward = () => {
		calls.push(['deleteBackward']);
	};
	input.deleteForward = () => {
		calls.push(['deleteForward']);
	};
	input.moveBack = () => {
		calls.push(['moveBack']);
	};
	input.moveForward = () => {
		calls.push(['moveForward']);
	};
	input.moveMin = () => {
		calls.push(['moveMin']);
	};
	input.moveMax = () => {
		calls.push(['moveMax']);
	};
}

function recordDelegatedKeydown(
	host: Host,
	listener: (node: Node | null, event: KeyDown) => void,
): void {
	addListener(host.element, 'keydown', (event) => {
		listener(event.target.node, event);
	});
}

function expectState(element: HostElement, value: string, caret: number): void {
	expect({
		value: element.properties['value'],
		caret: element.properties['caret'],
	}).toEqual({ value, caret });
}
