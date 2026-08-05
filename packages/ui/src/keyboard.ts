// oxlint-disable no-unused-vars
import type { KeyDown, KeyEvent, KeyRepeat, KeyUp } from '@bomb.sh/tty';
import { DispatchApi } from './dispatch.ts';
import { FocusApi } from './focus.ts';
import { Api } from './core/api.ts';
import type { Node } from './core/node.ts';

export class KeyboardApi extends Api {
	constructor(node: Node) {
		super(node);

		// re-dispatch key events to the current focus
		DispatchApi.decorate(node, () => ({
			dispatch(event) {
				if (isKeyEvent(event)) {
					const focus = FocusApi.at(this.node).getFocus();
					const api = KeyboardApi.at(focus);

					api[event.type](event as KeyDown & KeyUp & KeyRepeat);

					return { ok: true };
				} else {
					return super.dispatch(event);
				}
			},
		}));
	}

	keydown(_event: KeyDown): void {}
	keyup(_event: KeyUp): void {}
	keyrepeat(_event: KeyRepeat): void {}
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
