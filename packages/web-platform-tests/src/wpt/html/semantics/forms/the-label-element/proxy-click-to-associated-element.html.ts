import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	const content = `<!DOCTYPE HTML>
<title>label element click proxying via "for" attribute or nested labelable element</title>




<div id="log"></div>
<form id="test">
    <input id="foo" type="checkbox" />
    <label id="foo-label" for="foo">foo</label>

    <label id="bar-label">
        <input id="bar" type="checkbox" /> bar
        <input id="baz" type="checkbox" /> baz
    </label>

    <input id="baz" type="checkbox" />
    <label id="baz-label" for="baz">baz</label>
</form>

`;
	context.test(
		'label with for attribute should proxy click events to the associated element',
		async ({ document, step }) => {
			const label = document.getElementById('foo-label') as HTMLLabelElement;
			const input = document.getElementById('foo') as HTMLInputElement;
			await new Promise<void>((resolve) => {
				input.addEventListener(
					'click',
					step(() => resolve()),
				);
				label.click();
			});
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'label without for attribute should proxy click events to the first labelable child',
		async ({ document, step }) => {
			const label = document.getElementById('bar-label') as HTMLLabelElement;
			const input = document.getElementById('bar') as HTMLInputElement;
			await new Promise<void>((resolve) => {
				input.addEventListener(
					'click',
					step(() => resolve()),
				);
				label.click();
			});
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		"clicking a label that prevents the event's default should not proxy click events",
		async ({ document, step }) => {
			const label = document.getElementById('baz-label') as HTMLLabelElement;
			const input = document.getElementById('baz') as HTMLInputElement;
			await new Promise<void>((resolve) => {
				input.addEventListener(
					'click',
					step(() => expect.unreachable('Input should not receive click')),
				);
				label.addEventListener(
					'click',
					step((ev) => {
						ev.preventDefault();
						setTimeout(resolve, 500);
					}),
				);
				label.click();
			});
		},
		{ document: { contentType: 'text/html', content } },
	);
}
