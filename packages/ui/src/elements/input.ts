import { createContext, type Node } from '../core.ts';
import { open, close, text, fit, percent, rgba, type KeyDown, type KeyRepeat } from '@bomb.sh/tty';
import type { HostEvent } from '@clack/ui/events';
import { addListener, dispatch, type Dispatched } from '../events.ts';
import { getElement, type HostElement } from '../elements.ts';
import type { Host } from '../host.ts';
import { LayoutApi } from '../layout.ts';
import { getFocus, setFocusable } from '../focus.ts';
import type { KeyDownEvent, KeyRepeatEvent } from '../keyboard.ts';

export interface InputEvent extends HostEvent<'input'> {
	value: string;
}

declare module '@clack/ui/events' {
	interface HostEvents {
		input: InputEvent;
	}
}

export interface InputProps {
	oninput?: (event: InputEvent) => void;
}

declare module '@clack/ui/elements' {
	interface HostElements {
		input: InputProps;
	}
}

export function useInputElement(host: Host): void {
	const { root } = host;

	host.defineElement('input', (element) => {
		const input = new Input(element);
		element.attach = (node) => {
			setFocusable(node);
			InputContext.set(node, input);
		};

		const edit = (event: Dispatched<KeyDownEvent | KeyRepeatEvent>): void => {
			if (handleKeyEvent(input, event)) {
				event.stopPropagation();
			}
		};
		addListener(element, 'keydown', edit);
		addListener(element, 'keyrepeat', edit);

		// make value and caret accessible to the public <input/>
		Object.defineProperties(element.properties, {
			value: {
				get() {
					return input.content;
				},
			},
			caret: {
				get() {
					return input.caret;
				},
			},
		});
	});

	LayoutApi.around(root, {
		*layout([node], next) {
			const element = getElement(node);
			if (element.name !== 'input') {
				return yield* next(node);
			}

			const focused = node === getFocus(node);
			const value = InputContext.expect(node).content;
			// commented out until @bomb.sh/tty can render carets
			// const caret = Math.min(input.caret, [...value].length);
			const color = focused ? rgba(255, 255, 255) : rgba(100, 100, 100);
			const border = { color, top: 1, right: 1, bottom: 1, left: 1 };
			yield open(node.id, {
				border,
				layout: {
					height: fit(3),
					width: percent(0.3),
					padding: { top: 1, right: 1, bottom: 1, left: 1 },
				},
			});
			yield text(value || ' ');
			yield close();
		},
	});
}

/**
 * The editable content of one `input` element. The caret is a code-point index
 * into `content`; every method keeps the two consistent and dispatches an
 * `input` event on the element whenever the content changes.
 */
export class Input {
	content = '';
	caret = 0;

	private readonly element: HostElement;

	constructor(element: HostElement) {
		this.element = element;
	}

	insert(text: string): void {
		this.edit(() => {
			// Inputs are single-line, so discard CR/LF. Spreading the string produces
			// Unicode code points rather than UTF-16 code units.
			const inserted = [...text.replace(/[\r\n]/g, '')];
			const codepoints = [...this.content];
			const caret = this.caret;

			// Insert each new code point independently, then advance by exactly the
			// number that survived normalization.
			codepoints.splice(caret, 0, ...inserted);
			this.content = codepoints.join('');
			this.caret = caret + inserted.length;
		});
	}

	deleteBackward(): void {
		this.edit(() => {
			const codepoints = [...this.content];
			const caret = this.clampedCaret(codepoints.length);
			if (caret > 0) {
				codepoints.splice(caret - 1, 1);
				this.content = codepoints.join('');
				this.caret = caret - 1;
			}
		});
	}

	deleteForward(): void {
		this.edit(() => {
			const codepoints = [...this.content];
			const length = codepoints.length;
			const caret = this.clampedCaret(length);
			if (caret < length) {
				codepoints.splice(caret, 1);
				this.content = codepoints.join('');
			}
		});
	}

	moveBack(): void {
		this.caret = Math.max(0, this.caret - 1);
	}

	moveForward(): void {
		this.caret = Math.min([...this.content].length, this.caret + 1);
	}

	moveMin(): void {
		this.caret = 0;
	}

	moveMax(): void {
		this.caret = [...this.content].length;
	}

	/** Apply `change`, dispatching an `input` event if it altered the content. */
	private edit(change: () => void): void {
		const original = this.content;
		change();
		if (original !== this.content) {
			const { element } = this;
			dispatch(element, { type: 'input', target: element, value: this.content });
		}
	}

	private clampedCaret(length: number): number {
		if (this.caret > length) {
			console.warn(`caret mismatch: ${this.caret}, value length: ${length}`);
			this.caret = length;
		}
		return this.caret;
	}
}

/** The {@link Input} backing `node`, if it hosts an `input` element. */
export function getInput(node: Node): Input | undefined {
	return InputContext.hasOwn(node) ? InputContext.expect(node) : undefined;
}

const InputContext = createContext<Input>('input');

function handleKeyEvent(input: Input, event: KeyDown | KeyRepeat): boolean {
	if (event.text && event.text.length > 0) {
		input.insert(event.text);
		return true;
	} else if (event.code === 'Backspace') {
		input.deleteBackward();
		return true;
	} else if (event.code === 'Delete') {
		input.deleteForward();
		return true;
	} else if (event.code === 'ArrowLeft') {
		input.moveBack();
		return true;
	} else if (event.code === 'ArrowRight') {
		input.moveForward();
		return true;
	} else if (event.code === 'Home') {
		input.moveMin();
		return true;
	} else if (event.code === 'End') {
		input.moveMax();
		return true;
	}
	return false;
}
