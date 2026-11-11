import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	{
		const content = `<!DOCTYPE html>
<meta charset="utf-8">


<meta name="assert" content="button@type values are ASCII case-insensitive">


<button type="reset">
<button type="ReSeT">
<button type="reſet">
<button type="submit">
<button type="SuBmIt">
<button type="ſubmit">

`;

		context.test(
			'keyword reset',
			({ document }) => {
				const button = document.querySelectorAll('button');

				expect(button[0]!.type, 'lowercase valid').toBe('reset');
				expect(button[1]!.type, 'mixed case valid').toBe('reset');
				expect(button[2]!.type, 'non-ASCII invalid').toBe('submit');
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'keyword submit',
			({ document }) => {
				const button = document.querySelectorAll('button');

				expect(button[3]!.type, 'lowercase valid').toBe('submit');

				// vacuous: the invalid value default is currently submit, so even if the UA
				// treats this as invalid, the observable behaviour would still be correct
				expect(button[4]!.type, 'mixed case valid').toBe('submit');

				// vacuous: the invalid value default is currently submit, so even if the UA
				// treats this as valid, the observable behaviour would still be correct
				expect(button[5]!.type, 'non-ASCII invalid').toBe('submit');
			},
			{ document: { contentType: 'text/html', content } },
		);
	}
}
