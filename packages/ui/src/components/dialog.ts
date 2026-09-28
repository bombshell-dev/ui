import { defineComponent, ComponentElement } from '../component.ts';
import type { HostEvent } from '../events.ts';
import { emit } from '../emit.ts';
import type { HostElement, PropertyChange } from '../elements.ts';
import { rgba } from '../values.ts';

export interface DialogEvent extends HostEvent<'confirm' | 'cancel'> {}

declare module '@clack/ui/events' {
	interface HostEvents {
		confirm: DialogEvent;
		cancel: DialogEvent;
	}
}

export interface DialogProps {
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
	private confirmButton!: HostElement;
	private cancelButton!: HostElement;

	create(): void {
		const panel = this.element.createElement('box', {
			border: { color: rgba(255, 255, 255), top: 1, right: 1, bottom: 1, left: 1 },
			layout: {
				direction: 'ttb',
				padding: { top: 1, right: 2, bottom: 1, left: 2 },
			},
		});
		this.titleElement = panel.createElement('text', { color: rgba(255, 255, 255) });
		this.messageElement = panel.createElement('text');
		const body = panel.createElement('box', { layout: { direction: 'ttb', gap: 1 } });
		const content = [...this.element.children];
		this.confirmButton = panel.createElement('button', {
			label: this.props.confirmLabel ?? 'OK',
		});
		this.cancelButton = panel.createElement('button', {
			label: this.props.cancelLabel ?? 'Cancel',
		});
		const actions = panel.createElement('box', { layout: { direction: 'ltr', gap: 1 } });

		body.append(content);
		actions.append(this.cancelButton, this.confirmButton);
		panel.append(this.titleElement, this.messageElement, body, actions);
		this.element.replaceChildren(panel);

		this.confirmButton.addEventListener('press', () => {
			emit(this.node!, { type: 'confirm' });
		});
		this.cancelButton.addEventListener('press', () => {
			emit(this.node!, { type: 'cancel' });
		});
		this.titleElement.textContent = this.props.title ?? '';
		this.messageElement.textContent = this.props.message ?? '';
	}

	propertyChanged({ name }: PropertyChange): void {
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

export const Dialog = defineComponent('dialog', DialogElement);
