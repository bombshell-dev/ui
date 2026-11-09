import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	{
		const content = `<!doctype html>
<meta charset="utf-8">
<title>form.elements: indexed</title>



<div id="log"></div>
<div id="test">
<form id=form>
<input type="radio" name="radio1" id="r1" value=1>
<input type="radio" name="radio2" id="r2" value=2>
</form>
</div>

`;

		context.test(
			'form.elements should be accessed correctly by index',
			({ document }) => {
				let form = document.getElementById('form') as HTMLFormElement;
				expect(form[0]).toBe(document.getElementById('r1'));
				expect(form[1]).toBe(document.getElementById('r2'));
				expect(form[2]).toBe(undefined);
				expect(form[-1]).toBe(undefined);
			},
			{ document: { contentType: 'text/html', content } },
		);

		context.test(
			'Trying to delete an indexed property name should never work',
			({ document, cleanup }) => {
				const form = document.getElementById('form') as HTMLFormElement;
				const old_item = form[0];
				const old_desc = Object.getOwnPropertyDescriptor(form, '0')!;
				expect(old_desc.value).toBe(old_item);
				expect(old_desc.enumerable).toBe(true);
				expect(old_desc.configurable).toBe(true);
				expect(old_desc.writable).toBe(false);
				const prototype = (document.defaultView as Window & typeof globalThis).Object
					.prototype as Record<number, unknown>;
				prototype[0] = 5;
				cleanup(() => {
					delete prototype[0];
				});
				expect(form[0]).toBe(old_item);
				// Reflect preserves upstream's non-strict delete in this module.
				Reflect.deleteProperty(form, '0');
				expect(form[0]).toBe(old_item);
				expect(() => {
					delete form[0];
				}).toThrow(globalThis.TypeError);
				expect(form[0]).toBe(old_item);
			},
			{ document: { contentType: 'text/html', content } },
		);
	}
}
