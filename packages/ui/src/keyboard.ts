import type { KeyDown, KeyEvent, KeyRepeat, KeyUp } from '@bomb.sh/tty';
import type { Host } from './host.ts';
import { getElement } from './elements.ts';
import { getFocus } from './focus.ts';
import { dispatch, type HostEvent } from './events.ts';

export interface KeyDownEvent extends HostEvent<'keydown'>, KeyDown {}
export interface KeyUpEvent extends HostEvent<'keyup'>, KeyUp {}
export interface KeyRepeatEvent extends HostEvent<'keyrepeat'>, KeyRepeat {}

declare module '@clack/ui/events' {
	interface HostEvents {
		keydown: KeyDownEvent;
		keyup: KeyUpEvent;
		keyrepeat: KeyRepeatEvent;
	}
}

/**
 * Send a raw terminal key event to the focused element, from where it bubbles.
 * Returns false for anything that is not a key event.
 */
export function routeKeyEvent(host: Host, event: unknown): boolean {
	if (isKeyEvent(event)) {
		const target = getElement(getFocus(host.root));
		dispatch(target, { ...event, target }, { bubbles: true });
		return true;
	} else {
		return false;
	}
}

function isKeyEvent(value: unknown): value is KeyEvent {
	const x = value as KeyEvent;

	return (
		!!x &&
		typeof x.key === 'string' &&
		typeof x.code === 'string' &&
		['keyup', 'keydown', 'keyrepeat'].includes(x.type)
	);
}
