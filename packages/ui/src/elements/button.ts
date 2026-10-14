import type { KeyDown } from '../keyboard.ts';
import { fit, rgba } from '../values.ts';
import { defineElement, ComponentElement, template, type CreateResult } from '../component.ts';
import { Focusable } from '../parts/focusable.ts';
import type { HostEvent } from '../events.ts';
import type { HostElement, PropertyChange } from '../elements.ts';
import type { HTMLAttributes } from '../browser-types.ts';
import { Box } from '../primitives/box.ts';
import { Text } from '../primitives/text.ts';

export interface ButtonEvent extends HostEvent<'press'> {}

declare module '@clack/ui/events' {
	interface HostEvents {
		press: ButtonEvent;
	}
}

export interface ButtonProps extends HTMLAttributes {
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
export class ButtonElement extends Focusable(ComponentElement<ButtonProps>) {
	private buttonBox: HostElement | undefined;
	private labelElement: HostElement | undefined;

	override get focusable(): boolean {
		return !this.props.disabled;
	}

	override create(): CreateResult {
		const box = template(this.host, Box);
		const text = template(this.host, Text);
		const buttonBoxProps = {
			border: {
				color: this.props.disabled ? rgba(80, 80, 80) : rgba(100, 100, 100),
				top: 1,
				right: 1,
				bottom: 1,
				left: 1,
			},
			layout: {
				direction: 'ltr' as const,
				height: fit(3),
				padding: { right: 1, left: 1 },
			},
		};
		const children = [...this.element.childNodes];
		let buttonBox: HostElement;
		if (children.length === 0) {
			this.labelElement = text(
				{ color: this.props.disabled ? rgba(100, 100, 100) : rgba(180, 180, 180) },
				this.labelText(),
			);
			buttonBox = box(buttonBoxProps, this.labelElement);
		} else {
			buttonBox = box(buttonBoxProps);
		}
		this.buttonBox = buttonBox;
		this.element.addEventListener('click', (event) => {
			if (!this.props.disabled && !event.defaultPrevented) {
				this.emit({ type: 'press' });
			}
		});
		return { implementation: buttonBox, contentContainer: buttonBox };
	}

	override propertyChanged(change: PropertyChange): void {
		super.propertyChanged(change);
		const { name } = change;
		if (name === 'label' && this.labelElement) {
			this.labelElement.textContent = this.labelText();
		}
		if (name === 'disabled') {
			this.updateAppearance(this.focused);
		}
	}

	override focusChangedCallback(focused: boolean): void {
		this.updateAppearance(focused);
	}

	private updateAppearance(focused: boolean): void {
		this.buttonBox?.setProperty('border', {
			color: focused
				? rgba(255, 255, 255)
				: this.props.disabled
					? rgba(80, 80, 80)
					: rgba(100, 100, 100),
			top: 1,
			right: 1,
			bottom: 1,
			left: 1,
		});
		if (this.labelElement) {
			this.labelElement.setProperty(
				'color',
				focused
					? rgba(255, 255, 255)
					: this.props.disabled
						? rgba(100, 100, 100)
						: rgba(180, 180, 180),
			);
		}
	}

	override keydown(event: KeyDown): boolean {
		if (!this.props.disabled && (event.code === 'Enter' || event.code === ' ')) {
			this.emit({ type: 'click' });
			return true;
		}
		return false;
	}

	private labelText(): string {
		return String(this.props.label ?? '');
	}
}

export const Button = defineElement('button', {
	define: ButtonElement,
	dependencies: [Box, Text],
});
