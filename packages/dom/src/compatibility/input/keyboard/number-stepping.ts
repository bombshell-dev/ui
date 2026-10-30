// Adapted from WPT input-events-arrow-key-on-number-input{,-prevent-default}.html
// at b719612f963a05ece9c89a7dd7598c1c59618874. Copyright © web-platform-tests contributors.
// BSD-3-Clause; see ../../../../test/wpt/LICENSE.txt.
import type { CompatibilityContext } from '../../context.ts';
import type { DOMElement as DOMElementContract } from '../../contracts/nodes.ts';

export const spec = 'https://html.spec.whatwg.org/multipage/input.html#number-state-(type=number)';
export const wpt =
	'https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/input-events/input-events-arrow-key-on-number-input-prevent-default.html';
export const input = ['keyboard'] as const;
export const requires = [
	'input.keyboard.delivery',
	'events.data.input',
	'elements.input.numericValue',
	'elements.input.stepping',
] as const;
// Selects ArrowUp/ArrowDown numeric stepping, including immediate change events.

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	for (const [key, expected] of [
		['ArrowUp', '6'],
		['ArrowDown', '2'],
	] as const) {
		context.test(
			`${key} applies the numeric step between beforeinput and input/change`,
			async (fixture) => {
				const document = fixture.document as unknown as Document;
				const target = document.createElement('input');
				target.type = 'number';
				target.min = '0';
				target.max = '10';
				target.step = '2';
				target.value = '4';
				fixture.connect(target as unknown as DOMElementContract);
				target.focus();
				const calls: unknown[] = [];
				for (const type of ['keydown', 'beforeinput', 'input', 'change', 'keyup'])
					target.addEventListener(type, (event) => {
						calls.push([type, event.target, target.value]);
					});
				await fixture.input.press(key);
				expect(target.value).toBe(expected);
				expect(calls).toEqual([
					['keydown', target, '4'],
					['beforeinput', target, '4'],
					['input', target, expected],
					['change', target, expected],
					['keyup', target, expected],
				]);
			},
		);
	}
	for (const canceled of ['keydown', 'beforeinput']) {
		context.test(
			`canceling ${canceled} prevents numeric arrow stepping and input/change`,
			async (fixture) => {
				const document = fixture.document as unknown as Document;
				const target = document.createElement('input');
				target.type = 'number';
				target.value = '4';
				fixture.connect(target as unknown as DOMElementContract);
				target.focus();
				const calls: string[] = [];
				for (const type of ['keydown', 'beforeinput', 'input', 'change', 'keyup'])
					target.addEventListener(type, (event) => {
						calls.push(type);
						if (type === canceled) event.preventDefault();
					});
				await fixture.input.press('ArrowUp');
				expect(target.value).toBe('4');
				expect(calls).toEqual(
					canceled === 'keydown' ? ['keydown', 'keyup'] : ['keydown', 'beforeinput', 'keyup'],
				);
			},
		);
	}
}
