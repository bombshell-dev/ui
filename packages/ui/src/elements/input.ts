import { fit, percent, rgba, type KeyDown, type KeyRepeat } from '@bomb.sh/tty';
import type { HostEvent } from '@clack/ui/events';
import type { HostElement, PropertyChange } from '../elements.ts';
import type { HTMLAttributes } from '../browser-types.ts';
import { ComponentElement, defineElement, template } from '../component.ts';
import { Box, type BoxProps } from '../primitives/box.ts';
import { Text } from '../primitives/text.ts';
import { TextEditor } from '../parts/text-editor.ts';
import { Focusable } from '../parts/focusable.ts';

export interface InputEvent extends HostEvent<'input'> {
	value: string;
}

declare module '@clack/ui/events' {
	interface HostEvents {
		input: InputEvent;
	}
}

export interface InputProps extends HTMLAttributes {
	disabled?: boolean;
	hidden?: boolean;
	value?: string;
	defaultValue?: string;
	layout?: BoxProps['layout'];
	oninput?: (event: InputEvent) => void;
}

declare module '@clack/ui/elements' {
	interface HostElements {
		input: InputProps;
	}
}

/** A single-line input composed from the built-in box and text primitives. */
export class InputElement extends Focusable(ComponentElement<InputProps>) {
	readonly editor: TextEditor;
	private inputBox?: HostElement;
	private inputText?: HostElement;
	private hasValueProp: boolean;
	private replacingValue = false;

	constructor(element: HostElement) {
		super(element);
		this.hasValueProp = element.properties.value != null;
		this.editor = new TextEditor({
			content: String(element.properties.value ?? element.properties.defaultValue ?? ''),
			onChange: (editor) => {
				this.updateText();
				if (this.node && !this.replacingValue) {
					this.emit({ type: 'input', value: editor.content });
				}
			},
		});
		Object.defineProperties(element.properties, {
			value: {
				get: () => this.editor.content,
				set: (value: unknown) => {
					this.hasValueProp = value != null;
					this.replaceValue(value ?? this.props.defaultValue ?? '');
				},
			},
			caret: { get: () => this.editor.caret },
		});
	}

	override get focusable(): boolean {
		return !this.props.disabled && !this.isHiddenInput();
	}

	override propertyChanged(change: PropertyChange): void {
		super.propertyChanged(change);
		const { name, value } = change;
		if (name === 'defaultValue' && !this.hasValueProp) this.replaceValue(value ?? '');
	}

	override create(): HostElement {
		if (!this.hasValueProp) this.replaceValue(this.props.defaultValue ?? '');
		const box = template(this.host, Box);
		if (this.isHiddenInput()) {
			this.inputBox = box({ layout: { height: fit(0), width: fit(0) } });
			return this.inputBox;
		}
		const text = template(this.host, Text);
		this.inputText = text({}, this.editor.content || ' ');
		this.inputBox = box(
			{
				border: { color: rgba(100, 100, 100), top: 1, right: 1, bottom: 1, left: 1 },
				layout: {
					height: fit(3),
					width: percent(0.3),
					padding: { top: 1, right: 1, bottom: 1, left: 1 },
					...this.props.layout,
				},
			},
			this.inputText,
		);
		return this.inputBox;
	}

	override focusChangedCallback(focused: boolean): void {
		this.inputBox?.setProperty('border', {
			color: focused ? rgba(255, 255, 255) : rgba(100, 100, 100),
			top: 1,
			right: 1,
			bottom: 1,
			left: 1,
		});
	}
	override keydown(event: KeyDown): boolean {
		return this.handleKey(event);
	}
	override keyrepeat(event: KeyRepeat): boolean {
		return this.handleKey(event);
	}

	private handleKey(event: KeyDown | KeyRepeat): boolean {
		if (!this.node || this.props.disabled || this.isHiddenInput()) return false;
		return this.editor.handleKey(event);
	}

	private replaceValue(value: unknown): void {
		const previous = this.editor.content;
		this.replacingValue = true;
		try {
			this.editor.content = String(value);
			if (this.editor.content !== previous) this.editor.moveMax();
		} finally {
			this.replacingValue = false;
		}
	}
	private updateText(): void {
		if (this.inputText) this.inputText.textContent = this.editor.content || ' ';
	}
	private isHiddenInput(): boolean {
		return (
			Boolean(this.props.hidden) ||
			this.props['aria-hidden'] === true ||
			this.props.style?.clipPath !== undefined
		);
	}
}

export const Input = defineElement('input', {
	define: InputElement,
	dependencies: [Box, Text],
});
