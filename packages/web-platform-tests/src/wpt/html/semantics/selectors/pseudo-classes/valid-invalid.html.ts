import type { CompatibilityContext } from '../../../../../shared/context.ts';

const markup3 = `<!DOCTYPE html>
<html>
<head>
<meta charset=utf-8>
<title>Selector: pseudo-classes (:valid, :invalid)</title>
<link rel="author" title="Denis Ah-Kang" href="mailto:denis@w3.org" id=link1>
<link rel=help href="https://html.spec.whatwg.org/multipage/#pseudo-classes" id=link2>



<style>
  #styleTests form, #styleTests fieldset, #failExample { background-color:red; }
  #styleTests > :valid, #validExample { background-color:green; }
  #styleTests > :invalid, #invalidExample { background-color:lime; }
</style>
</head>
<body>
<div id="log"></div>
<div id='simpleConstraints'>
  <input type=text id=text1 value="foobar" required>
  <input type=text id=text2 required>
</div>
<div id='FormSelection'>
  <form id=form1>
    <input type=text id=text3 value="foobar" required>
  </form>
  <form id=form2>
    <input type=text id=text4 required>
  </form>
</div>
<div id='FieldSetSelection'>
  <fieldset id=fieldset1>
    <input type=text id=text5 value="foobar" required>
  </fieldset>
  <fieldset id=fieldset2>
    <input type=text id=text6 required>
  </fieldset>
</div>
<div id='patternConstraints'>
  <input type=text id=text7 value="AAA" pattern="[0-9][A-Z]{3}">
  <input type=text id=text8 value="0AAA" pattern="[0-9][A-Z]{3}">
</div>
<div id='numberConstraints'>
  <input type=number id=number1 value=0 min=1>
  <input type=number id=number2 value=1 min=1>
</div>
<div id='styleTests'>
  <form>
  </form>
  <form>
    <input type=text min=8 value=4>
  </form>
  <form>
    <input type=number min=8 value=4>
  </form>
  <fieldset>
  </fieldset>
  <fieldset>
    <input type=text min=8 value=4>
  </fieldset>
  <fieldset>
    <input type=number min=8 value=4>
  </fieldset>
  <div id='validExample'></div>
  <div id='invalidExample'></div>
  <div id='failExample'></div>
</div>

</body>
</html>
`;

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		"':valid' matches elements that satisfy their constraints",
		({ document }) => {
			const elements = document.querySelectorAll('#simpleConstraints :valid');
			const result: (HTMLElement | null)[] = [];
			['text1'].forEach(function (id: string) {
				result.push(document.getElementById(id));
			});
			{
				const actual = [...elements];
				const expected = result;
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
		},
		{
			document: {
				contentType: 'text/html',
				content: markup3,
			},
		},
	);
	context.test(
		"':valid' matches form elements that are not the form owner of any elements that themselves are candidates for constraint validation but do not satisfy their constraints",
		({ document }) => {
			const elements = document.querySelectorAll('#FormSelection :valid');
			const result: (HTMLElement | null)[] = [];
			['form1', 'text3'].forEach(function (id: string) {
				result.push(document.getElementById(id));
			});
			{
				const actual = [...elements];
				const expected = result;
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
		},
		{
			document: {
				contentType: 'text/html',
				content: markup3,
			},
		},
	);
	context.test(
		"':valid' matches fieldset elements that have no descendant elements that themselves are candidates for constraint validation but do not satisfy their constraints",
		({ document }) => {
			const elements = document.querySelectorAll('#FieldSetSelection :valid');
			const result: (HTMLElement | null)[] = [];
			['fieldset1', 'text5'].forEach(function (id: string) {
				result.push(document.getElementById(id));
			});
			{
				const actual = [...elements];
				const expected = result;
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
		},
		{
			document: {
				contentType: 'text/html',
				content: markup3,
			},
		},
	);
	context.test(
		"':valid' matches elements that satisfy their pattern constraints",
		({ document }) => {
			const elements = document.querySelectorAll('#patternConstraints :valid');
			const result: (HTMLElement | null)[] = [];
			['text8'].forEach(function (id: string) {
				result.push(document.getElementById(id));
			});
			{
				const actual = [...elements];
				const expected = result;
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
		},
		{
			document: {
				contentType: 'text/html',
				content: markup3,
			},
		},
	);
	context.test(
		"':valid' matches elements that satisfy their number constraints",
		({ document }) => {
			const elements = document.querySelectorAll('#numberConstraints :valid');
			const result: (HTMLElement | null)[] = [];
			['number2'].forEach(function (id: string) {
				result.push(document.getElementById(id));
			});
			{
				const actual = [...elements];
				const expected = result;
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
		},
		{
			document: {
				contentType: 'text/html',
				content: markup3,
			},
		},
	);
	context.test(
		"':invalid' matches elements that do not satisfy their simple text  constraints",
		({ document }) => {
			const elements = document.querySelectorAll('#simpleConstraints :invalid');
			const result: (HTMLElement | null)[] = [];
			['text2'].forEach(function (id: string) {
				result.push(document.getElementById(id));
			});
			{
				const actual = [...elements];
				const expected = result;
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
		},
		{
			document: {
				contentType: 'text/html',
				content: markup3,
			},
		},
	);
	context.test(
		"':invalid' matches form elements that are the form owner of one or more elements that themselves are candidates for constraint validation but do not satisfy their constraints",
		({ document }) => {
			const elements = document.querySelectorAll('#FormSelection :invalid');
			const result: (HTMLElement | null)[] = [];
			['form2', 'text4'].forEach(function (id: string) {
				result.push(document.getElementById(id));
			});
			{
				const actual = [...elements];
				const expected = result;
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
		},
		{
			document: {
				contentType: 'text/html',
				content: markup3,
			},
		},
	);
	context.test(
		"':invalid' matches fieldset elements that have of one or more descendant elements that themselves are candidates for constraint validation but do not satisfy their constraints",
		({ document }) => {
			const elements = document.querySelectorAll('#FieldSetSelection :invalid');
			const result: (HTMLElement | null)[] = [];
			['fieldset2', 'text6'].forEach(function (id: string) {
				result.push(document.getElementById(id));
			});
			{
				const actual = [...elements];
				const expected = result;
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
		},
		{
			document: {
				contentType: 'text/html',
				content: markup3,
			},
		},
	);
	context.test(
		"':invalid' matches elements that do not satisfy their pattern constraints",
		({ document }) => {
			const elements = document.querySelectorAll('#patternConstraints :invalid');
			const result: (HTMLElement | null)[] = [];
			['text7'].forEach(function (id: string) {
				result.push(document.getElementById(id));
			});
			{
				const actual = [...elements];
				const expected = result;
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
		},
		{
			document: {
				contentType: 'text/html',
				content: markup3,
			},
		},
	);
	context.test(
		"':invalid' matches elements that do not satisfy their number constraints",
		({ document }) => {
			const elements = document.querySelectorAll('#numberConstraints :invalid');
			const result: (HTMLElement | null)[] = [];
			['number1'].forEach(function (id: string) {
				result.push(document.getElementById(id));
			});
			{
				const actual = [...elements];
				const expected = result;
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
		},
		{
			document: {
				contentType: 'text/html',
				content: markup3,
			},
		},
	);
	context.test(
		"':valid' matches new elements that satisfy their constraints",
		({ document }) => {
			(document.getElementById('text7') as HTMLInputElement).value = '0BBB';

			const elements = document.querySelectorAll('#patternConstraints :valid');
			const result: (HTMLElement | null)[] = [];
			['text7', 'text8'].forEach(function (id: string) {
				result.push(document.getElementById(id));
			});
			{
				const actual = [...elements];
				const expected = result;
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
		},
		{
			document: {
				contentType: 'text/html',
				content: markup3,
			},
		},
	);
	context.test(
		"':invalid' doesn't match new elements that satisfy their constraints",
		({ document }) => {
			(document.getElementById('text7') as HTMLInputElement).value = '0BBB';

			const elements = document.querySelectorAll('#patternConstraints :invalid');
			const result: (HTMLElement | null)[] = [];
			[].forEach(function (id: string) {
				result.push(document.getElementById(id));
			});
			{
				const actual = [...elements];
				const expected = result;
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
		},
		{
			document: {
				contentType: 'text/html',
				content: markup3,
			},
		},
	);
	context.test(
		"':valid' doesn't match new elements that do not satisfy their constraints",
		({ document }) => {
			(document.getElementById('text7') as HTMLInputElement).value = '0BBB';
			(document.getElementById('text8') as HTMLInputElement).value = 'BBB';

			const elements = document.querySelectorAll('#patternConstraints :valid');
			const result: (HTMLElement | null)[] = [];
			['text7'].forEach(function (id: string) {
				result.push(document.getElementById(id));
			});
			{
				const actual = [...elements];
				const expected = result;
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
		},
		{
			document: {
				contentType: 'text/html',
				content: markup3,
			},
		},
	);
	context.test(
		"':invalid' matches new elements that do not satisfy their constraints",
		({ document }) => {
			(document.getElementById('text7') as HTMLInputElement).value = '0BBB';
			(document.getElementById('text8') as HTMLInputElement).value = 'BBB';

			const elements = document.querySelectorAll('#patternConstraints :invalid');
			const result: (HTMLElement | null)[] = [];
			['text8'].forEach(function (id: string) {
				result.push(document.getElementById(id));
			});
			{
				const actual = [...elements];
				const expected = result;
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
		},
		{
			document: {
				contentType: 'text/html',
				content: markup3,
			},
		},
	);
	for (const type of ['form', 'fieldset']) {
		context.test(
			'empty ' + type + ' correctly styled on page-load',
			({ document, getComputedStyle }) => {
				function getBGColor(elem: Element) {
					return getComputedStyle(elem).backgroundColor;
				}
				var elems = document.querySelectorAll('#styleTests ' + type),
					empty = elems[0]!,
					valid = elems[1]!,
					invalid = elems[2]!,
					validInput = valid.querySelector('input')!,
					invalidInput = invalid.querySelector('input')!,
					expectedValidBGColor = getBGColor(document.getElementById('validExample')!),
					expectedInvalidBGColor = getBGColor(document.getElementById('invalidExample')!),
					expectedFailBGColor = getBGColor(document.getElementById('failExample')!);

				expect(getBGColor(empty), 'wrong background-color').toBe(expectedValidBGColor);
			},
			{
				document: {
					contentType: 'text/html',
					content: markup3,
				},
			},
		);
		context.test(
			'valid ' + type + ' correctly styled on page-load',
			({ document, getComputedStyle }) => {
				function getBGColor(elem: Element) {
					return getComputedStyle(elem).backgroundColor;
				}
				var elems = document.querySelectorAll('#styleTests ' + type),
					empty = elems[0]!,
					valid = elems[1]!,
					invalid = elems[2]!,
					validInput = valid.querySelector('input')!,
					invalidInput = invalid.querySelector('input')!,
					expectedValidBGColor = getBGColor(document.getElementById('validExample')!),
					expectedInvalidBGColor = getBGColor(document.getElementById('invalidExample')!),
					expectedFailBGColor = getBGColor(document.getElementById('failExample')!);

				expect(getBGColor(valid), 'wrong background-color').toBe(expectedValidBGColor);
			},
			{
				document: {
					contentType: 'text/html',
					content: markup3,
				},
			},
		);
		context.test(
			'invalid ' + type + ' correctly styled on page-load',
			({ document, getComputedStyle }) => {
				function getBGColor(elem: Element) {
					return getComputedStyle(elem).backgroundColor;
				}
				var elems = document.querySelectorAll('#styleTests ' + type),
					empty = elems[0]!,
					valid = elems[1]!,
					invalid = elems[2]!,
					validInput = valid.querySelector('input')!,
					invalidInput = invalid.querySelector('input')!,
					expectedValidBGColor = getBGColor(document.getElementById('validExample')!),
					expectedInvalidBGColor = getBGColor(document.getElementById('invalidExample')!),
					expectedFailBGColor = getBGColor(document.getElementById('failExample')!);

				expect(getBGColor(invalid), 'wrong background-color').toBe(expectedInvalidBGColor);
			},
			{
				document: {
					contentType: 'text/html',
					content: markup3,
				},
			},
		);
		context.test(
			'programmatically adding valid to empty ' + type + ' results in correct style',
			({ document, getComputedStyle }) => {
				function getBGColor(elem: Element) {
					return getComputedStyle(elem).backgroundColor;
				}
				var elems = document.querySelectorAll('#styleTests ' + type),
					empty = elems[0]!,
					valid = elems[1]!,
					invalid = elems[2]!,
					validInput = valid.querySelector('input')!,
					invalidInput = invalid.querySelector('input')!,
					expectedValidBGColor = getBGColor(document.getElementById('validExample')!),
					expectedInvalidBGColor = getBGColor(document.getElementById('invalidExample')!),
					expectedFailBGColor = getBGColor(document.getElementById('failExample')!);

				empty.appendChild(validInput.cloneNode());
				expect(getBGColor(empty), 'wrong background-color').toBe(expectedValidBGColor);
			},
			{
				document: {
					contentType: 'text/html',
					content: markup3,
				},
			},
		);
		context.test(
			'programmatically adding invalid to empty ' + type + ' results in correct style',
			({ document, getComputedStyle }) => {
				function getBGColor(elem: Element) {
					return getComputedStyle(elem).backgroundColor;
				}
				var elems = document.querySelectorAll('#styleTests ' + type),
					empty = elems[0]!,
					valid = elems[1]!,
					invalid = elems[2]!,
					validInput = valid.querySelector('input')!,
					invalidInput = invalid.querySelector('input')!,
					expectedValidBGColor = getBGColor(document.getElementById('validExample')!),
					expectedInvalidBGColor = getBGColor(document.getElementById('invalidExample')!),
					expectedFailBGColor = getBGColor(document.getElementById('failExample')!);
				empty.appendChild(validInput.cloneNode());

				empty.appendChild(invalidInput.cloneNode());
				expect(getBGColor(empty), 'wrong background-color').toBe(expectedInvalidBGColor);
			},
			{
				document: {
					contentType: 'text/html',
					content: markup3,
				},
			},
		);
		context.test(
			'programmatically-invalidated ' + type + ' correctly styled',
			({ document, getComputedStyle }) => {
				function getBGColor(elem: Element) {
					return getComputedStyle(elem).backgroundColor;
				}
				var elems = document.querySelectorAll('#styleTests ' + type),
					empty = elems[0]!,
					valid = elems[1]!,
					invalid = elems[2]!,
					validInput = valid.querySelector('input')!,
					invalidInput = invalid.querySelector('input')!,
					expectedValidBGColor = getBGColor(document.getElementById('validExample')!),
					expectedInvalidBGColor = getBGColor(document.getElementById('invalidExample')!),
					expectedFailBGColor = getBGColor(document.getElementById('failExample')!);
				empty.appendChild(validInput.cloneNode());
				empty.appendChild(invalidInput.cloneNode());
				validInput.type = 'number';
				invalidInput.type = 'text';

				expect(getBGColor(valid), 'wrong background-color').toBe(expectedInvalidBGColor);
			},
			{
				document: {
					contentType: 'text/html',
					content: markup3,
				},
			},
		);
		context.test(
			'programmatically-validated ' + type + ' correctly styled',
			({ document, getComputedStyle }) => {
				function getBGColor(elem: Element) {
					return getComputedStyle(elem).backgroundColor;
				}
				var elems = document.querySelectorAll('#styleTests ' + type),
					empty = elems[0]!,
					valid = elems[1]!,
					invalid = elems[2]!,
					validInput = valid.querySelector('input')!,
					invalidInput = invalid.querySelector('input')!,
					expectedValidBGColor = getBGColor(document.getElementById('validExample')!),
					expectedInvalidBGColor = getBGColor(document.getElementById('invalidExample')!),
					expectedFailBGColor = getBGColor(document.getElementById('failExample')!);
				empty.appendChild(validInput.cloneNode());
				empty.appendChild(invalidInput.cloneNode());
				validInput.type = 'number';
				invalidInput.type = 'text';

				expect(getBGColor(invalid), 'wrong background-color').toBe(expectedValidBGColor);
			},
			{
				document: {
					contentType: 'text/html',
					content: markup3,
				},
			},
		);
	}
}
