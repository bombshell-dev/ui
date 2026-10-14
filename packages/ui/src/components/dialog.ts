import { defineComponent, ComponentElement, template, type CreateResult } from '../component.ts';
import type { HostEvent } from '../events.ts';
import type { HostElement, PropertyChange } from '../elements.ts';
import type { HTMLAttributes } from '../browser-types.ts';
import { rgba } from '../values.ts';
import { Button } from '../elements/button.ts';
import { Box } from '../primitives/box.ts';
import { Text } from '../primitives/text.ts';

export interface DialogEvent extends HostEvent<'confirm' | 'cancel'> {}

declare module '@clack/ui/events' {
	interface HostEvents {
		confirm: DialogEvent;
		cancel: DialogEvent;
	}
}

export interface DialogProps extends HTMLAttributes {
	title?: string;
	message?: string;
	confirmLabel?: string;
	cancelLabel?: string;
	onconfirm?: (event: DialogEvent) => void;
	oncancel?: (event: DialogEvent) => void;
}

declare module '@clack/ui/elements' {
	interface HostElements {
		dialog: DialogProps;
	}
}

/** A composed modal-style panel with title, content, and action buttons. */
export class DialogElement extends ComponentElement<DialogProps> {
	private titleElement!: HostElement;
	private messageElement!: HostElement;
	private bodyElement!: HostElement;
	private confirmButton!: HostElement;
	private cancelButton!: HostElement;

	override create(): CreateResult {
		const box = template(this.host, Box);
		const text = template(this.host, Text);
		const button = template(this.host, Button);
		this.titleElement = text({ color: rgba(255, 255, 255) }, this.props.title ?? '');
		this.messageElement = text({}, this.props.message ?? '');
		const body = box({ layout: { direction: 'ttb', gap: 1 } });
		this.bodyElement = body;
		this.confirmButton = button({
			label: this.props.confirmLabel ?? 'OK',
		});
		this.cancelButton = button({
			label: this.props.cancelLabel ?? 'Cancel',
		});
		const actions = box(
			{ layout: { direction: 'ltr', gap: 1 } },
			this.cancelButton,
			this.confirmButton,
		);
		const panel = box(
			{
				border: { color: rgba(255, 255, 255), top: 1, right: 1, bottom: 1, left: 1 },
				layout: {
					direction: 'ttb',
					padding: { right: 1, left: 1 },
				},
			},
			this.titleElement,
			this.messageElement,
			body,
			actions,
		);
		this.confirmButton.addEventListener('press', () => {
			this.emit({ type: 'confirm' });
		});
		this.cancelButton.addEventListener('press', () => {
			this.emit({ type: 'cancel' });
		});
		return { implementation: panel, contentContainer: this.bodyElement };
	}

	override propertyChanged({ name }: PropertyChange): void {
		switch (name) {
			case 'title':
				this.titleElement.textContent = this.props.title ?? '';
				break;
			case 'message':
				this.messageElement.textContent = this.props.message ?? '';
				break;
			case 'confirmLabel':
				this.confirmButton.setProperty('label', this.props.confirmLabel ?? 'OK');
				break;
			case 'cancelLabel':
				this.cancelButton.setProperty('label', this.props.cancelLabel ?? 'Cancel');
				break;
		}
	}
}

export const Dialog = defineComponent('dialog', {
	define: DialogElement,
	dependencies: [Box, Text, Button],
});
