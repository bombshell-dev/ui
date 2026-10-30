import type { DOMElement as DOMElementContract } from '../../contracts/nodes.ts';
import type { DOMEvent, DOMToggleEvent } from '../../contracts/events.ts';
import type { CompatibilityContext } from '../../context.ts';

export const spec =
	'https://html.spec.whatwg.org/multipage/interactive-elements.html#details-toggle-task-tracker';
export const requires = ['elements.details.open'] as const;

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('queues and coalesces toggle events', async (fixture) => {
		const document = fixture.document;
		const details = document.createElement('details');
		let calls = 0;
		const delivered = new Promise<DOMEvent>((resolve) => {
			details.addEventListener('toggle', (event) => {
				calls++;
				resolve(event);
			});
		});
		details.open = true;
		details.open = false;
		expect(calls).toBe(0);
		const event = (await delivered) as DOMToggleEvent;
		expect(event.bubbles).toBe(false);
		expect(event.cancelable).toBe(false);
		// The first uncoalesced event would end in "open". Checking the merged
		// states catches that error without guessing how long the task queue takes.
		expect(event.oldState).toBe('closed');
		expect(event.newState).toBe('closed');
		expect(calls).toBe(1);
	});

	context.test('queues and coalesces toggle events across synchronous changes', async (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('details');
		fixture.connect(e as unknown as DOMElementContract);
		const seen: unknown[] = [];
		e.addEventListener('toggle', (event) => {
			const toggle = event as ToggleEvent;
			seen.push([toggle.oldState, toggle.newState, event.bubbles, event.cancelable]);
		});
		e.open = true;
		e.open = false;
		e.open = true;
		expect(seen).toEqual([]);
		await new Promise((resolve) => setTimeout(resolve, 30));
		expect(seen).toEqual([['closed', 'open', false, false]]);
	});
}
