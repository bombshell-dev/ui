import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	{
		const content = `<!DOCTYPE HTML>
<html>
 <head>
  <title>Forms</title>
\x20\x20
\x20\x20
 </head>
 <body>
  <p>
    <h3>input_validationMessage</h3>
  </p>

  <hr>

  <div id="log"></div>

  <form method="post"
      enctype="application/x-www-form-urlencoded"
      action=""
      id="input_form">
    <p><input type='hidden' id='input_text'></p>
  </form>
\x20\x20

 </body>
</html>
`;

		context.test(
			'input validationMessage',
			({ document }) => {
				const input = document.getElementById('input_text') as HTMLInputElement;
				if (typeof input.validationMessage === 'string') {
					expect(input.validationMessage, 'validationMessage attribute is not correct.').toBe('');
				} else {
					expect.unreachable('validationMessage attribute is not exist.');
				}
			},
			{ document: { contentType: 'text/html', content } },
		);
	}
}
