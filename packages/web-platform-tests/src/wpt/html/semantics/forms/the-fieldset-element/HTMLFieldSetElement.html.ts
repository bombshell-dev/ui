import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	const content = `<!doctype html><div id="log"></div>
<form name="fm1" style="display:none">
  <fieldset id="fs_outer">
  <legend><input type="checkbox" name="cb"></legend>
  <input type=text name="txt" id="ctl1">
  <button id="ctl2" name="btn">BUTTON</button>
    <fieldset id="fs_inner">
      <input type="text" name="txt_inner">
      <progress name="pg" value="0.5"></progress>
    </fieldset>
  </fieldset>
</form>
`;
	context.test(
		"The type attribute must return 'fieldset'",
		({ document }) => {
			const fm1 = (document.forms as unknown as { fm1: HTMLFormElement & Record<string, Element> })
				.fm1;
			const fs_outer = document.getElementById('fs_outer') as HTMLFieldSetElement;
			const children_outer = fs_outer.elements;

			expect(fs_outer.type, 'The value of type attribute is incorrect.').toBe('fieldset');
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		"The form attribute must return the fieldset's form owner",
		({ document }) => {
			const fm1 = (document.forms as unknown as { fm1: HTMLFormElement & Record<string, Element> })
				.fm1;
			const fs_outer = document.getElementById('fs_outer') as HTMLFieldSetElement;
			const children_outer = fs_outer.elements;

			expect(fs_outer.form, 'The fieldset should have a form owner.').toBe(fm1);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'The elements must return an HTMLCollection object',
		(fixture) => {
			const { document } = fixture;
			const fm1 = (document.forms as unknown as { fm1: HTMLFormElement & Record<string, Element> })
				.fm1;
			const fs_outer = document.getElementById('fs_outer') as HTMLFieldSetElement;
			const children_outer = fs_outer.elements;
			const HTMLCollection = fixture.HTMLCollection;

			expect(
				children_outer.constructor,
				'The elements attribute should be an HTMLCollection object',
			).toBe(HTMLCollection);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'The controls must root at the fieldset element',
		({ document }) => {
			const fm1 = (document.forms as unknown as { fm1: HTMLFormElement & Record<string, Element> })
				.fm1;
			const fs_outer = document.getElementById('fs_outer') as HTMLFieldSetElement;
			const children_outer = fs_outer.elements;

			let fs_inner = document.getElementById('fs_inner') as HTMLFieldSetElement;
			let children_inner = fs_inner.elements;
			expect(
				children_inner,
				'The items in the collection must be children of the inner fieldset element.',
			).toHaveLength(1);
			expect(
				children_inner[0],
				'The items in the collection must be children of the inner fieldset element.',
			).toBe(fm1.txt_inner);
			expect(
				children_outer,
				'The items in the collection must be children of the outer fieldset element.',
			).toHaveLength(5);
			expect(
				children_outer[0],
				'The items in the collection must be children of the outer fieldset element.',
			).toBe(fm1.cb);
			expect(
				children_outer[1],
				'The items in the collection must be children of the outer fieldset element.',
			).toBe(fm1.txt);
			expect(
				children_outer[2],
				'The items in the collection must be children of the outer fieldset element.',
			).toBe(fm1.btn);
			expect(
				children_outer[3],
				'The items in the collection must be children of the outer fieldset element.',
			).toBe(fm1.fs_inner);
			expect(
				children_outer[4],
				'The items in the collection must be children of the outer fieldset element.',
			).toBe(fm1.txt_inner);
		},
		{ document: { contentType: 'text/html', content } },
	);
}
