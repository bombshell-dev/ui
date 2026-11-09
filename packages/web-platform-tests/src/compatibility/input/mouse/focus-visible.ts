// Adapted from WPT focus-visible-002.html and focus-visible-003.html at
// b719612f963a05ece9c89a7dd7598c1c59618874. Copyright WPT contributors; Alice Boxhall.
// BSD-3-Clause; ../../../../test/wpt/LICENSE and ../../../../docs/wpt-state-styles.md.
import type { CompatibilityContext } from '../../context.ts';
import type { DOMElement } from '../../contracts/nodes.ts';
import { createStyleFixture } from '../../style-fixture.ts';
export const spec = 'https://drafts.csswg.org/selectors-4/#the-focus-visible-pseudo';
export const wpt =
	'https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/css/selectors/focus-visible-002.html';
export const input = ['mouse'] as const;
export const requires = ['input.mouse.delivery', 'style.focusState'] as const;
export const globals = ['getComputedStyle'] as const;
/** Registers the explicit text-entry versus non-text mouse focus indication policy. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	for (const markup of [
		'<input>',
		'<input type="email">',
		'<input type="password">',
		'<textarea></textarea>',
	]) {
		context.test(`mouse focus on ${markup} matches focus-visible and styles`, async (fixture) => {
			const { document, root, get } = createStyleFixture(fixture, {
				markup: markup,
				css: ':focus-visible {color:rgb(4,5,6)}',
			});
			const target = root.firstElementChild as HTMLElement;
			await fixture.input.click(target as unknown as DOMElement);
			expect(document.activeElement).toBe(target);
			expect(target.matches(':focus-visible')).toBe(true);
			expect(get(target).color).toBe('rgb(4, 5, 6)');
			target.blur();
			expect(target.matches(':focus-visible')).toBe(false);
		});
	}
	for (const markup of [
		'<button>Button</button>',
		'<span tabindex="0">Span</span>',
		'<input type="checkbox">',
	]) {
		context.test(
			`mouse focus on ${markup} matches focus without focus-visible`,
			async (fixture) => {
				const { document, root, get } = createStyleFixture(fixture, {
					markup: markup,
					css: ':focus {color:rgb(1,2,3)} :focus-visible {color:rgb(4,5,6)}',
				});
				const target = root.firstElementChild as HTMLElement;
				await fixture.input.click(target as unknown as DOMElement);
				expect(document.activeElement).toBe(target);
				expect(target.matches(':focus')).toBe(true);
				expect(target.matches(':focus-visible')).toBe(false);
				expect(get(target).color).toBe('rgb(1, 2, 3)');
			},
			['input.mouse.focus'],
		);
	}
}
