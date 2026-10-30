// WPT focus-within-011.html and user-action-pseudo-classes-in-has.html adaptations.
// Revision b719612f963a05ece9c89a7dd7598c1c59618874; copyright WPT contributors,
// Ethan Lin, Mozilla, Byungwoo Lee. BSD-3-Clause; ../../../../test/wpt/LICENSE.txt.
import type { CompatibilityContext } from '../../context.ts';
import { createStyleFixture } from '../../style-fixture.ts';
export const spec = 'https://drafts.csswg.org/selectors-4/#focus-within-pseudo';
export const wpt =
	'https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/css/selectors/invalidation/user-action-pseudo-classes-in-has.html';
export const input = ['keyboard'] as const;
export const requires = ['input.keyboard.navigation', 'style.focusState'] as const;
export const globals = ['getComputedStyle'] as const;
/** Registers native navigation and CSS focus state interactions. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'Tab and Shift Tab move focus selectors and styles between subtrees',
		async (fixture) => {
			const { root, get } = createStyleFixture(fixture, {
				markup:
					'<section><button>First</button></section><section><button>Second</button></section>',
				css: 'section {color:rgb(1,2,3)} section:focus-within {color:rgb(4,5,6)} button:focus {color:rgb(7,8,9)}',
			});
			const [first, second] = Array.from(root.querySelectorAll('button'));
			const [parent, other] = Array.from(root.querySelectorAll('section'));
			first!.focus();
			await fixture.input.press('Tab');
			expect(first!.matches(':focus')).toBe(false);
			expect(second!.matches(':focus')).toBe(true);
			expect(get(parent!).color).toBe('rgb(1, 2, 3)');
			expect(get(other!).color).toBe('rgb(4, 5, 6)');
			expect(get(second!).color).toBe('rgb(7, 8, 9)');
			await fixture.input.keyDown('Shift');
			await fixture.input.press('Tab');
			await fixture.input.keyUp('Shift');
			expect(first!.matches(':focus')).toBe(true);
			expect(get(parent!).color).toBe('rgb(4, 5, 6)');
			expect(get(other!).color).toBe('rgb(1, 2, 3)');
		},
	);
	context.test('canceling Tab retains focus selectors and styles', async (fixture) => {
		const { root, get } = createStyleFixture(fixture, {
			markup: '<button>First</button><button>Second</button>',
			css: 'button {color:rgb(1,2,3)} button:focus {color:rgb(4,5,6)}',
		});
		const [first, second] = Array.from(root.querySelectorAll('button'));
		first!.focus();
		first!.addEventListener('keydown', (event) => event.preventDefault());
		await fixture.input.press('Tab');
		expect(first!.matches(':focus')).toBe(true);
		expect(second!.matches(':focus')).toBe(false);
		expect(get(first!).color).toBe('rgb(4, 5, 6)');
		expect(get(second!).color).toBe('rgb(1, 2, 3)');
	});
	context.test(
		'Tab skips inert descendants and never gives their ancestors focus-within',
		async (fixture) => {
			const { root, get } = createStyleFixture(fixture, {
				markup:
					'<button id="first">First</button><section inert><button>Blocked</button></section><button id="last">Last</button>',
				css: 'section {color:rgb(1,2,3)} section:focus-within {color:rgb(4,5,6)}',
			});
			root.querySelector<HTMLButtonElement>('#first')!.focus();
			await fixture.input.press('Tab');
			expect(root.querySelector('#last')!.matches(':focus')).toBe(true);
			expect(root.querySelector('section')!.matches(':focus-within')).toBe(false);
			expect(get(root.querySelector('section')!).color).toBe('rgb(1, 2, 3)');
		},
		['focus.inert'],
	);
}
