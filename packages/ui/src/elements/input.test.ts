// oxlint-disable max-params
import type { KeyDown, KeyRepeat } from '@bomb.sh/tty';
import { type Node } from '../core.ts';
import type { Dispatched, HostEvents } from '@clack/ui/events';
import { describe, expect, expectTypeOf, test } from 'vitest';
import { DispatchApi, useDispatch } from '../dispatch.ts';
import type { HostElement } from '../elements.ts';
import { getFocus, setFocusable, useFocus } from '../focus.ts';
import { createHost, type Host } from '../host.ts';
import { KeyboardApi, useKeyboard } from '../keyboard.ts';
import { InputApi, type InputProps, useInputElement } from './input.ts';

const { dispatch } = DispatchApi.methods;

const { deleteBackward, deleteForward, insert, moveBack, moveForward, moveMax, moveMin } =
	InputApi.methods;

describe('input', () => {
	describe('InputApi', () => {
		test('starts empty with the caret at zero', () => {
			const { input } = setup();

			expectState(input, '', 0);
		});

		describe('insert', () => {
			test('inserts text at the caret and advances the caret', () => {
				const { input, node } = setup();

				insert(node, 'h');

				expectState(input, 'h', 1);
			});

			test('inserts a run of characters from left to right', () => {
				const { input, node } = setup();

				typeText(node, 'cat');

				expectState(input, 'cat', 3);
			});

			test('inserts text in the middle of the value', () => {
				const { input, node } = setup();
				typeText(node, 'cat');
				moveBack(node);

				insert(node, 'x');

				expectState(input, 'caxt', 3);
			});

			test('advances by every code point in a multi-character insertion', () => {
				const { input, node } = setup();
				typeText(node, 'ab');
				moveBack(node);

				insert(node, '😀x');

				expectState(input, 'a😀xb', 3);
			});

			test('does nothing when inserting an empty string', () => {
				const { input, node } = setup();
				typeText(node, 'cat');
				moveBack(node);

				insert(node, '');

				expectState(input, 'cat', 2);
			});

			test('removes line breaks from inserted text', () => {
				const { input, node } = setup();

				insert(node, 'a\nb\r\nc\r');

				expectState(input, 'abc', 3);
			});
		});

		describe('deleteBackward', () => {
			test('removes the code point before the caret', () => {
				const { input, node } = setup();
				typeText(node, 'cat');
				moveMin(node);
				moveForward(node);

				deleteBackward(node);

				expectState(input, 'at', 0);
			});

			test('removes the final code point when the caret is at the end', () => {
				const { input, node } = setup();
				typeText(node, 'cat');

				deleteBackward(node);

				expectState(input, 'ca', 2);
			});

			test('does nothing when the caret is at the start', () => {
				const { input, node } = setup();
				typeText(node, 'cat');
				moveMin(node);

				deleteBackward(node);

				expectState(input, 'cat', 0);
			});

			test('removes an entire multi-code-unit code point', () => {
				const { input, node } = setup();
				typeText(node, 'a😀');

				deleteBackward(node);

				expectState(input, 'a', 1);
			});
		});

		describe('deleteForward', () => {
			test('removes the code point after the caret', () => {
				const { input, node } = setup();
				typeText(node, 'cat');
				moveMin(node);
				moveForward(node);

				deleteForward(node);

				expectState(input, 'ct', 1);
			});

			test('does nothing when the caret is at the end', () => {
				const { input, node } = setup();
				typeText(node, 'cat');

				deleteForward(node);

				expectState(input, 'cat', 3);
			});

			test('removes an entire multi-code-unit code point', () => {
				const { input, node } = setup();
				typeText(node, 'a😀b');
				moveMin(node);
				moveForward(node);

				deleteForward(node);

				expectState(input, 'ab', 1);
			});
		});

		describe('caret movement', () => {
			test('moves one code point toward the start', () => {
				const { input, node } = setup();
				typeText(node, 'cat');

				moveBack(node);

				expectState(input, 'cat', 2);
			});

			test('moves one code point toward the end', () => {
				const { input, node } = setup();
				typeText(node, 'cat');
				moveMin(node);

				moveForward(node);

				expectState(input, 'cat', 1);
			});

			test('does not move before the start', () => {
				const { input, node } = setup();
				typeText(node, 'cat');
				moveMin(node);

				moveBack(node);

				expectState(input, 'cat', 0);
			});

			test('does not move past the end', () => {
				const { input, node } = setup();
				typeText(node, 'cat');

				moveForward(node);

				expectState(input, 'cat', 3);
			});

			test('moves directly to the start', () => {
				const { input, node } = setup();
				typeText(node, 'cat');

				moveMin(node);

				expectState(input, 'cat', 0);
			});

			test('moves directly to the code-point end', () => {
				const { input, node } = setup();
				typeText(node, 'a😀b');
				moveMin(node);

				moveMax(node);

				expectState(input, 'a😀b', 3);
			});
		});

		test('keeps state isolated between input elements', () => {
			const host = createHost();
			useFocus(host);
			useInputElement(host);
			const first = createInput(host);
			const second = createInput(host);

			insert(first.node!, 'x');

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
			const { host, input, node } = setup();
			const events: HostEvents['input'][] = [];
			host.addEventListener(input, 'input', (event) => {
				expectTypeOf(event).toEqualTypeOf<Dispatched<HostEvents['input']>>();
				events.push(event);
			});

			insert(node, 'cat');
			deleteBackward(node);
			moveMin(node);
			deleteForward(node);

			expect(
				events.map((event) => ({
					type: event.type,
					target: event.target === input,
					value: event.value,
				})),
			).toEqual([
				{ type: 'input', target: true, value: 'cat' },
				{ type: 'input', target: true, value: 'ca' },
				{ type: 'input', target: true, value: 'a' },
			]);
		});

		test('does not emit when an action leaves the content unchanged', () => {
			const { host, input, node } = setup();
			let events = 0;
			host.addEventListener(input, 'input', () => events++);

			insert(node, '');
			insert(node, '\r\n');
			deleteBackward(node);
			deleteForward(node);
			moveBack(node);
			moveForward(node);
			moveMin(node);
			moveMax(node);

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
			const { host, node } = setupKeyboardInput();
			const calls: InputCall[] = [];
			recordInput(node, calls);

			dispatch(host.root, event);

			const [method, argument] = expected;
			expect(calls).toEqual([argument === undefined ? [method] : [method, argument]]);
		});

		test('uses input keydown behavior for keyrepeat', () => {
			const { host, node } = setupKeyboardInput();
			const calls: InputCall[] = [];
			recordInput(node, calls);
			const event: KeyRepeat = {
				type: 'keyrepeat',
				key: 'x',
				code: 'x',
				text: 'x',
			};

			dispatch(host.root, event);

			expect(calls).toEqual([['insert', 'x']]);
		});

		test('does not delegate a recognized input binding', () => {
			const { host, node } = setupKeyboardInput();
			const calls: InputCall[] = [];
			let delegations = 0;
			recordInput(node, calls);
			recordDelegatedKeydown(host, () => delegations++);

			dispatch(host.root, keydown('x', 'x'));

			expect(calls).toEqual([['insert', 'x']]);
			expect(delegations).toBe(0);
		});

		test('delegates an unrecognized input key exactly once', () => {
			const { host, node } = setupKeyboardInput();
			const event = keydown('Enter');
			const delegated: Array<{ target: boolean; event: boolean }> = [];
			recordDelegatedKeydown(host, (target, received) => {
				delegated.push({ target: target === node, event: received === event });
			});

			dispatch(host.root, event);

			expect(delegated).toEqual([{ target: true, event: true }]);
		});

		test('delegates a key targeting a non-input node exactly once', () => {
			const host = setupKeyboardHost();
			useInputElement(host);
			const target = createFocusable(host);
			const event = keydown('x', 'x');
			const delegated: Array<{ target: boolean; event: boolean }> = [];
			recordDelegatedKeydown(host, (node, received) => {
				delegated.push({ target: node === target, event: received === event });
			});

			dispatch(host.root, event);

			expect(delegated).toEqual([{ target: true, event: true }]);
		});

		test('makes the first attached input the keyboard target', () => {
			const { host, node } = setupKeyboardInput({ focus: false });
			const calls: InputCall[] = [];
			recordInput(node, calls);

			expect(getFocus(host.root) === node).toBe(true);
			dispatch(host.root, keydown('x', 'x'));
			expect(calls).toEqual([['insert', 'x']]);
		});
	});
});

