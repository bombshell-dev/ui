import type { DOMElement as DOMElementContract } from '../../contracts/nodes.ts';
import type { CompatibilityContext } from '../../context.ts';

export const spec =
	'https://html.spec.whatwg.org/multipage/interactive-elements.html#the-dialog-element';
export const requires = ['elements.dialog.show', 'elements.dialog.close'] as const;

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('requires connectivity and rejects switching an open nonmodal dialog', (fixture) => {
		const document = fixture.document;
		const dialog = document.createElement('dialog');
		expect(() => dialog.showModal()).toThrow(
			expect.objectContaining({ name: 'InvalidStateError' }),
		);
		fixture.connect(dialog);
		dialog.show();
		expect(() => dialog.showModal()).toThrow(
			expect.objectContaining({ name: 'InvalidStateError' }),
		);
		dialog.close();
		dialog.showModal();
		fixture.cleanup(() => dialog.close());
		dialog.showModal();
		expect(dialog.open).toBe(true);
		expect(() => dialog.show()).toThrow(expect.objectContaining({ name: 'InvalidStateError' }));
	});

	context.test('rejects modal display on disconnected and already nonmodal dialogs', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('dialog');
		expect(() => e.showModal()).toThrow(expect.objectContaining({ name: 'InvalidStateError' }));
		fixture.connect(e as unknown as DOMElementContract);
		e.show();
		expect(() => e.showModal()).toThrow(expect.objectContaining({ name: 'InvalidStateError' }));
		e.close();
		e.showModal();
		expect(e.open).toBe(true);
		e.close();
	});
}
