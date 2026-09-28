import { createApi, createContext, type Node } from '../core.ts';
import { ComponentElement, defineComponent } from '../component.ts';
import type { HostEvent } from '@clack/ui/events';
import { emit } from '../emit.ts';
import type { HostElement } from '../elements.ts';
import { setFocusable } from '../focus.ts';
import type { KeyDown, KeyRepeat } from '../keyboard.ts';
import { fit, percent, rgba } from '../values.ts';

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

/** A browser-like single-line input composed from box and text children. */
export class InputElement extends ComponentElement<InputProps> {
	content = '';
	caret = 0;
	private inputBox: HostElement | undefined;
	private inputText: HostElement | undefined;

	constructor(element: HostElement) {
		super(element);
		Object.defineProperties(element.properties, {
			value: { get: () => this.content },
			caret: { get: () => this.caret },
		});
	}

	create(): void {
		this.inputBox = this.element.createElement('box', {
			border: { color: rgba(100, 100, 100), top: 1, right: 1, bottom: 1, left: 1 },
			layout: {
				height: fit(3),
				width: percent(0.3),
				padding: { top: 1, right: 1, bottom: 1, left: 1 },
			},
		});
		this.inputText = this.inputBox.createElement('text');
		this.inputBox.append(this.inputText);
		this.element.append(this.inputBox);
		this.syncText();
	}

	connectedCallback(node: Node): void {
		setFocusable(node);
		InputContext.set(node, this);
	}

	focusedCallback(): void {
		this.inputBox?.setProperty('border', {
			color: rgba(255, 255, 255),
			top: 1,
			right: 1,
			bottom: 1,
			left: 1,
		});
	}

	blurredCallback(): void {
		this.inputBox?.setProperty('border', {
			color: rgba(100, 100, 100),
			top: 1,
			right: 1,
			bottom: 1,
			left: 1,
		});
	}

	keydown(event: KeyDown): boolean {
		return handleKeyEvent(this.node!, event);
	}

	keyrepeat(event: KeyRepeat): boolean {
		return handleKeyEvent(this.node!, event);
	}

	private syncText(): void {
		if (this.inputText) {
			this.inputText.textContent = this.content || ' ';
		}
	}
}

export const Input = defineComponent('input', InputElement);

export const InputApi = createApi('input', {
	insert(node, value: string): void {
		withModel(node, (model) => {
			// Inputs are single-line, so discard CR/LF. Spreading the string produces
			// Unicode code points rather than UTF-16 code units.
			const inserted = [...value.replace(/[\r\n]/g, '')];
			const codepoints = [...model.content];
			const caret = model.caret;

			// The caret is a code-point index. Insert each new code point independently,
			// then advance by exactly the number that survived normalization.
			codepoints.splice(caret, 0, ...inserted);
			model.content = codepoints.join('');
			model.caret = caret + inserted.length;
		});
	},
	deleteBackward(node): void {
		withModel(node, (model) => {
			const codepoints = [...model.content];
			let caret = model.caret;
			const length = codepoints.length;
			if (caret > length) {
				console.warn('caret mismatch: ${caret}, value length: ${length}');
				caret = length;
			}
			if (caret > 0) {
				codepoints.splice(caret - 1, 1);
				model.content = codepoints.join('');
				model.caret = caret - 1;
			}
		});
	},
	deleteForward(node): void {
		withModel(node, (model) => {
			const codepoints = [...model.content];
			let caret = model.caret;
			const length = codepoints.length;
			if (caret > length) {
				console.warn('caret mismatch: ${caret}, value length: ${length}');
				caret = length;
			}
			if (caret < length) {
				codepoints.splice(caret, 1);
				model.content = codepoints.join('');
			}
		});
	},
	moveBack(node): void {
		withModel(node, (model) => {
			model.caret = Math.max(0, model.caret - 1);
		});
	},
	moveForward(node): void {
		withModel(node, (model) => {
			model.caret = Math.min([...model.content].length, model.caret + 1);
		});
	},
	moveMin(node): void {
		withModel(node, (model) => {
			model.caret = 0;
		});
	},
	moveMax(node): void {
		withModel(node, (model) => {
			model.caret = [...model.content].length;
		});
	},
});

export const { insert, deleteForward, deleteBackward, moveForward, moveBack, moveMin, moveMax } =
	InputApi.methods;

const InputContext = createContext<InputElement>('input');

function isInput(node: Node): boolean {
	return InputContext.hasOwn(node);
}

function withModel(node: Node, fn: (model: InputElement) => void): void {
	if (isInput(node)) {
		const model = InputContext.expect(node);
		const original = model.content;
		fn(model);
		if (original !== model.content) {
			model.syncText();
			emit(node, {
				type: 'input',
				value: model.content,
			});
		}
	}
}

function handleKeyEvent(node: Node, event: KeyDown | KeyRepeat): boolean {
	if (isInput(node)) {
		if (event.text && event.text.length > 0) {
			insert(node, event.text);
			return true;
		} else if (event.code === 'Backspace') {
			deleteBackward(node);
			return true;
		} else if (event.code === 'Delete') {
			deleteForward(node);
			return true;
		} else if (event.code === 'ArrowLeft') {
			moveBack(node);
			return true;
		} else if (event.code === 'ArrowRight') {
			moveForward(node);
			return true;
		} else if (event.code === 'Home') {
			moveMin(node);
			return true;
		} else if (event.code === 'End') {
			moveMax(node);
			return true;
		}
	}
	return false;
}
