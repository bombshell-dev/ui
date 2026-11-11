import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	{
		const content = `<!DOCTYPE html>
<html>
<head>
  <title>Input url</title>
\x20\x20
\x20\x20
\x20\x20
\x20\x20
</head>
<body>
  <h1>Input url</h1>
  <div style="display: none">
  <input type="url" id="type_support" />
  <input type="url" id="set_value_LF" />
  <input type="url" id="set_value_CR" />
  <input type="url" id="set_value_CRLF" />
  <input type="url" id="value_with_CRLF" value="a&#x000D;&#x000A;a" />
  <input type="url" id="value_with_leading_trailing_white_space" value=" aa " />
  <input type="url" id="value_with_leading_trailing_inner_white_space" value=" a a " />
  </div>
  <div id="log">
  </div>

\x20\x20

</body>
</html>
`;

		context.test(
			'The value must not be set with "LF" (U+000A) or "CR" (U+000D)',
			({ document }) => {
				let element = document.getElementById('set_value_LF') as HTMLInputElement;
				element.value = 'a\u000Aa';
				expect(element.value).toBe('aa');

				element = document.getElementById('set_value_CR') as HTMLInputElement;
				element.value = 'a\u000Da';
				expect(element.value).toBe('aa');

				element = document.getElementById('set_value_CRLF') as HTMLInputElement;
				element.value = 'a\u000D\u000Aa';
				expect(element.value).toBe('aa');
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'The value sanitization algorithm is as follows: Strip line breaks from the value',
			({ document }) => {
				let element = document.getElementById('value_with_CRLF') as HTMLInputElement;
				expect(element.value).toBe('aa');
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'The value sanitization algorithm is as follows: Strip leading and trailing whitespace from the value.',
			({ document }) => {
				let element = document.getElementById(
					'value_with_leading_trailing_white_space',
				) as HTMLInputElement;
				expect(element.value).toBe('aa');

				element = document.getElementById(
					'value_with_leading_trailing_inner_white_space',
				) as HTMLInputElement;
				expect(element.value).toBe('a a');
			},
			{ document: { contentType: 'text/html', content } },
		);

		context.test(
			'url type supported on input element',
			({ document }) => {
				const element = document.getElementById('type_support') as HTMLInputElement;
				expect(element.type).toBe('url');
			},
			{ document: { contentType: 'text/html', content } },
		);
	}
}
