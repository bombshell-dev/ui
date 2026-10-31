import type { DOMElement as DOMElementContract } from '../../contracts/nodes.ts';
import type { DOMEvent } from '../../contracts/events.ts';
import type { CompatibilityContext } from '../../context.ts';

export const spec =
	'https://html.spec.whatwg.org/multipage/interactive-elements.html#the-dialog-element';
export const requires = ['elements.dialog.show'] as const;

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('sets the return value and queues a noncancelable close event', async (fixture) => {
		const document = fixture.document;
		const dialog = document.createElement('dialog');
		fixture.connect(dialog);
		dialog.show();
		let closed = false;
		const delivered = new Promise<DOMEvent>((resolve) => {
			dialog.addEventListener('close', (event) => {
				closed = true;
				resolve(event);
			});
		});
		dialog.close('accepted');
		expect(dialog.open).toBe(false);
		expect(dialog.returnValue).toBe('accepted');
		expect(closed).toBe(false);
		const event = await delivered;
		expect(event.bubbles).toBe(false);
		expect(event.cancelable).toBe(false);
	});

	context.test('close updates returnValue and does nothing when already closed', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('dialog');
		fixture.connect(e as unknown as DOMElementContract);
		expect(e.returnValue).toBe('');
		e.show();
		e.close('result');
		expect(e.open).toBe(false);
		expect(e.returnValue).toBe('result');
		e.close('ignored');
		expect(e.returnValue).toBe('result');
	});

	context.test('close event is asynchronous and noncancelable', async (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('dialog');
		fixture.connect(e as unknown as DOMElementContract);
		const seen: unknown[] = [];
		e.addEventListener('close', (event) => seen.push([e.open, event.bubbles, event.cancelable]));
		e.show();
		e.close();
		expect(seen).toEqual([]);
		await new Promise((resolve) => setTimeout(resolve, 40));
		expect(seen).toEqual([[false, false, false]]);
	});
}
