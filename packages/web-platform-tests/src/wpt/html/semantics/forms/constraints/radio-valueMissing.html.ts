import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	{
		const content = `<!DOCTYPE html>
<html>
<head>
  <title>valueMissing property on the input[type=radio] element</title>
  <meta content="text/html; charset=UTF-8" http-equiv="content-type">
  <meta content="valueMissing property on the input[type=radio] element" name="description">
\x20\x20
\x20\x20
\x20\x20
\x20\x20
</head>
<body>
  <div id="log"></div>

  <form style="display: none">
    <input type="radio" name="group1" id="radio1">
    <input type="radio" name="group1" id="radio2">

    <input type="radio" name="group2" required id="radio3">
    <input type="radio" name="group2" id="radio4">

    <input type="radio" name="group3" required checked id="radio5">
    <input type="radio" name="group3" id="radio6">

    <input type="radio" name="group4" required id="radio7">
    <input type="radio" name="group4" checked id="radio8">
    <input type="radio" name="group4" id="radio9">

    <input type="radio" name="group5" required disabled id="radio10">
    <input type="radio" name="group5" id="radio11">

    <input type="radio" name="group6" required checked disabled id="radio12">
    <input type="radio" name="group6" id="radio13">
  </form>

\x20\x20
</body>
</html>
`;
		const cases = [
			{
				name: 'The required attribute is not set',
				group: ['radio1', 'radio2'],
				expected: false,
			},
			{
				name: 'One of the radios is required, but none checked',
				group: ['radio3', 'radio4'],
				expected: true,
			},
			{
				name: 'One of the radios is required and checked',
				group: ['radio5', 'radio6'],
				expected: false,
			},
			{
				name: 'One of the radios is required and another one is checked',
				group: ['radio7', 'radio8', 'radio9'],
				expected: false,
			},
			{
				name: 'One of the radios is required and disabled, but none checked',
				group: ['radio10', 'radio11'],
				expected: true,
			},
			{
				name: 'One of the radios is required, checked and disabled',
				group: ['radio12', 'radio13'],
				expected: false,
			},
		];

		for (const info of cases) {
			context.test(
				info.name,
				({ document }) => {
					for (let id of info.group) {
						let radio = document.getElementById(id) as HTMLInputElement;

						expect(
							Object.prototype.toString.call(radio.validity),
							'HTMLInputElement.validity must be a ValidityState instance',
						).toBe('[object ValidityState]');

						if (info.expected) {
							expect(
								radio.validity.valueMissing,
								'The ' + id + '.validity.valueMissing should be true',
							).toBe(true);
						} else {
							expect(
								radio.validity.valueMissing,
								'The ' + id + '.validity.valueMissing should be false',
							).toBe(false);
						}
					}
				},
				{ document: { contentType: 'text/html', content } },
			);
		}
	}
}
