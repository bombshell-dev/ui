import type { CompatibilityContext } from '../../context.ts';

export const spec = 'https://w3c.github.io/webdriver/#dispatching-a-keydown-action';
export const input = ['keyboard'] as const;
export const requires = ['input.keyboard.delivery'] as const;

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('input-driver keyboard events are trusted', async (fixture) => {
		const target = fixture.connect(fixture.document.createElement('input'));
		const received: unknown[][] = [];
		for (const type of ['keydown', 'keyup']) {
			target.addEventListener(type, (event) => received.push([event.type, event.isTrusted]));
		}
		target.focus();
		await fixture.input.press('ArrowLeft');
		expect(received).toEqual([
			['keydown', true],
			['keyup', true],
		]);
	});

	context.test(
		'keyboard-generated button activation emits a trusted click',
		async (fixture) => {
			const button = fixture.connect(fixture.document.createElement('button'));
			button.type = 'button';
			const trusted: boolean[] = [];
			button.addEventListener('click', (event) => trusted.push(event.isTrusted));
			button.focus();
			await fixture.input.press('Enter');
			expect(trusted).toEqual([true]);
		},
		['input.keyboard.activation'],
	);
}
