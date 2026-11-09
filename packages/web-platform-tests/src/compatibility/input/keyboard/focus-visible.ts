// Adapted from WPT focus-visible-001.html at b719612f963a05ece9c89a7dd7598c1c59618874.
// Copyright web-platform-tests contributors; Rob Dodson. BSD-3-Clause.
// See ../../../../test/wpt/LICENSE and ../../../../docs/wpt-state-styles.md.
import type { CompatibilityContext } from '../../context.ts';
import { createStyleFixture } from '../../style-fixture.ts';
export const spec = 'https://drafts.csswg.org/selectors-4/#the-focus-visible-pseudo';
export const wpt =
	'https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/css/selectors/focus-visible-001.html';
export const input = ['keyboard'] as const;
export const requires = ['input.keyboard.navigation', 'style.focusState'] as const;
export const globals = ['getComputedStyle'] as const;
/** Registers the explicit keyboard-focus-visible policy independently of event trust. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	for (const markup of [
		'<button>Target</button>',
		'<span tabindex="0">Target</span>',
		'<input type="checkbox">',
	]) {
		context.test(
			`Tab makes ${markup} focus-visible and clears matching after blur`,
			async (fixture) => {
				const { document, root, get } = createStyleFixture(fixture, {
					markup: `<button id="start">Start</button>${markup}`,
					css: ':focus-visible {color:rgb(4,5,6)}',
				});
				const first = root.firstElementChild as HTMLElement,
					target = root.lastElementChild as HTMLElement;
				first.focus();
				await fixture.input.press('Tab');
				expect(document.activeElement).toBe(target);
				expect(target.matches(':focus-visible')).toBe(true);
				expect(Array.from(root.querySelectorAll(':focus-visible'))).toEqual([target]);
				expect(get(target).color).toBe('rgb(4, 5, 6)');
				target.blur();
				expect(target.matches(':focus-visible')).toBe(false);
			},
		);
	}
}
