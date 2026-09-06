import { advanceFocus, retreatFocus } from './focus.ts';
import type { Host } from './host.ts';
import { addListener, type Dispatched } from './events.ts';
import type { KeyDownEvent, KeyRepeatEvent } from './keyboard.ts';

export function useFocusNavigation(host: Host): void {
	const navigate = (event: Dispatched<KeyDownEvent | KeyRepeatEvent>): void => {
		if (event.code === 'Tab') {
			advanceFocus(host.root);
		} else if (event.code === 'Backtab') {
			retreatFocus(host.root);
		}
	};

	addListener(host.element, 'keydown', navigate);
	addListener(host.element, 'keyrepeat', navigate);
}
