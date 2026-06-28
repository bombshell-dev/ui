import {
	alternateBuffer,
	cursor,
	mouseTracking,
	progressiveInput,
	type Setting,
	settings,
} from '@bomb.sh/tty';

/** Input categories the loop enables and surfaces. */
export type InputCategory = 'key' | 'mouse';

/** Kitty progressive-keyboard enhancement bit flags. */
const Keyboard = {
	disambiguate: 1,
	reportEventTypes: 2,
} as const;

/**
 * Map declarative options to a single tty {@link Setting}. `apply` is written when the
 * loop starts; `revert` (auto-reversed by `settings`) on teardown.
 */
export function resolveSettings(opts: {
	mode: 'fullscreen' | 'inline';
	events: InputCategory[];
}): Setting {
	const parts: Setting[] = [];
	if (opts.mode === 'fullscreen') parts.push(alternateBuffer());
	parts.push(cursor(opts.mode === 'inline'));
	if (opts.events.includes('mouse')) parts.push(mouseTracking());
	if (opts.events.includes('key')) {
		parts.push(progressiveInput(Keyboard.disambiguate | Keyboard.reportEventTypes));
	}
	return settings(...parts);
}
