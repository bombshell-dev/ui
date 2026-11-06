import type { CompatibilityContext } from '../../context.ts';
import type { DOMKeyboardEvent } from '../../contracts/events.ts';

export const spec =
	'https://html.spec.whatwg.org/multipage/interaction.html#sequential-focus-navigation';
export const input = ['keyboard'] as const;
export const requires = [
	'input.keyboard.delivery',
	'input.keyboard.modifiers',
	'focus.eligibility',
] as const;

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'Tab advances through controls and delivers keyup at the new focus',
		async (fixture) => {
			const root = fixture.connect(fixture.document.createElement('div'));
			const first = fixture.document.createElement('input');
			const second = fixture.document.createElement('input');
			const third = fixture.document.createElement('input');
			root.append(first, second, third);
			const received: unknown[][] = [];
			first.addEventListener('keydown', (event) => received.push([event.type, event.target]));
			second.addEventListener('keyup', (event) => received.push([event.type, event.target]));
			first.focus();
			await fixture.input.press('Tab');
			expect(fixture.document.activeElement).toBe(second);
			expect(received).toEqual([
				['keydown', first],
				['keyup', second],
			]);
			await fixture.input.press('Tab');
			expect(fixture.document.activeElement).toBe(third);
		},
	);

	context.test('Shift+Tab traverses controls in reverse order', async (fixture) => {
		const root = fixture.connect(fixture.document.createElement('div'));
		const first = fixture.document.createElement('input');
		const second = fixture.document.createElement('input');
		const third = fixture.document.createElement('input');
		root.append(first, second, third);
		third.focus();
		await fixture.input.keyDown('Shift');
		await fixture.input.press('Tab');
		expect(fixture.document.activeElement).toBe(second);
		await fixture.input.press('Tab');
		expect(fixture.document.activeElement).toBe(first);
		await fixture.input.keyUp('Shift');
	});

	context.test('canceled Tab leaves focus on the current control', async (fixture) => {
		const root = fixture.connect(fixture.document.createElement('div'));
		const first = fixture.document.createElement('input');
		const second = fixture.document.createElement('input');
		root.append(first, second);
		first.addEventListener('keydown', (event) => {
			if ((event as DOMKeyboardEvent).key === 'Tab') event.preventDefault();
		});
		first.focus();
		await fixture.input.press('Tab');
		expect(fixture.document.activeElement).toBe(first);
	});

	context.test(
		'skips disabled controls and negative tabindex during sequential navigation',
		async (fixture) => {
			const root = fixture.connect(fixture.document.createElement('div'));
			const first = fixture.document.createElement('input');
			const disabled = fixture.document.createElement('input');
			disabled.disabled = true;
			const excluded = fixture.document.createElement('input');
			excluded.tabIndex = -1;
			const last = fixture.document.createElement('input');
			root.append(first, disabled, excluded, last);
			first.focus();
			await fixture.input.press('Tab');
			expect(fixture.document.activeElement).toBe(last);
			excluded.focus();
			expect(fixture.document.activeElement).toBe(excluded);
		},
	);
}
