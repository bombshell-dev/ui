import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	{
		const content = `<!DOCTYPE html>
<meta charset='utf-8'>





<button name=outerNamed value=GO form='myform'></button>
<form id='myform' onsubmit='return false'>
  <input name=n1 value=v1>
  <button name=named value=GO></button>
  <button id=unnamed value=unnamed></button>
  <button form="another" name=unassociated value=unassociated></button>
  <input type=image name=namedImage src='/media/1x1-green.png'>
  <input type=image id=unnamedImage src='/media/1x1-green.png'>
  <input type=image name=unactivatedImage src='/media/1x1-green.png'>
  <input name=n3 value=v3>
</form>

<form id='another'>
  <button name=unassociated2 value=unassociated></button>
</form>


`;
		function assertFormDataEntries(formData: FormData, expectedEntries: [string, string][]) {
			const expectedEntryNames = expectedEntries.map((entry) => entry[0]);
			const actualEntries = [...formData.entries()];
			const actualEntryNames = actualEntries.map((entry) => entry[0]);
			{
				const actual = actualEntryNames;
				const expected = expectedEntryNames;
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
			for (let i = 0; i < actualEntries.length; i++) {
				{
					const actual = actualEntries[i]!;
					const expected = expectedEntries[i]!;
					expect(actual.length).toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(actual[index]).toBe(expected[index]);
				}
			}
		}

		context.test(
			'FormData construction should allow a null submitter',
			({ document, FormData }) => {
				const form = document.querySelector<HTMLFormElement>('#myform')!;

				assertFormDataEntries(new FormData(form, null), [
					['n1', 'v1'],
					['n3', 'v3'],
				]);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'FormData construction should allow an undefined form and an undefined submitter',
			({ document, FormData }) => {
				const form = document.querySelector<HTMLFormElement>('#myform')!;

				assertFormDataEntries(new FormData(undefined, undefined), []);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'FormData construction should allow an undefined form and a null submitter',
			({ document, FormData }) => {
				const form = document.querySelector<HTMLFormElement>('#myform')!;

				assertFormDataEntries(new FormData(undefined, null), []);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'FormData construction should throw a TypeError if a non-null submitter is not a submit button',
			({ document, FormData, TypeError }) => {
				const form = document.querySelector<HTMLFormElement>('#myform')!;

				expect(() => new FormData(form, document.querySelector<HTMLElement>('[name=n1]')!)).toThrow(
					expect.objectContaining({ constructor: TypeError }),
				);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			"FormData construction should throw a 'NotFoundError' DOMException if a non-null submitter is not owned by the form",
			({ document, FormData, DOMException }) => {
				const form = document.querySelector<HTMLFormElement>('#myform')!;

				expect(
					() => new FormData(form, document.querySelector<HTMLElement>('[name=unassociated]')!),
				).toThrow(
					expect.objectContaining({
						name: 'NotFoundError',
						code: 8,
						constructor: DOMException,
					}),
				);
				expect(
					() => new FormData(form, document.querySelector<HTMLElement>('[name=unassociated2]')!),
				).toThrow(
					expect.objectContaining({
						name: 'NotFoundError',
						code: 8,
						constructor: DOMException,
					}),
				);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'The constructed FormData object should contain an in-tree-order entry for a named submit button submitter',
			({ document, FormData }) => {
				const form = document.querySelector<HTMLFormElement>('#myform')!;

				assertFormDataEntries(
					new FormData(form, document.querySelector<HTMLElement>('[name=named]')!),
					[
						['n1', 'v1'],
						['named', 'GO'],
						['n3', 'v3'],
					],
				);
				assertFormDataEntries(
					new FormData(form, document.querySelector<HTMLElement>('[name=outerNamed]')!),
					[
						['outerNamed', 'GO'],
						['n1', 'v1'],
						['n3', 'v3'],
					],
				);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'The constructed FormData object should not contain an entry for an unnamed submit button submitter',
			({ document, FormData }) => {
				const form = document.querySelector<HTMLFormElement>('#myform')!;

				assertFormDataEntries(
					new FormData(form, document.querySelector<HTMLElement>('#unnamed')!),
					[
						['n1', 'v1'],
						['n3', 'v3'],
					],
				);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'The constructed FormData object should contain in-tree-order entries for an activated Image Button submitter',
			({ document, FormData }) => {
				const form = document.querySelector<HTMLFormElement>('#myform')!;

				const submitter1 = document.querySelector<HTMLElement>('[name=namedImage]')!;
				submitter1.click();
				const submitter2 = document.querySelector<HTMLElement>('#unnamedImage')!;
				submitter2.click();
				assertFormDataEntries(new FormData(form, submitter1), [
					['n1', 'v1'],
					['namedImage.x', '0'],
					['namedImage.y', '0'],
					['n3', 'v3'],
				]);
				assertFormDataEntries(new FormData(form, submitter2), [
					['n1', 'v1'],
					['x', '0'],
					['y', '0'],
					['n3', 'v3'],
				]);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'The constructed FormData object should contain in-tree-order entries for an unactivated Image Button submitter',
			({ document, FormData }) => {
				const form = document.querySelector<HTMLFormElement>('#myform')!;

				assertFormDataEntries(
					new FormData(form, document.querySelector<HTMLElement>('[name=unactivatedImage]')!),
					[
						['n1', 'v1'],
						['unactivatedImage.x', '0'],
						['unactivatedImage.y', '0'],
						['n3', 'v3'],
					],
				);
			},
			{ document: { contentType: 'text/html', content } },
		);
	}
}
