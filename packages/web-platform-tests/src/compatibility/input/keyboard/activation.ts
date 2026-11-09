import type { CompatibilityContext } from '../../context.ts';

export const spec = 'https://w3c.github.io/uievents/#event-type-keydown';
export const input = ['keyboard'] as const;
export const requires = ['input.keyboard.delivery', 'elements.button.activation'] as const;

// This capability selects the desktop Enter-on-down / Space-on-up interaction policy.
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'activates a focused button on Enter keydown exactly once per press',
		async (fixture) => {
			const button = fixture.connect(fixture.document.createElement('button'));
			button.type = 'button';
			const received: string[] = [];
			for (const type of ['keydown', 'click', 'keyup']) {
				button.addEventListener(type, () => received.push(type));
			}
			button.focus();
			await fixture.input.keyDown('Enter');
			expect(received).toEqual(['keydown', 'click']);
			await fixture.input.keyUp('Enter');
			expect(received).toEqual(['keydown', 'click', 'keyup']);
		},
	);

	context.test('activates a focused button on Space release', async (fixture) => {
		const button = fixture.connect(fixture.document.createElement('button'));
		button.type = 'button';
		const received: string[] = [];
		for (const type of ['keydown', 'click', 'keyup']) {
			button.addEventListener(type, () => received.push(type));
		}
		button.focus();
		await fixture.input.keyDown(' ');
		expect(received).toEqual(['keydown']);
		await fixture.input.keyUp(' ');
		expect(received).toEqual(['keydown', 'keyup', 'click']);
	});

	for (const key of ['Enter', ' ']) {
		context.test(
			`canceling ${key === ' ' ? 'Space' : key} keydown suppresses button activation`,
			async (fixture) => {
				const button = fixture.connect(fixture.document.createElement('button'));
				button.type = 'button';
				let clicks = 0;
				button.addEventListener('keydown', (event) => event.preventDefault());
				button.addEventListener('click', () => clicks++);
				button.focus();
				await fixture.input.press(key);
				expect(clicks).toBe(0);
			},
		);
	}

	context.test(
		'canceling Space keyup suppresses the pending button activation',
		async (fixture) => {
			const button = fixture.connect(fixture.document.createElement('button'));
			button.type = 'button';
			let clicks = 0;
			button.addEventListener('keyup', (event) => event.preventDefault());
			button.addEventListener('click', () => clicks++);
			button.focus();
			await fixture.input.press(' ');
			expect(clicks).toBe(0);
		},
	);

	context.test(
		'Space toggles a checkbox and canceled click restores its checkedness',
		async (fixture) => {
			const checkbox = fixture.connect(fixture.document.createElement('input'));
			checkbox.type = 'checkbox';
			const changes: string[] = [];
			checkbox.addEventListener('input', () => changes.push('input'));
			checkbox.addEventListener('change', () => changes.push('change'));
			checkbox.focus();
			await fixture.input.press(' ');
			expect(checkbox.checked).toBe(true);
			expect(changes).toEqual(['input', 'change']);
			checkbox.addEventListener('click', (event) => event.preventDefault());
			await fixture.input.press(' ');
			expect(checkbox.checked).toBe(true);
			expect(changes).toEqual(['input', 'change']);
		},
		['elements.input.activation'],
	);
}
