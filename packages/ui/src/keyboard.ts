// oxlint-disable no-unused-vars
import type {
	KeyDown as TtyKeyDown,
	KeyEvent as TtyKeyEvent,
	KeyRepeat as TtyKeyRepeat,
	KeyUp as TtyKeyUp,
} from '@bomb.sh/tty';
import { createApi } from './core.ts';
import { getElement } from './elements.ts';
import type { Host } from './host.ts';
import { DispatchApi } from './dispatch.ts';
import { getFocus } from './focus.ts';

export type KeyDown = TtyKeyDown;
export type KeyEvent = TtyKeyEvent;
export type KeyRepeat = TtyKeyRepeat;
export type KeyUp = TtyKeyUp;

export function installKeyboard(host: Host): void {
	DispatchApi.around(host.root, {
		dispatch([node, event], next) {
			if (isKeyEvent(event)) {
				const focus = getFocus(node);
				const element = getElement(focus);
				let handled =
					event.type === 'keydown'
						? element.keydown?.(event)
						: event.type === 'keyrepeat'
							? element.keyrepeat?.(event)
							: false;
				if (!handled) {
					handled =
						KeyboardApi.invoke(event.type, [focus, event as KeyDown & KeyUp & KeyRepeat]) === true;
				}
				return { ok: true, handled };
			} else {
				return next(node, event);
			}
		},
	});
}

export const KeyboardApi = createApi('keyboard', {
	keydown(_node, _event: KeyDown): boolean | void {
		return false;
	},
	keyup(_node, _event: KeyUp): boolean | void {
		return false;
	},
	keyrepeat(_node, _event: KeyRepeat): boolean | void {
		return false;
	},
});

function isKeyEvent(value: unknown): value is KeyEvent {
	const x = value as KeyEvent;

	return (
		!!x &&
		typeof x.key === 'string' &&
		typeof x.code === 'string' &&
		['keyup', 'keydown', 'keyrepeat'].includes(x.type)
	);
}
