import { FocusApi } from './focus.ts';
import type { Host } from './host.ts';
import { KeyboardApi } from './keyboard.ts';

export function useFocusNavigation(host: Host): void {
	KeyboardApi.decorate(host.root, () => ({
		keydown(event) {
			const { node } = this;
			if (event.code === 'Tab') {
				FocusApi.at(node).advanceFocus();
			} else if (event.code === 'Backtab') {
				FocusApi.at(node).retreatFocus();
			} else {
				return super.keydown(event);
			}
		},
		keyrepeat(event) {
			const { node } = this;
			if (event.code === 'Tab') {
				FocusApi.at(node).advanceFocus();
			} else if (event.code === 'Backtab') {
				FocusApi.at(node).retreatFocus();
			} else {
				super.keyrepeat(event);
			}
		},
	}));
}
