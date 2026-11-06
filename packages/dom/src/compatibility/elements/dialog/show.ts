import type { DOMElement as DOMElementContract } from '../../contracts/nodes.ts';
import type { CompatibilityContext } from '../../context.ts';

export const spec =
	'https://html.spec.whatwg.org/multipage/interactive-elements.html#the-dialog-element';

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('show is idempotent and sets open', (fixture) => {
		const document = fixture.document;
		const dialog = document.createElement('dialog');
		fixture.connect(dialog);
		expect(dialog.open).toBe(false);
		dialog.show();
		expect(dialog.open).toBe(true);
		dialog.show();
		expect(dialog.open).toBe(true);
	});

	context.test('show is idempotent for an already nonmodal dialog', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('dialog');
		fixture.connect(e as unknown as DOMElementContract);
		e.show();
		expect(e.open).toBe(true);
		e.show();
		expect(e.open).toBe(true);
		e.close();
		expect(e.open).toBe(false);
	});
}
