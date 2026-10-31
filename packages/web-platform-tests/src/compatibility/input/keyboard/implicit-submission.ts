import type { CompatibilityContext } from '../../context.ts';
import type { DOMSubmitEvent } from '../../contracts/events.ts';
import type { DOMElement } from '../../contracts/nodes.ts';

export const spec =
	'https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#implicit-submission';
export const wpt =
	'https://github.com/web-platform-tests/wpt/blob/master/html/semantics/forms/form-submission-0/implicit-submission.optional.html';
export const input = ['keyboard'] as const;
export const requires = [
	'input.keyboard.delivery',
	'elements.input.formAssociation',
	'elements.button.activation',
	'elements.form.submission',
] as const;

// Enter as the implicit-submission trigger is an explicitly selected interaction policy.
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('Enter in a text control activates the default submit button', async (fixture) => {
		const form = fixture.connect(fixture.document.createElement('form'));
		const text = fixture.document.createElement('input');
		const first = fixture.document.createElement('button');
		const second = fixture.document.createElement('button');
		first.type = 'submit';
		second.type = 'submit';
		form.append(text, first, second);
		const clicks: DOMElement[] = [];
		first.addEventListener('click', () => clicks.push(first));
		second.addEventListener('click', () => clicks.push(second));
		const submissions: DOMSubmitEvent[] = [];
		form.addEventListener('submit', (event) => {
			event.preventDefault();
			submissions.push(event as DOMSubmitEvent);
		});
		text.focus();
		await fixture.input.press('Enter');
		expect(clicks).toEqual([first]);
		expect(submissions).toHaveLength(1);
		const submitted = submissions[0];
		if (!submitted) return expect.fail('Expected a submit event');
		expect(submitted.submitter).toBe(first);
		expect(submitted.target).toBe(form);
		expect([submitted.bubbles, submitted.cancelable]).toEqual([true, true]);
	});

	context.test('canceling Enter keydown suppresses implicit submission', async (fixture) => {
		const form = fixture.connect(fixture.document.createElement('form'));
		const text = fixture.document.createElement('input');
		const button = fixture.document.createElement('button');
		button.type = 'submit';
		form.append(text, button);
		const received: string[] = [];
		text.addEventListener('keydown', (event) => event.preventDefault());
		button.addEventListener('click', () => received.push('click'));
		form.addEventListener('submit', (event) => {
			event.preventDefault();
			received.push('submit');
		});
		text.focus();
		await fixture.input.press('Enter');
		expect(received).toEqual([]);
	});

	context.test(
		'canceling the default button click suppresses implicit submission',
		async (fixture) => {
			const form = fixture.connect(fixture.document.createElement('form'));
			const text = fixture.document.createElement('input');
			const button = fixture.document.createElement('button');
			button.type = 'submit';
			form.append(text, button);
			const received: string[] = [];
			button.addEventListener('click', (event) => {
				event.preventDefault();
				received.push('click');
			});
			form.addEventListener('submit', (event) => {
				event.preventDefault();
				received.push('submit');
			});
			text.focus();
			await fixture.input.press('Enter');
			expect(received).toEqual(['click']);
		},
	);

	context.test(
		'a disabled default submit button blocks submission rather than selecting the next button',
		async (fixture) => {
			const form = fixture.connect(fixture.document.createElement('form'));
			const text = fixture.document.createElement('input');
			const first = fixture.document.createElement('button');
			const second = fixture.document.createElement('button');
			first.type = 'submit';
			second.type = 'submit';
			first.disabled = true;
			form.append(text, first, second);
			const received: string[] = [];
			first.addEventListener('click', () => received.push('first'));
			second.addEventListener('click', () => received.push('second'));
			form.addEventListener('submit', (event) => {
				event.preventDefault();
				received.push('submit');
			});
			text.focus();
			await fixture.input.press('Enter');
			expect(received).toEqual([]);
		},
	);

	context.test(
		'a single text control submits without a submit button and reports a null submitter',
		async (fixture) => {
			const form = fixture.connect(fixture.document.createElement('form'));
			const text = fixture.document.createElement('input');
			form.appendChild(text);
			const submissions: DOMSubmitEvent[] = [];
			form.addEventListener('submit', (event) => {
				event.preventDefault();
				submissions.push(event as DOMSubmitEvent);
			});
			text.focus();
			await fixture.input.press('Enter');
			expect(submissions).toHaveLength(1);
			expect(submissions[0]?.submitter).toBe(null);
		},
	);
}
