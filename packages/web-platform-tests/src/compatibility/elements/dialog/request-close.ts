import type { DOMElement as DOMElementContract } from '../../contracts/nodes.ts';
import type { DOMEvent } from '../../contracts/events.ts';
import type { CompatibilityContext } from '../../context.ts';

export const spec =
	'https://html.spec.whatwg.org/multipage/interactive-elements.html#the-dialog-element';
export const requires = [
	'elements.dialog.show',
	'elements.dialog.close',
	'events.dispatch.cancellation',
] as const;

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('allows cancel listeners to veto a close request', (fixture) => {
		const document = fixture.document;
		const dialog = document.createElement('dialog');
		fixture.connect(dialog);
		dialog.show();
		const cancel = (event: DOMEvent): void => {
			event.preventDefault();
		};
		dialog.addEventListener('cancel', cancel);
		dialog.requestClose('ignored');
		expect(dialog.open).toBe(true);
		expect(dialog.returnValue).toBe('');
		dialog.removeEventListener('cancel', cancel);
		dialog.requestClose('accepted');
		expect(dialog.open).toBe(false);
		expect(dialog.returnValue).toBe('accepted');
	});

	context.test('requestClose fires cancel before close and accepts a return value', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('dialog');
		fixture.connect(e as unknown as DOMElementContract);
		const seen: unknown[] = [];
		e.addEventListener('cancel', (event) => seen.push([e.open, event.cancelable]));
		e.show();
		e.requestClose('result');
		expect(seen).toEqual([[true, true]]);
		expect(e.open).toBe(false);
		expect(e.returnValue).toBe('result');
	});
}
