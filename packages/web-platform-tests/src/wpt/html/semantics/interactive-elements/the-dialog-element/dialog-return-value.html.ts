import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	{
		const content =
			'<!DOCTYPE html>\n<html>\n<head>\n\n\n</head>\n<body>\n<dialog></dialog>\n\n</body>\n</html>\n';

		context.test(
			'Tests dialog.returnValue is settable and returns the last value set.',
			({ document }) => {
				const dialog = document.querySelector('dialog')!;
				expect(dialog.returnValue).toBe('');

				dialog.returnValue = 'Setting value directly';
				expect(dialog.returnValue).toBe('Setting value directly');

				dialog.returnValue = null as unknown as string;
				expect(dialog.returnValue).toBe('null');

				dialog.returnValue = '';
				expect(dialog.returnValue).toBe('');

				dialog.returnValue = 7 as unknown as string;
				expect(dialog.returnValue).toBe('7');

				dialog.show();
				dialog.close('Return value set from close()');
				expect(dialog.returnValue).toBe('Return value set from close()');

				dialog.show();
				dialog.close('');
				expect(dialog.returnValue).toBe('');

				dialog.show();
				dialog.close(null as unknown as string);
				expect(dialog.returnValue).toBe('null');

				dialog.returnValue = 'Should not change because no argument to close()';
				dialog.show();
				dialog.close();
				expect(dialog.returnValue).toBe('Should not change because no argument to close()');

				dialog.returnValue = 'Should not change because of undefined argument to close()';
				dialog.show();
				dialog.close(undefined);
				expect(dialog.returnValue).toBe(
					'Should not change because of undefined argument to close()',
				);

				dialog.returnValue = 'Should not change because of no-op close()';
				dialog.close('blah');
				expect(dialog.returnValue).toBe('Should not change because of no-op close()');
			},
			{ document: { contentType: 'text/html', content } },
		);
	}
}
