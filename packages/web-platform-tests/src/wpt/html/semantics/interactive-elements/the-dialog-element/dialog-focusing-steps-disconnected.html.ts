import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	{
		const content =
			'<!DOCTYPE html>\n<html>\n<head>\n<title>Test focusing steps when dialog is disconnected</title>\n\n\n\n</head>\n<body>\n<input>\n\n</body>\n</html>\n';

		context.test(
			'dialog.show(): focusing steps should not change focus on disconnected <dialog>',
			({ document, cleanup }) => {
				const outerInput = document.querySelector('input')!;
				outerInput.focus();
				expect(document.activeElement, 'Focus should be on element we just focused').toBe(
					outerInput,
				);

				const dialog = document.createElement('dialog');
				expect(dialog.open, 'Dialog should initially be closed').toBe(false);
				expect(dialog.hasAttribute('open'), 'Dialog should initially be closed').toBe(false);

				const innerInput = document.createElement('input');
				innerInput.autofocus = true;
				dialog.append(innerInput);

				dialog.show();
				cleanup(() => {
					dialog.close();
				});
				expect(dialog.open, 'Disconnected dialog can still be open').toBe(true);

				expect(document.activeElement, 'Focusing steps should not change focus').toBe(outerInput);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'dialog.showModal() should throw on disconnected <dialog>',
			({ document, DOMException }) => {
				expect(() => {
					document.createElement('dialog').showModal();
				}).toThrow(
					expect.objectContaining({
						name: 'InvalidStateError',
						code: 11,
						constructor: DOMException,
					}),
				);
			},
			{ document: { contentType: 'text/html', content } },
		);
	}
}
