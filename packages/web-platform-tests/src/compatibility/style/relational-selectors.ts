// Adapted from WPT user-action-pseudo-classes-in-has.html at b719612f963a05ece9c89a7dd7598c1c59618874.
// Copyright web-platform-tests contributors; Byungwoo Lee. BSD-3-Clause.
// See ../../../test/wpt/LICENSE and ../../../docs/wpt-state-styles.md.
import type { CompatibilityContext } from '../context.ts';
import { createStyleFixture } from '../style-fixture.ts';
export const spec = 'https://drafts.csswg.org/selectors-4/#relational';
export const wpt =
	'https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/css/selectors/invalidation/user-action-pseudo-classes-in-has.html';
export const requires = [
	'element.selectors',
	'parsing.fragments',
	'style.computed',
	'style.focusState',
] as const;
export const globals = ['getComputedStyle'] as const;
/** Registers relational matching and invalidation without geometry assertions. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('has focus invalidates an ancestor and a different descendant', (fixture) => {
		const { root, get } = createStyleFixture(fixture, {
			markup: '<section><button>Focus</button><i>Other</i></section>',
			css: 'section, i {color:rgb(1,2,3)} section:has(:focus) {color:rgb(4,5,6)} section:has(:focus) i {color:rgb(7,8,9)}',
		});
		const section = root.querySelector('section')!,
			button = root.querySelector('button')!,
			other = root.querySelector('i')!;
		expect(section.matches(':has(:focus)')).toBe(false);
		button.focus();
		expect(section.matches(':has(:focus)')).toBe(true);
		expect(get(section).color).toBe('rgb(4, 5, 6)');
		expect(get(other).color).toBe('rgb(7, 8, 9)');
		button.remove();
		expect(section.matches(':has(:focus)')).toBe(false);
		expect(get(other).color).toBe('rgb(1, 2, 3)');
	});
	context.test(
		'relative child and sibling selectors update after class changes and moves',
		(fixture) => {
			const { root, get } = createStyleFixture(fixture, {
				markup: '<section><i></i></section><b></b>',
				css: 'section {color:rgb(1,2,3)} section:has(> .marked) {color:rgb(4,5,6)} section:has(+ .marked) {color:rgb(7,8,9)}',
			});
			const section = root.querySelector('section')!,
				child = root.querySelector('i')!,
				sibling = root.querySelector('b')!;
			child.className = 'marked';
			expect(root.querySelector(':has(> .marked)')).toBe(section);
			expect(get(section).color).toBe('rgb(4, 5, 6)');
			child.className = '';
			expect(get(section).color).toBe('rgb(1, 2, 3)');
			sibling.className = 'marked';
			expect(section.matches(':has(+ .marked)')).toBe(true);
			expect(get(section).color).toBe('rgb(7, 8, 9)');
			root.prepend(sibling);
			expect(section.matches(':has(+ .marked)')).toBe(false);
			expect(get(section).color).toBe('rgb(1, 2, 3)');
		},
	);
	context.test(
		'relational queries return static snapshots while fresh queries reflect changes',
		(fixture) => {
			const { root } = createStyleFixture(fixture, {
				markup: '<section><i class="marked"></i></section><section></section>',
				css: '',
			});
			const sections = root.querySelectorAll('section');
			const selected = root.querySelectorAll('section:has(.marked)');
			sections[1]!.append(sections[0]!.firstChild!);
			expect(Array.from(selected)).toEqual([sections[0]]);
			expect(Array.from(root.querySelectorAll('section:has(.marked)'))).toEqual([sections[1]]);
		},
	);
	context.test(
		'nested has and empty relative selector lists reject with SyntaxError',
		(fixture) => {
			const { root } = createStyleFixture(fixture, { markup: '', css: '' });
			for (const selector of [':has(:has(i))', ':has()', ':has(>)']) {
				expect(() => root.querySelector(selector)).toThrow(
					expect.objectContaining({ name: 'SyntaxError' }),
				);
				expect(() => root.matches(selector)).toThrow(
					expect.objectContaining({ name: 'SyntaxError' }),
				);
			}
		},
	);
}
