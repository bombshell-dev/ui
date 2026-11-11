import type { CompatibilityContext } from '../../../shared/context.ts';

export const input = ['keyboard'] as const;

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('keyDown performs character insertion before completing', async (fixture) => {
		const { document } = fixture;

		function setupInput() {
			const eventLog: string[] = [];
			const input = document.createElement('input');
			for (const type of ['keydown', 'beforeinput', 'input'])
				input.addEventListener(type, (event) => eventLog.push(event.type));
			document.body.appendChild(input);
			input.focus();
			fixture.cleanup(async () => {
				try {
					await fixture.input.keyUp('a');
				} finally {
					input.remove();
				}
			});
			return { input, eventLog };
		}

		const { input, eventLog } = setupInput();

		await fixture.input.keyDown('a');

		{
			const actualArray = eventLog;
			const expectedArray = ['keydown', 'beforeinput', 'input'];
			expect(
				actualArray.length,
				'keyDown should dispatch keydown, beforeinput, and input in order',
			).toBe(expectedArray.length);
			for (let index = 0; index < expectedArray.length; index++)
				expect(
					actualArray[index],
					'keyDown should dispatch keydown, beforeinput, and input in order',
				).toBe(expectedArray[index]);
		}
		expect(input.value, 'keyDown should insert the character before completing').toBe('a');
	});
	context.test('Canceling keydown suppresses its editing default action', async (fixture) => {
		const { document } = fixture;

		function setupInput() {
			const eventLog: string[] = [];
			const input = document.createElement('input');
			for (const type of ['keydown', 'beforeinput', 'input'])
				input.addEventListener(type, (event) => eventLog.push(event.type));
			document.body.appendChild(input);
			input.focus();
			fixture.cleanup(async () => {
				try {
					await fixture.input.keyUp('a');
				} finally {
					input.remove();
				}
			});
			return { input, eventLog };
		}

		const { input, eventLog } = setupInput();
		input.addEventListener('keydown', (event) => event.preventDefault());

		await fixture.input.keyDown('a');

		{
			const actualArray = eventLog;
			const expectedArray = ['keydown'];
			expect(actualArray.length, 'Canceling keydown should suppress the editing events').toBe(
				expectedArray.length,
			);
			for (let index = 0; index < expectedArray.length; index++)
				expect(actualArray[index], 'Canceling keydown should suppress the editing events').toBe(
					expectedArray[index],
				);
		}
		expect(input.value, 'Canceling keydown should prevent character insertion').toBe('');
	});
}
