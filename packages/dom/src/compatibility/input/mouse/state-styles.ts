// Adapted from WPT user-action-pseudo-classes-in-has.html at b719612f963a05ece9c89a7dd7598c1c59618874.
// Copyright web-platform-tests contributors; Byungwoo Lee. BSD-3-Clause.
// See ../../../../test/wpt/LICENSE.txt and ../../../../docs/wpt-state-styles.md.
import type { CompatibilityContext } from '../../context.ts';
import type { DOMElement } from '../../contracts/nodes.ts';
import { createStyleFixture } from '../../style-fixture.ts';
export const spec = 'https://drafts.csswg.org/selectors-4/#useraction-pseudos';
export const wpt =
	'https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/css/selectors/invalidation/user-action-pseudo-classes-in-has.html';
export const input = ['mouse'] as const;
export const requires = [
	'input.mouse.delivery',
	'input.mouse.hover',
	'element.selectors',
	'parsing.fragments',
	'style.computed',
] as const;
export const globals = ['getComputedStyle'] as const;
/** Registers pointer state and CSS interactions through the host input pipeline. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'hover follows pointer movement and updates both targets and ancestors',
		async (fixture) => {
			const { root, get } = createStyleFixture(fixture, {
				markup: '<section><button>First</button></section><button id="outside">Outside</button>',
				css: 'section, button {color:rgb(1,2,3)} section:hover {color:rgb(4,5,6)} button:hover {color:rgb(7,8,9)}',
			});
			const first = root.querySelector('button')!,
				outside = root.querySelector('#outside')!,
				section = root.querySelector('section')!;
			await fixture.input.move(first as unknown as DOMElement);
			expect(first.matches(':hover'), 'target hover after move').toBe(true);
			expect(section.matches(':hover'), 'ancestor hover after move').toBe(true);
			expect(get(first).color).toBe('rgb(7, 8, 9)');
			expect(get(section).color).toBe('rgb(4, 5, 6)');
			await fixture.input.move(outside as unknown as DOMElement);
			expect(first.matches(':hover')).toBe(false);
			expect(section.matches(':hover')).toBe(false);
			expect(get(first).color).toBe('rgb(1, 2, 3)');
			expect(get(outside).color).toBe('rgb(7, 8, 9)');
		},
	);
	context.test(
		'mouse down and up enter and leave active while retaining hover',
		async (fixture) => {
			const { root, get } = createStyleFixture(fixture, {
				markup: '<button>Press</button>',
				css: 'button:hover {color:rgb(1,2,3)} button:hover:active {color:rgb(4,5,6)}',
			});
			const target = root.querySelector('button')!;
			await fixture.input.move(target as unknown as DOMElement);
			expect(target.matches(':active')).toBe(false);
			await fixture.input.down();
			expect(target.matches(':hover:active'), 'hover and active after down').toBe(true);
			expect(get(target).color).toBe('rgb(4, 5, 6)');
			await fixture.input.up();
			expect(target.matches(':active')).toBe(false);
			expect(target.matches(':hover'), 'hover after release').toBe(true);
			expect(get(target).color).toBe('rgb(1, 2, 3)');
		},
	);
	context.test(
		'relational hover and active update an ancestor and a sibling descendant',
		async (fixture) => {
			const { root, get } = createStyleFixture(fixture, {
				markup:
					'<section><button>Press</button><i>Other</i></section><button id="outside">Outside</button>',
				css: 'section, i {color:rgb(1,2,3)} section:has(button:hover) {color:rgb(4,5,6)} section:has(button:hover) i {color:rgb(7,8,9)} section:has(button:active) i {color:rgb(10,11,12)}',
			});
			const target = root.querySelector('button')!,
				section = root.querySelector('section')!,
				sibling = root.querySelector('i')!;
			await fixture.input.move(target as unknown as DOMElement);
			expect(section.matches(':has(button:hover)')).toBe(true);
			expect(get(section).color).toBe('rgb(4, 5, 6)');
			expect(get(sibling).color).toBe('rgb(7, 8, 9)');
			await fixture.input.down();
			expect(get(sibling).color).toBe('rgb(10, 11, 12)');
			await fixture.input.up();
			expect(get(sibling).color).toBe('rgb(7, 8, 9)');
			await fixture.input.move(root.querySelector('#outside')! as unknown as DOMElement);
			expect(get(sibling).color).toBe('rgb(1, 2, 3)');
		},
		['style.relationalSelectors'],
	);
	context.test(
		'canceling mousedown preserves prior focus and focus styles',
		async (fixture) => {
			const { document, root, get } = createStyleFixture(fixture, {
				markup: '<button>First</button><button>Second</button>',
				css: 'button {color:rgb(1,2,3)} button:focus {color:rgb(4,5,6)}',
			});
			const [first, second] = Array.from(root.querySelectorAll('button'));
			first!.focus();
			second!.addEventListener('mousedown', (event) => event.preventDefault());
			await fixture.input.click(second! as unknown as DOMElement);
			expect(document.activeElement).toBe(first);
			expect(get(first!).color).toBe('rgb(4, 5, 6)');
			expect(get(second!).color).toBe('rgb(1, 2, 3)');
		},
		['input.mouse.focus', 'style.focusState'],
	);
	context.test(
		'native checkbox activation and cancellation update checked styles with rollback',
		async (fixture) => {
			const { root, get } = createStyleFixture(fixture, {
				markup: '<input type="checkbox">',
				css: 'input {color:rgb(1,2,3)} input:checked {color:rgb(4,5,6)}',
			});
			const target = root.querySelector('input')!;
			await fixture.input.click(target as unknown as DOMElement);
			expect(target.matches(':checked')).toBe(true);
			expect(get(target).color).toBe('rgb(4, 5, 6)');
			const seen: unknown[] = [];
			target.addEventListener(
				'click',
				(event) => {
					seen.push(target.matches(':checked'), get(target).color);
					event.preventDefault();
				},
				{ once: true },
			);
			await fixture.input.click(target as unknown as DOMElement);
			expect(seen).toEqual([false, 'rgb(1, 2, 3)']);
			expect(target.matches(':checked')).toBe(true);
			expect(get(target).color).toBe('rgb(4, 5, 6)');
		},
		['input.mouse.activation', 'style.controlSelectors', 'events.listeners.once'],
	);
}
