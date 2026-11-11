import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	{
		const content = `<!DOCTYPE html>
<meta charset="utf-8" />
<title>Form.elements should update on form.id change</title>


<div id=log></div>

<form name="test">
  <input name="internal" form="testForm" type="hidden" />
</form>
<input name="external" form="testForm" type="hidden" />


`;

		context.test(
			'`form.elements` should update on form ID changes',
			({ document }) => {
				const form = document.forms[0]!;
				const { elements } = form;

				expect(elements.length, 'without an ID').toBe(0);

				form.id = 'testForm';
				expect(elements.length, 'with a matching ID').toBe(2);

				form.id = '';
				expect(elements.length, 'after changing to an empty ID').toBe(0);
			},
			{ document: { contentType: 'text/html', content } },
		);
	}
}
