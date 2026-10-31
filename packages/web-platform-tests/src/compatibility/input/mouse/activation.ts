import type { DOMElement as DOMElementContract } from '../../contracts/nodes.ts';
import type { CompatibilityContext } from '../../context.ts';
import type { DOMSubmitEvent } from '../../contracts/events.ts';

export const spec = 'https://html.spec.whatwg.org/multipage/interaction.html#activation-behavior';
export const input = ['mouse'] as const;
export const requires = [
	'input.mouse.delivery',
	'elements.input.activation',
	'elements.button.activation',
	'elements.form.submission',
	'events.dispatch.cancellation',
] as const;

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test(
		'clicking a checkbox toggles checkedness before click and emits input then change',
		async (fixture) => {
			const checkbox = fixture.document.createElement('input');
			checkbox.type = 'checkbox';
			fixture.connect(checkbox);
			const calls: [string, boolean][] = [];
			for (const type of ['click', 'input', 'change'])
				checkbox.addEventListener(type, (event) => calls.push([event.type, checkbox.checked]));
			await fixture.input.click(checkbox);
			expect(checkbox.checked).toBe(true);
			expect(calls).toEqual([
				['click', true],
				['input', true],
				['change', true],
			]);
			calls.length = 0;
			await fixture.input.click(checkbox);
			expect(checkbox.checked).toBe(false);
			expect(calls).toEqual([
				['click', false],
				['input', false],
				['change', false],
			]);
		},
	);

	context.test(
		'canceling checkbox click restores checkedness and indeterminate without input or change',
		async (fixture) => {
			const checkbox = fixture.document.createElement('input');
			checkbox.type = 'checkbox';
			checkbox.indeterminate = true;
			fixture.connect(checkbox);
			const preactivation: boolean[][] = [];
			const changes: string[] = [];
			checkbox.addEventListener('click', (event) => {
				preactivation.push([checkbox.checked, checkbox.indeterminate]);
				event.preventDefault();
			});
			for (const type of ['input', 'change'])
				checkbox.addEventListener(type, (event) => changes.push(event.type));
			await fixture.input.click(checkbox);
			expect(preactivation).toEqual([[true, false]]);
			expect([checkbox.checked, checkbox.indeterminate]).toEqual([false, true]);
			expect(changes).toEqual([]);
		},
	);

	context.test(
		'clicking a submit button submits its form with that button as submitter',
		async (fixture) => {
			const form = fixture.document.createElement('form');
			const button = fixture.document.createElement('button');
			button.type = 'submit';
			button.textContent = 'Submit';
			form.appendChild(button);
			fixture.connect(form);
			const calls: string[] = [];
			const submissions: DOMSubmitEvent[] = [];
			button.addEventListener('click', () => calls.push('click'));
			form.addEventListener('submit', (event) => {
				event.preventDefault();
				calls.push('submit');
				submissions.push(event as DOMSubmitEvent);
			});
			await fixture.input.click(button);
			expect(calls).toEqual(['click', 'submit']);
			expect(submissions).toHaveLength(1);
			expect(submissions[0]?.target).toBe(form);
			expect(submissions[0]?.submitter).toBe(button);
			expect(submissions[0]?.bubbles).toBe(true);
			expect(submissions[0]?.cancelable).toBe(true);
		},
	);

	context.test(
		'canceling submit-button click prevents the form submission default action',
		async (fixture) => {
			const form = fixture.document.createElement('form');
			const button = fixture.document.createElement('button');
			button.type = 'submit';
			button.textContent = 'Canceled submit';
			form.appendChild(button);
			fixture.connect(form);
			let clicks = 0;
			let submissions = 0;
			button.addEventListener('click', (event) => {
				event.preventDefault();
				clicks++;
			});
			form.addEventListener('submit', (event) => {
				event.preventDefault();
				submissions++;
			});
			await fixture.input.click(button);
			expect(clicks).toBe(1);
			expect(submissions).toBe(0);
		},
	);

	context.test('disabled controls suppress click activation from mouse input', async (fixture) => {
		const form = fixture.document.createElement('form');
		const button = fixture.document.createElement('button');
		const checkbox = fixture.document.createElement('input');
		button.type = 'submit';
		button.textContent = 'Disabled submit';
		button.disabled = true;
		checkbox.type = 'checkbox';
		checkbox.disabled = true;
		form.append(button, checkbox);
		fixture.connect(form);
		const calls: string[] = [];
		button.addEventListener('click', () => calls.push('button click'));
		checkbox.addEventListener('click', () => calls.push('checkbox click'));
		form.addEventListener('submit', (event) => {
			event.preventDefault();
			calls.push('submit');
		});
		await fixture.input.click(button);
		await fixture.input.click(checkbox);
		expect(checkbox.checked).toBe(false);
		expect(calls).toEqual([]);
	});

	context.test(
		'repeated native checkbox clicks preserve click input change order',
		async (fixture) => {
			const document = fixture.document as unknown as Document;
			const e = document.createElement('input');
			e.type = 'checkbox';
			fixture.connect(e as unknown as DOMElementContract);
			const seen: string[] = [];
			for (const type of ['click', 'input', 'change'])
				e.addEventListener(type, () => seen.push(type));
			await fixture.input.click(e as unknown as DOMElementContract);
			await fixture.input.click(e as unknown as DOMElementContract);
			expect(e.checked).toBe(false);
			expect(seen).toEqual(['click', 'input', 'change', 'click', 'input', 'change']);
		},
	);
}
