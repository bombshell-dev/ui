// Adapted from WPT focus-within-011.html, revision b719612f963a05ece9c89a7dd7598c1c59618874.
// Copyright web-platform-tests contributors; Ethan Lin and Mozilla. BSD-3-Clause.
// See ../../../test/wpt/LICENSE and ../../../docs/wpt-state-styles.md.
import type { CompatibilityContext } from '../context.ts';
import { createStyleFixture } from '../style-fixture.ts';

export const spec = 'https://drafts.csswg.org/selectors-4/#focus-within-pseudo';
export const wpt =
	'https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/css/selectors/focus-within-011.html';
export const requires = [
	'element.selectors',
	'parsing.fragments',
	'style.computed',
	'focus.transitions',
] as const;
export const globals = ['getComputedStyle'] as const;

/** Registers selector matching and style invalidation across focus transitions. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	const markup =
		'<section><button id="first">First</button><button id="second">Second</button></section><button id="outside">Outside</button>';
	const css =
		'section, button {color:rgb(1,2,3)} section:focus-within {color:rgb(4,5,6)} button:focus {color:rgb(7,8,9)}';
	context.test(
		'focus matches the target while focus-within includes its ancestors and itself',
		(fixture) => {
			const { document, root, get } = createStyleFixture(fixture, { markup: markup, css: css });
			const target = root.querySelector<HTMLButtonElement>('#first')!;
			const parent = root.querySelector('section')!;
			expect(target.matches(':focus')).toBe(false);
			expect(parent.matches(':focus-within')).toBe(false);
			const retained = get(target);
			expect(retained.color).toBe('rgb(1, 2, 3)');
			target.focus();
			expect(document.activeElement).toBe(target);
			expect(document.querySelector(':focus')).toBe(target);
			expect(target.matches(':focus:focus-within')).toBe(true);
			expect(parent.matches(':focus')).toBe(false);
			expect(parent.matches(':focus-within')).toBe(true);
			expect(retained.color).toBe('rgb(7, 8, 9)');
			expect(get(parent).color).toBe('rgb(4, 5, 6)');
		},
	);
	context.test(
		'moving focus between siblings invalidates both targets and retains ancestor state',
		(fixture) => {
			const { root, get } = createStyleFixture(fixture, { markup: markup, css: css });
			const first = root.querySelector<HTMLButtonElement>('#first')!;
			const second = root.querySelector<HTMLButtonElement>('#second')!;
			const parent = root.querySelector('section')!;
			first.focus();
			second.focus();
			expect(first.matches(':focus-within')).toBe(false);
			expect(get(first).color).toBe('rgb(1, 2, 3)');
			expect(second.matches(':focus')).toBe(true);
			expect(get(second).color).toBe('rgb(7, 8, 9)');
			expect(get(parent).color).toBe('rgb(4, 5, 6)');
			root.querySelector<HTMLButtonElement>('#outside')!.focus();
			expect(parent.matches(':focus-within')).toBe(false);
			expect(get(parent).color).toBe('rgb(1, 2, 3)');
		},
	);
	context.test(
		'blur clears matching and retained computed styles without changing attributes',
		(fixture) => {
			const { root, get } = createStyleFixture(fixture, { markup: markup, css: css });
			const target = root.querySelector<HTMLButtonElement>('#first')!;
			const original = target.outerHTML;
			target.focus();
			const computed = get(target);
			target.blur();
			expect(target.matches(':focus, :focus-within')).toBe(false);
			expect(computed.color).toBe('rgb(1, 2, 3)');
			expect(target.outerHTML).toBe(original);
		},
		['parsing.serialization'],
	);
	context.test(
		'focus listeners observe the new matching state and computed declaration',
		(fixture) => {
			const { root, get } = createStyleFixture(fixture, { markup: markup, css: css });
			const target = root.querySelector<HTMLButtonElement>('#first')!;
			const seen: unknown[] = [];
			target.addEventListener('focus', () =>
				seen.push(target.matches(':focus'), get(target).color),
			);
			target.focus();
			expect(seen).toEqual([true, 'rgb(7, 8, 9)']);
		},
	);
	context.test(
		'removing a focused descendant clears ancestor selector and computed state',
		(fixture) => {
			const { root, get } = createStyleFixture(fixture, { markup: markup, css: css });
			const target = root.querySelector<HTMLButtonElement>('#first')!;
			const parent = root.querySelector('section')!;
			target.focus();
			target.remove();
			expect(target.matches(':focus')).toBe(false);
			expect(parent.matches(':focus-within')).toBe(false);
			expect(get(parent).color).toBe('rgb(1, 2, 3)');
		},
	);
	for (const mode of ['open', 'closed'] as const) {
		context.test(
			`focus matching crosses a ${mode} shadow host without exposing internal queries`,
			(fixture) => {
				const { document, root, get } = createStyleFixture(fixture, {
					markup: '<section id="host"></section>',
					css: '#host {color:rgb(1,2,3)} #host:focus {color:rgb(4,5,6)}',
				});
				const host = root.querySelector<HTMLElement>('#host')!;
				const shadow = host.attachShadow({ mode });
				const target = document.createElement('input');
				shadow.append(target);
				target.focus();
				expect(target.matches(':focus:focus-within')).toBe(true);
				expect(host.matches(':focus:focus-within')).toBe(true);
				expect(root.matches(':focus-within')).toBe(true);
				expect(document.querySelector(':focus')).toBe(host);
				expect(shadow.querySelector(':focus')).toBe(target);
				expect(get(host).color).toBe('rgb(4, 5, 6)');
				target.blur();
				expect(host.matches(':focus, :focus-within')).toBe(false);
				expect(get(host).color).toBe('rgb(1, 2, 3)');
			},
			['shadow.focus.retargeting'],
		);
	}
}
