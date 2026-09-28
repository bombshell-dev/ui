import type { KeyDown } from '../keyboard.ts';
import { fit, rgba } from '../values.ts';
import { defineComponent, ComponentElement } from '../component.ts';
import type { Node } from '../core.ts';
import { emit } from '../emit.ts';
import { getFocus, setFocusable } from '../focus.ts';
import type { HostEvent } from '../events.ts';
import type { HostElement, PropertyChange } from '../elements.ts';

export interface ButtonEvent extends HostEvent<'press'> {}

declare module '@clack/ui/events' {
	interface HostEvents {
		press: ButtonEvent;
	}
}

export interface ButtonProps {
	label?: string;
	disabled?: boolean;
	onpress?: (event: ButtonEvent) => void;
}

declare module '@clack/ui/elements' {
	interface HostElements {
		button: ButtonProps;
	}
}

/** A focusable, keyboard-activated element composed from box and text. */
export class ButtonElement extends ComponentElement<ButtonProps> {
	private buttonBox: HostElement | undefined;
	private labelElement: HostElement | undefined;

	create(): void {
		this.buttonBox = this.element.createElement('box', {
			border: {
				color: this.props.disabled ? rgba(80, 80, 80) : rgba(100, 100, 100),
				top: 1,
				right: 1,
				bottom: 1,
				left: 1,
			},
			layout: {
				direction: 'ltr',
				height: fit(),
				padding: { top: 1, right: 2, bottom: 1, left: 2 },
			},
		});
		const children = [...this.element.children];
		if (children.length === 0) {
			this.labelElement = this.buttonBox.createElement('text');
			this.labelElement.textContent = this.labelText();
			this.labelElement.setProperty(
				'color',
				this.props.disabled ? rgba(100, 100, 100) : rgba(180, 180, 180),
			);
			this.buttonBox.append(this.labelElement);
		} else {
			this.buttonBox.append(children);
		}
		this.element.append(this.buttonBox);
	}

	propertyChanged({ name }: PropertyChange): void {
		if (name === 'label' && this.labelElement) {
			this.labelElement.textContent = this.labelText();
		}
		if (name === 'disabled' && this.node) {
			setFocusable(this.node, !this.props.disabled);
			if (getFocus(this.node) === this.node) {
				this.focusedCallback();
			} else {
				this.blurredCallback();
			}
		}
	}

	connectedCallback(node: Node): void {
		setFocusable(node, !this.props.disabled);
	}

	focusedCallback(): void {
		this.buttonBox?.setProperty('border', {
			color: rgba(255, 255, 255),
			top: 1,
			right: 1,
			bottom: 1,
			left: 1,
		});
		if (this.labelElement) {
			this.labelElement.setProperty('color', rgba(255, 255, 255));
		}
	}

	blurredCallback(): void {
		this.buttonBox?.setProperty('border', {
			color: this.props.disabled ? rgba(80, 80, 80) : rgba(100, 100, 100),
			top: 1,
			right: 1,
			bottom: 1,
			left: 1,
		});
		if (this.labelElement) {
			this.labelElement.setProperty(
				'color',
				this.props.disabled ? rgba(100, 100, 100) : rgba(180, 180, 180),
			);
		}
	}

	keydown(event: KeyDown): boolean {
		if (!this.props.disabled && (event.code === 'Enter' || event.code === 'Space')) {
			emit(this.node!, { type: 'press' });
			return true;
		}
		return false;
	}

	private labelText(): string {
		return String(this.props.label ?? '');
	}
}

export const Button = defineComponent('button', ButtonElement);
