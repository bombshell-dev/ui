import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	{
		const content =
			"<!DOCTYPE html>\n\n\n\n\n\n\n\n<dialog id=mydialog>It's my dialog.</dialog>\n\n\n";

		context.test(
			'Tests that dialog is visible after show() is called and not visible after close() is called.',
			({ document, getComputedStyle }) => {
				const dialog = document.getElementById('mydialog') as HTMLDialogElement;
				let computedStyle = getComputedStyle(dialog, null);
				expect(computedStyle.getPropertyValue('display')).toBe('none');

				dialog.show();
				computedStyle = getComputedStyle(dialog, null);
				expect(computedStyle.getPropertyValue('display')).toBe('block');

				dialog.close();
				computedStyle = getComputedStyle(dialog, null);

				expect(computedStyle.getPropertyValue('display')).toBe('none');
				dialog.close();
			},
			{ document: { contentType: 'text/html', content } },
		);
	}
}
