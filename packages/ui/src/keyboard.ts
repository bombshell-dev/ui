import type { KeyDown, KeyEvent, KeyRepeat, KeyUp } from '@bomb.sh/tty';
import type { Host } from './host.ts';
import { DispatchApi } from './dispatch.ts';
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

export function useKeyboard(host: Host): void {
	DispatchApi.around(host.root, {
		dispatch([node, event], next) {
			if (isKeyEvent(event)) {
				const target = getElement(getFocus(node));
				dispatch(target, { ...event, target }, { bubbles: true });
				return { ok: true };
			} else {
				return next(node, event);
			}
		},
	});
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
