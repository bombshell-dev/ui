import type { DOMElement as DOMElementContract } from '../../contracts/nodes.ts';
import type { DOMEvent } from '../../contracts/events.ts';
import type { CompatibilityContext } from '../../context.ts';

export const spec =
	'https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#dom-form-requestsubmit';
export const requires = ['events.dispatch.cancellation'] as const;

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('requestSubmit emits a cancelable submit event', (fixture) => {
		const document = fixture.document;
		const form = document.createElement('form');
		const button = document.createElement('button');
		form.appendChild(button);
		fixture.connect(form);
		const submitted: DOMEvent[] = [];
		form.addEventListener('submit', (event) => {
			event.preventDefault();
			submitted.push(event);
		});
		form.requestSubmit(button);
		expect(submitted.length).toBe(1);
		const event = submitted[0];
		if (!event) return expect.fail('Expected a submit event');
		expect(event.target).toBe(form);
		expect(event.cancelable).toBe(true);
		expect(event.bubbles).toBe(true);
		const outsider = document.createElement('button');
		expect(() => form.requestSubmit(outsider)).toThrow(
			expect.objectContaining({ name: 'NotFoundError' }),
		);
	});

	context.test('requestSubmit validates first and reports submitter after success', (fixture) => {
		const document = fixture.document as unknown as Document;
		const form = document.createElement('form'),
			e = document.createElement('input'),
			button = document.createElement('button');
		e.required = true;
		form.append(e, button);
		fixture.connect(form as unknown as DOMElementContract);
		const seen: unknown[] = [];
		e.addEventListener('invalid', () => seen.push('invalid'));
		form.addEventListener('submit', (event) => {
			event.preventDefault();
			seen.push((event as SubmitEvent).submitter);
		});
		form.requestSubmit(button);
		expect(seen).toEqual(['invalid']);
		e.value = 'ok';
		form.requestSubmit(button);
		expect(seen).toEqual(['invalid', button]);
	});

	context.test('rejects invalid requestSubmit arguments before firing events', (fixture) => {
		const document = fixture.document as unknown as Document;
		const form = document.createElement('form'),
			foreign = document.createElement('button'),
			button = document.createElement('button');
		button.type = 'button';
		form.append(button);
		expect(() => form.requestSubmit(button)).toThrow(
			expect.objectContaining({ name: 'TypeError' }),
		);
		expect(() => form.requestSubmit(foreign)).toThrow(
			expect.objectContaining({ name: 'NotFoundError' }),
		);
	});
}
