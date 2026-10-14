// oxlint-disable max-params
import { fit, type KeyDown, type KeyRepeat } from '@bomb.sh/tty';
import { type Node } from '../core.ts';
import type { HostEvents } from '@clack/ui/events';
import { describe, expect, expectTypeOf, test } from 'vitest';
import { DispatchApi } from '../dispatch.ts';
import { defineElement } from '../component.ts';
import { EventApi } from '../event-api.ts';
import type { HostElement } from '../elements.ts';
import { FocusApi } from '../focus.ts';
import { createHost, type Host } from '../host.ts';
import { KeyboardApi } from '../keyboard.ts';
import { Input, InputElement, type InputProps } from './input.ts';

describe('input', () => {
	test.each(['value', 'defaultValue'] as const)(
		'preserves edited %s and caret across disconnect and cross-parent moves',
		(property) => {
			const { host, input, component } = setupTrackedInput({ [property]: 'ab' });
			const first = host.createElement('box');
			const second = host.createElement('box');
			host.insertBefore(host.element, first);
			host.insertBefore(host.element, second);
			host.insertBefore(first, input);
			insert(input.node!, 'cd');
			moveBack(input.node!);
			const previous = input.node;
			const editor = component.editor;

			host.insertBefore(second, input);

			expect(input.node).not.toBe(previous);
			expect(component.editor).toBe(editor);
			expectState(input, 'abcd', 3);
			expect(input.textContent).toBe('abcd');
			host.removeChild(second, input);
			expectState(input, 'abcd', 3);
			host.insertBefore(first, input);
			expect(component.editor).toBe(editor);
			expectState(input, 'abcd', 3);
			expect(input.textContent).toBe('abcd');
		},
	);

	test('honors value and defaultValue changes while disconnected', () => {
		const { host, input } = setup();
		insert(input.node!, 'edited');
		host.removeChild(host.element, input);
		input.setProperty('defaultValue', 'new');
		host.insertBefore(host.element, input);
		expectState(input, 'new', 3);
		host.removeChild(host.element, input);
		input.setProperty('value', 'replacement');
		host.insertBefore(host.element, input);
		expectState(input, 'replacement', 11);
	});

	test('disabled inputs reject focus and keyboard editing and honor property changes', () => {
		const host = setupKeyboardHost();
		Input.register(host);
		const input = host.createElement('input', { value: 'ab', disabled: true });
		host.insertBefore(host.element, input);
		const focus = FocusApi.at(host.root);
		expect(focus.getFocus()).toBe(host.root);
		expect(focus.canFocus(input.node!)).toBe(false);
		expect(() => focus.setFocus(input.node!)).toThrow(TypeError);
		KeyboardApi.at(input.node!).keydown(keydown('x', 'x'));
		KeyboardApi.at(input.node!).keyrepeat({ ...keydown('Backspace'), type: 'keyrepeat' });
		expectState(input, 'ab', 2);

		input.setProperty('disabled', false);
		expect(focus.getFocus()).toBe(input.node);
		DispatchApi.at(host.root).dispatch(keydown('x', 'x'));
		expectState(input, 'abx', 3);
		input.setProperty('disabled', true);
		expect(focus.getFocus()).toBe(host.root);
		expect(focus.canFocus(input.node!)).toBe(false);
		KeyboardApi.at(input.node!).keydown(keydown('Delete'));
		expectState(input, 'abx', 3);
		host.removeChild(host.element, input);
		input.setProperty('disabled', false);
		host.insertBefore(host.element, input);
		expect(focus.getFocus()).toBe(input.node);
		expectState(input, 'abx', 3);
		host.removeChild(host.element, input);
		input.setProperty('disabled', true);
		host.insertBefore(host.element, input);
		expect(focus.getFocus()).toBe(host.root);
		expect(focus.canFocus(input.node!)).toBe(false);
	});

	test.each(['hidden', 'aria-hidden', 'style'] as const)(
		'updates focus eligibility and rejects editing when %s hides the input',
		(property) => {
			const host = setupKeyboardHost();
			Input.register(host);
			const input = host.createElement('input', { value: 'ab' });
			host.insertBefore(host.element, input);
			const focus = FocusApi.at(host.root);
			expect(focus.getFocus()).toBe(input.node);
			input.setProperty(property, property === 'style' ? { clipPath: 'inset(50%)' } : true);
			expect(focus.canFocus(input.node!)).toBe(false);
			expect(focus.getFocus()).toBe(host.root);
			KeyboardApi.at(input.node!).keydown(keydown('x', 'x'));
			expectState(input, 'ab', 2);
			input.setProperty(property, property === 'style' ? {} : false);
			expect(focus.getFocus()).toBe(input.node);
			KeyboardApi.at(input.node!).keyrepeat({ ...keydown('x', 'x'), type: 'keyrepeat' });
			expectState(input, 'abx', 3);
		},
	);

	test('retains direct editor edits while disconnected without emitting input', () => {
		const { host, input, component } = setupTrackedInput();
		const editor = component.editor;
		let events = 0;
		host.addEventListener(input, 'input', () => events++);
		host.removeChild(host.element, input);
		expect(component.keydown(keydown('x', 'x'))).toBe(false);
		expect(component.keyrepeat({ ...keydown('x', 'x'), type: 'keyrepeat' })).toBe(false);
		editor.insert('a😀b');
		editor.moveBack();
		expectState(input, 'a😀b', 2);
		host.insertBefore(host.element, input);
		expect(component.editor).toBe(editor);
		expectState(input, 'a😀b', 2);
		expect(input.textContent).toBe('a😀b');
		expect(events).toBe(0);
	});

	test.each(['disabled', 'hidden'] as const)(
		'direct editor commands remain available when %s prevents keyboard editing',
		(property) => {
			const { host, input, component } = setupTrackedInput({ [property]: true });
			const values: string[] = [];
			host.addEventListener(input, 'input', (event) => values.push(event.value));
			component.editor.insert('a😀b');
			component.editor.moveBack();
			expectState(input, 'a😀b', 2);
			KeyboardApi.at(input.node!).keydown(keydown('x', 'x'));
			expectState(input, 'a😀b', 2);
			expect(values).toEqual(['a😀b']);
		},
	);

	test('uses a caller-provided layout width for content-sized inputs', () => {
		const host = createHost();
		Input.register(host);
		const input = host.createElement('input', { layout: { width: fit() } });
		host.insertBefore(host.element, input);
		const box = input.children.find((child) => child.type === 'element');

		expect(box?.type === 'element' ? box.properties.layout : undefined).toMatchObject({
			width: fit(),
		});
	});

	describe('editing', () => {
		test('exposes the same editor and clamps programmatic replacement without inspecting children', () => {
			const { host, input, component } = setupTrackedInput();
			const editor = component.editor;
			const values: string[] = [];
			host.addEventListener(input, 'input', (event) => values.push(event.value));
			editor.content = 'a😀bc';
			editor.caret = 20;
			expectState(input, 'a😀bc', 4);
			editor.content = 'x\r\n';
			expect(component.editor).toBe(editor);
			expectState(input, 'x', 1);
			expect(input.textContent).toBe('x');
			expect(values).toEqual(['a😀bc', 'x']);
		});
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
			const host = setupKeyboardHost();
			Input.register(host);
			const first = createInput(host);
			const second = createInput(host);

			insert(first.node!, 'x');

			expectState(first, 'x', 1);
			expectState(second, '', 0);
		});
	});

	describe('input event', () => {
		test.each(['', '\r\n'])(
			'preserves the middle-edit caret after a normalized same-value controlled write (%j)',
			(lineBreaks) => {
				const { host, input, node } = setup();
				input.setProperty('value', 'abcd');
				moveMin(node);
				moveForward(node);
				moveForward(node);
				const values: string[] = [];
				host.addEventListener(input, 'input', (event) => {
					values.push(event.value);
					input.setProperty('value', event.value + lineBreaks);
				});

				insert(node, 'x');

				expectState(input, 'abxcd', 3);
				expect(input.textContent).toBe('abxcd');
				expect(values).toEqual(['abxcd']);
				input.setProperty('value', 'abxcd' + lineBreaks);
				expectState(input, 'abxcd', 3);
				expect(values).toEqual(['abxcd']);
			},
		);

		test('property replacements update the view without emitting user input', () => {
			const { host, input } = setup();
			let events = 0;
			host.addEventListener(input, 'input', () => events++);
			input.setProperty('value', 'a\n😀');
			expectState(input, 'a😀', 2);
			expect(input.textContent).toBe('a😀');
			expect(events).toBe(0);
		});
		test('types the oninput prop with the registered input event', () => {
			expectTypeOf<NonNullable<InputProps['oninput']>>()
				.parameter(0)
				.toEqualTypeOf<HostEvents['input']>();
		});

		test('emits the updated value after each content mutation', () => {
			const { host, input, node } = setup();
			const events: HostEvents['input'][] = [];
			host.addEventListener(input, 'input', (event) => {
				expectTypeOf(event).toEqualTypeOf<HostEvents['input']>();
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
		test('observes state before and after keyboard editing and semantic input delivery', () => {
			const { host, input, node } = setupKeyboardInput();
			const observations: Array<[string, unknown, unknown]> = [];
			const event = keydown('x', 'x');
			KeyboardApi.decorate(host.root, () => ({
				keydown(received) {
					expect(this.node).toBe(node);
					expect(received).toBe(event);
					observations.push(['before', input.properties.value, input.properties.caret]);
					super.keydown(received);
					observations.push(['after', input.properties.value, input.properties.caret]);
				},
			}));
			EventApi.decorate(host.root, () => ({
				emit(received) {
					if (received.type === 'input') {
						expect(received.target).toBe(input);
						observations.push(['emit', received.value, input.properties.caret]);
					}
					return super.emit(received);
				},
			}));
			host.addEventListener(input, 'input', (received) => {
				observations.push(['listener', received.value, input.properties.caret]);
			});

			DispatchApi.at(host.root).dispatch(event);

			expect(observations).toEqual([
				['before', '', 0],
				['emit', 'x', 1],
				['listener', 'x', 1],
				['after', 'x', 1],
			]);
			expectState(input, 'x', 1);
		});

		test('node-local keyboard middleware suppresses only its input', () => {
			const { host, input, node } = setupKeyboardInput();
			const other = createInput(host);
			const observed: Node[] = [];
			recordDelegatedKeydown(host, (target) => observed.push(target));
			let suppressed = 0;
			KeyboardApi.decorate(node, () => ({
				keydown() {
					suppressed++;
				},
			}));
			let events = 0;
			host.addEventListener(input, 'input', () => events++);

			DispatchApi.at(host.root).dispatch(keydown('x', 'x'));
			FocusApi.at(host.root).setFocus(other.node!);
			DispatchApi.at(host.root).dispatch(keydown('y', 'y'));

			expect(suppressed).toBe(1);
			expect(observed).toEqual([node, other.node]);
			expectState(input, '', 0);
			expectState(other, 'y', 1);
			expect(events).toBe(0);
		});

		test.each([
			{
				name: 'inserts printable text',
				event: keydown('x', 'x'),
				value: 'axbc',
				caret: 2,
			},
			{
				name: 'maps Backspace to deleteBackward',
				event: keydown('Backspace'),
				value: 'bc',
				caret: 0,
			},
			{
				name: 'maps Delete to deleteForward',
				event: keydown('Delete'),
				value: 'ac',
				caret: 1,
			},
			{
				name: 'maps ArrowLeft to moveBack',
				event: keydown('ArrowLeft'),
				value: 'abc',
				caret: 0,
			},
			{
				name: 'maps ArrowRight to moveForward',
				event: keydown('ArrowRight'),
				value: 'abc',
				caret: 2,
			},
			{
				name: 'maps Home to moveMin',
				event: keydown('Home'),
				value: 'abc',
				caret: 0,
			},
			{
				name: 'maps End to moveMax',
				event: keydown('End'),
				value: 'abc',
				caret: 3,
			},
		])('$name', ({ event, value, caret }) => {
			const { host, input, node } = setupKeyboardInput();
			input.setProperty('value', 'abc');
			moveMin(node);
			moveForward(node);

			DispatchApi.at(host.root).dispatch(event);

			expectState(input, value, caret);
			expect(input.textContent).toBe(value);
		});

		test('uses input keydown behavior for keyrepeat', () => {
			const { host, input } = setupKeyboardInput();
			const event: KeyRepeat = {
				type: 'keyrepeat',
				key: 'x',
				code: 'x',
				text: 'x',
			};

			DispatchApi.at(host.root).dispatch(event);

			expectState(input, 'x', 1);
		});

		test('allows an ancestor decorator to observe a recognized input binding', () => {
			const { host, input } = setupKeyboardInput();
			let delegations = 0;
			recordDelegatedKeydown(host, () => delegations++);

			DispatchApi.at(host.root).dispatch(keydown('x', 'x'));

			expectState(input, 'x', 1);
			expect(delegations).toBe(1);
		});

		test('delegates an unrecognized input key exactly once', () => {
			const { host, node } = setupKeyboardInput();
			const event = keydown('Enter');
			const delegated: Array<{ target: boolean; event: boolean }> = [];
			recordDelegatedKeydown(host, (target, received) => {
				delegated.push({ target: target === node, event: received === event });
			});

			DispatchApi.at(host.root).dispatch(event);

			expect(delegated).toEqual([{ target: true, event: true }]);
		});

		test('delegates a key targeting a non-input node exactly once', () => {
			const host = setupKeyboardHost();
			Input.register(host);
			const target = createFocusable(host);
			const event = keydown('x', 'x');
			const delegated: Array<{ target: boolean; event: boolean }> = [];
			recordDelegatedKeydown(host, (node, received) => {
				delegated.push({ target: node === target, event: received === event });
			});

			DispatchApi.at(host.root).dispatch(event);

			expect(delegated).toEqual([{ target: true, event: true }]);
		});

		test('makes the first attached input the keyboard target', () => {
			const { host, input, node } = setupKeyboardInput({ focus: false });

			expect(getFocus(host.root) === node).toBe(true);
			DispatchApi.at(host.root).dispatch(keydown('x', 'x'));
			expectState(input, 'x', 1);
		});
	});
});

function setup(): { host: Host; input: HostElement; node: Node } {
	const host = setupKeyboardHost();
	Input.register(host);
	const input = createInput(host);
	return { host, input, node: input.node! };
}

function setupKeyboardHost(): Host {
	const host = createHost();
	DispatchApi.init(host.root);
	FocusApi.init(host.root);
	KeyboardApi.init(host.root);
	return host;
}

function setupKeyboardInput(options: { focus?: boolean } = {}): {
	host: Host;
	input: HostElement;
	node: Node;
} {
	const host = setupKeyboardHost();
	Input.register(host);
	const input = createInput(host);
	const node = input.node!;
	if (options.focus ?? true) {
		setFocusable(node);
	}
	return { host, input, node };
}

function setupTrackedInput(properties: InputProps = {}): {
	host: Host;
	input: HostElement;
	component: InputElement;
} {
	const host = setupKeyboardHost();
	let component!: InputElement;
	class CapturingInput extends InputElement {
		constructor(element: HostElement) {
			super(element);
			// oxlint-disable-next-line typescript/no-this-alias
			component = this;
		}
	}
	const TrackedInput = defineElement('tracked-input', {
		define: CapturingInput,
		dependencies: [Input],
	});
	TrackedInput.register(host);
	const input = TrackedInput.create(host, properties);
	host.insertBefore(host.element, input);
	return { host, input, component };
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

function deleteBackward(node: Node): void {
	KeyboardApi.at(node).keydown(keydown('Backspace'));
}

function deleteForward(node: Node): void {
	KeyboardApi.at(node).keydown(keydown('Delete'));
}

function insert(node: Node, text: string): void {
	KeyboardApi.at(node).keydown(keydown('x', text));
}

function moveBack(node: Node): void {
	KeyboardApi.at(node).keydown(keydown('ArrowLeft'));
}

function moveForward(node: Node): void {
	KeyboardApi.at(node).keydown(keydown('ArrowRight'));
}

function moveMax(node: Node): void {
	KeyboardApi.at(node).keydown(keydown('End'));
}

function moveMin(node: Node): void {
	KeyboardApi.at(node).keydown(keydown('Home'));
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

function getFocus(node: Node): Node {
	return FocusApi.at(node).getFocus();
}

function setFocusable(node: Node): void {
	FocusApi.at(node).setFocusable();
}

function recordDelegatedKeydown(host: Host, listener: (node: Node, event: KeyDown) => void): void {
	KeyboardApi.decorate(host.root, () => ({
		keydown(event) {
			listener(this.node, event);
			return super.keydown(event);
		},
	}));
}

// oxlint-disable-next-line bombshell-dev/max-params
function expectState(input: HostElement, value: string, caret: number): void {
	expect({
		value: input.properties['value'],
		caret: input.properties['caret'],
	}).toEqual({ value, caret });
}
