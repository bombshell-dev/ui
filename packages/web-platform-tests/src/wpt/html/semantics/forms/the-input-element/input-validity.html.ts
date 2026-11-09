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
    <h3>input_validity</h3>
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
			'input validity',
			({ document }) => {
				const input = document.getElementById('input_text') as HTMLInputElement;
				if (typeof input.validity === 'object') {
					expect(input.validity.valueMissing, 'validity attribute is not correct.').toBe(false);
				} else {
					expect.unreachable('validity attribute is not exist.');
				}
			},
			{ document: { contentType: 'text/html', content } },
		);
	}
}
