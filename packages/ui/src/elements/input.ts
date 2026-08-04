import { lifecycle, type Node } from '../core.ts';
import { open, close, text, fit, percent, rgba, type KeyDown, type KeyRepeat } from '@bomb.sh/tty';
import type { HostEvent } from '@clack/ui/events';
import { getElement, type HostElement } from '../elements.ts';
import { type Host, HostApi } from '../host.ts';
import { LayoutApi } from '../layout.ts';
import { FocusApi } from '../focus.ts';
import { KeyboardApi } from '../keyboard.ts';
import { Api } from '../core/api.ts';

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

	HostApi.decorate(root, () => ({
		createElement(name) {
			const element: HostElement = super.createElement(name);
			if (element.name === 'input') {
				element.attach = (node) => {
					FocusApi.at(node).setFocusable();
					InputApi.init(node);
				};

				// make value and caret accessible to the public <input/>
				Object.defineProperties(element.properties, {
					value: {
						get() {
							return InputApi.at(element.node!).content;
						},
					},
					caret: {
						get() {
							return InputApi.at(element.node!).caret;
						},
					},
				});
			}
			return element;
		},
	}));

	LayoutApi.decorate(root, () => ({
		*layout() {
			const { node } = this;
			const element = getElement(node);
			if (element.name !== 'input') {
				return yield* super.layout();
			}

			const focused = node === FocusApi.at(node).getFocus();
			const input = InputApi.at(node);
			const value = input.content;
			// commented out until @bomb.sh/tty can render carets
			// const caret = Math.min(model.caret, [...value].length);
			const color = focused ? rgba(255, 255, 255) : rgba(100, 100, 100);
			const border = { color, top: 1, right: 1, bottom: 1, left: 1 };
			yield open(lifecycle.id(node), {
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
	}));
}

export class InputApi extends Api {
	content = '';
	caret = 0;

	constructor(location: Node) {
		super(location);

		KeyboardApi.decorate(location, () => ({
			keydown(event) {
				const { node } = this;
				if (!handleKeyEvent(node, event)) {
					return super.keydown(event);
				}
			},
			keyrepeat(event) {
				const { node } = this;
				if (!handleKeyEvent(node, event)) {
					return super.keyrepeat(event);
				}
			},
		}));
	}

	insert(text: string): void {
		this.update(() => {
			// Inputs are single-line, so discard CR/LF. Spreading the string produces
			// Unicode code points rather than UTF-16 code units.
			const inserted = [...text.replace(/[\r\n]/g, '')];
			const codepoints = [...this.content];
			const caret = this.caret;

			// The caret is a code-point index. Insert each new code point independently,
			// then advance by exactly the number that survived normalization.
			codepoints.splice(caret, 0, ...inserted);
			this.content = codepoints.join('');
			this.caret = caret + inserted.length;
		});
	}
	deleteBackward(): void {
		this.update(() => {
			const codepoints = [...this.content];
			let caret = this.caret;
			const length = codepoints.length;
			if (caret > length) {
				console.warn('caret mismatch: ${caret}, value length: ${length}');
				caret = length;
			}
			if (caret > 0) {
				codepoints.splice(caret - 1, 1);
				this.content = codepoints.join('');
				this.caret = caret - 1;
			}
		});
	}
	deleteForward(): void {
		this.update(() => {
			const codepoints = [...this.content];
			let caret = this.caret;
			const length = codepoints.length;
			if (caret > length) {
				console.warn('caret mismatch: ${caret}, value length: ${length}');
				caret = length;
			}
			if (caret < length) {
				codepoints.splice(caret, 1);
				this.content = codepoints.join('');
			}
		});
	}
	moveBack(): void {
		const caret = this.caret;
		this.caret = Math.max(0, caret - 1);
	}
	moveForward(): void {
		const caret = this.caret;
		const codepoints = [...this.content];
		this.caret = Math.min(codepoints.length, caret + 1);
	}
	moveMin(): void {
		this.caret = 0;
	}
	moveMax(): void {
		this.caret = [...this.content].length;
	}
	update<T>(fn: () => T): T {
		const original = this.content;
		const value = fn();
		if (original !== this.content) {
			HostApi.at(this.node).emit({
				type: 'input',
				value: this.content,
			});
		}
		return value;
	}
}

function handleKeyEvent(node: Node, event: KeyDown | KeyRepeat): boolean {
	const input = InputApi.at(node);
	if (event.text && event.text?.length > 0) {
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