type InputCall = [method: string, argument?: string];

function setup(): { host: Host; input: HostElement; node: Node } {
	const host = createHost();
	useFocus(host);
	useInputElement(host);
	const input = createInput(host);
	return { host, input, node: input.node! };
}

function setupKeyboardHost(): Host {
	const host = createHost();
	useDispatch(host);
	useFocus(host);
	useKeyboard(host);
	return host;
}

function setupKeyboardInput(options: { focus?: boolean } = {}): {
	host: Host;
	node: Node;
} {
	const host = setupKeyboardHost();
	useInputElement(host);
	const input = createInput(host);
	const node = input.node!;
	if (options.focus ?? true) {
		setFocusable(node);
	}
	return { host, node };
}

function createInput(host: Host): HostElement {
	const input = host.createElement('input');
	host.insertBefore(host.element, input);
	return input;
}

function typeText(node: Node, value: string): void {
	for (const codePoint of value) {
		insert(node, codePoint);
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

function recordInput(node: Node, calls: InputCall[]): void {
	InputApi.around(node, {
		insert([, text]) {
			calls.push(['insert', text]);
		},
		deleteBackward() {
			calls.push(['deleteBackward']);
		},
		deleteForward() {
			calls.push(['deleteForward']);
		},
		moveBack() {
			calls.push(['moveBack']);
		},
		moveForward() {
			calls.push(['moveForward']);
		},
		moveMin() {
			calls.push(['moveMin']);
		},
		moveMax() {
			calls.push(['moveMax']);
		},
	});
}

function recordDelegatedKeydown(host: Host, listener: (node: Node, event: KeyDown) => void): void {
	KeyboardApi.around(host.root, {
		keydown([node, event], next) {
			listener(node, event);
			return next(node, event);
		},
	});
}

function expectState(input: HostElement, value: string, caret: number): void {
	expect({
		value: input.properties['value'],
		caret: input.properties['caret'],
	}).toEqual({ value, caret });
}
