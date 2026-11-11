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
    <h3>input_checkValidity</h3>
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
			'input checkValidity',
			({ document }) => {
				const input = document.getElementById('input_text') as HTMLInputElement;
				try {
					const ret = input.checkValidity();
					expect(ret, 'calling of checkValidity method is failed.').toBe(true);
				} catch (e) {
					expect.unreachable('Error is raised.');
				}
			},
			{ document: { contentType: 'text/html', content } },
		);
	}
}
