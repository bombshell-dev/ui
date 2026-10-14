import {
	defineComponent,
	fit,
	Focusable,
	percent,
	rgba,
	type HostElement,
	type InputEvent,
	type InputProps,
	type KeyDown,
	type KeyRepeat,
} from '@clack/ui';
import { ClassBox } from './box.ts';
import { ClackElement, reflects } from './base.ts';
import { ClassText } from './text.ts';

declare module '@clack/ui/elements' {
	interface HostElements {
		'class-input': ClassInputProps;
	}
}

interface ClassInputProps extends InputProps {
	value?: string;
}

class InputElement extends Focusable(ClackElement<ClassInputProps>) {
	static override attributes = {
		value: reflects('value'),
	};

	private inputBox: HostElement | undefined;
	private inputText: HostElement | undefined;
	private _value = '';
	caret = 0;

	override get focusable(): boolean {
		return (
			!this.props.disabled &&
			!this.props.hidden &&
			this.props['aria-hidden'] !== true &&
			this.props.style?.clipPath === undefined
		);
	}

	override focusChangedCallback(): void {
		this.update();
	}

	get value(): string {
		return this._value;
	}

	set value(value: string | undefined) {
		this._value = (value ?? '').replace(/[\r\n]/g, '');
		this.caret = Math.min(this.caret, [...this._value].length);
	}

	protected override render(): void {
		this.inputBox = this.element.createElement('class-box', {
			border: {
				color: this.focused ? rgba(255, 255, 255) : rgba(100, 100, 100),
				top: 1,
				right: 1,
				bottom: 1,
				left: 1,
			},
			layout: {
				height: fit(3),
				width: percent(0.3),
				padding: { right: 1, left: 1 },
			},
		});
		this.inputText = this.inputBox.createElement(
			'class-text',
			{
				color: this.focused ? rgba(255, 255, 255) : rgba(180, 180, 180),
				caret: this.focused ? this.caret : undefined,
			},
			this.value || ' ',
		);
		this.inputBox.append(this.inputText);
		this.element.append(this.inputBox);
	}

	protected override update(): void {
		this.inputBox?.setProperty('border', {
			color: this.focused ? rgba(255, 255, 255) : rgba(100, 100, 100),
			top: 1,
			right: 1,
			bottom: 1,
			left: 1,
		});
		this.inputText?.setProperty('color', this.focused ? rgba(255, 255, 255) : rgba(180, 180, 180));
		this.inputText?.setProperty('caret', this.focused ? this.caret : undefined);
		if (this.inputText) this.inputText.textContent = this.value || ' ';
	}

	override keydown(event: KeyDown): boolean {
		return this.edit(event);
	}

	override keyrepeat(event: KeyRepeat): boolean {
		return this.edit(event);
	}

	private edit(event: KeyDown | KeyRepeat): boolean {
		if (!this.node || !this.focusable) return false;
		const previous = this.value;
		const codepoints = [...this.value];
		const caret = this.caret;
		if (event.text) {
			const inserted = [...event.text.replace(/[\r\n]/g, '')];
			codepoints.splice(caret, 0, ...inserted);
			this.value = codepoints.join('');
			this.caret = caret + inserted.length;
		} else if (event.code === 'Backspace' && caret > 0) {
			codepoints.splice(caret - 1, 1);
			this.value = codepoints.join('');
			this.caret = caret - 1;
		} else if (event.code === 'Delete' && caret < codepoints.length) {
			codepoints.splice(caret, 1);
			this.value = codepoints.join('');
		} else if (event.code === 'ArrowLeft') {
			this.caret = Math.max(0, caret - 1);
		} else if (event.code === 'ArrowRight') {
			this.caret = Math.min(codepoints.length, caret + 1);
		} else if (event.code === 'Home') {
			this.caret = 0;
		} else if (event.code === 'End') {
			this.caret = codepoints.length;
		} else {
			return false;
		}

		this.update();
		if (previous !== this.value) {
			this.emit({ type: 'input', value: this.value } satisfies Omit<InputEvent, 'target'>);
		}
		return true;
	}
}

export const ClassInput = defineComponent('class-input', {
	define: InputElement,
	dependencies: [ClassBox, ClassText],
});
