// oxlint-disable no-unused-vars
import { createApi, type Node } from './core.ts';
import { getElement, type HostElement } from './elements.ts';
import type { AnyHostEvent, HostEvent, HostEvents } from './events.ts';

export const EmitApi = createApi('emit', {
	emit(node, event: AnyHostEvent): EmitResult {
		if (event.target !== getElement(node)) {
			throw new InvalidEventTargetError(node, event.target);
		}
		return { handled: false, stopped: false };
	},
});

export function emit<E extends Omit<AnyHostEvent, 'target'>>(
	node: Node,
	data: E,
): EmitResult {
	const event = {
		...data,
		target: getElement(node),
		currentTarget: undefined,
		bubbles: data.bubbles ?? true,
		cancelBubble: false,
	} as AnyHostEvent;
	event.stopPropagation = () => {
		event.cancelBubble = true;
	};
	return EmitApi.methods.emit(node, event);
}

export interface EmitResult {
	handled: boolean;
	stopped: boolean;
}

class InvalidEventTargetError extends TypeError {
	readonly code = 'CLACK_UI_INVALID_EVENT_TARGET';
	readonly node: Node;
	readonly target: HostElement;

	constructor(node: Node, target: HostElement) {
		super('event target does not match emitting node');
		this.name = 'InvalidEventTargetError';
		this.node = node;
		this.target = target;
	}
}
