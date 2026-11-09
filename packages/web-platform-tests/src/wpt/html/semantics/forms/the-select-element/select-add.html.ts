import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	{
		const content = `<!DOCTYPE html>
<meta charset="utf-8">
<title>HTMLSelectElement Test: add()</title>





<form style="display:none">
  <option id="testoption">
    <select id="testselect1">
    </select>
    <select id="testselect2">
      <option>TEST</option>
    </select>
  </option>
</form>


`;

		context.test(
			'test that HTMLSelectElement.add method can add option element',
			({ document, Option }) => {
				let testselect1 = document.getElementById('testselect1') as HTMLSelectElement;
				let opt1 = new Option('Marry', '1');
				testselect1.add(opt1);
				expect(testselect1.options[0]!.value).toBe('1');
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'test that HierarchyRequestError exception must be thrown when element is an ancestor of the element into which it is to be inserted',
			({ document, DOMException }) => {
				let testselect2 = document.getElementById('testselect2') as HTMLSelectElement;
				let opt2 = document.getElementById('testoption') as HTMLOptionElement;
				expect(() => {
					testselect2.add(opt2);
				}).toThrow(
					expect.objectContaining({
						name: 'HierarchyRequestError',
						code: 3,
						constructor: DOMException,
					}),
				);
			},
			{ document: { contentType: 'text/html', content } },
		);
	}
}
