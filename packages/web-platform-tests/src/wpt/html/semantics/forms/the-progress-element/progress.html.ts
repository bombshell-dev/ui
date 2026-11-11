import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	const content = `<!doctype html><body>
    <div id="log"></div>

    <progress id="indeterminate"></progress>
    <progress id="removevalue" value="0.5"></progress>
    <progress id="quarter" value="1" max="4"></progress>
    <progress id="largerthanmax" value="2"></progress>
    <progress id="invalidmax" value="1" max="a"></progress>
    <progress id="negativemax" value="1" max="-1"></progress>
    <progress id="invalidvalue" value="a"></progress>
    <progress id="negativevalue" value="-1"></progress>

    </body>`;
	context.test(
		'Indeterminate progress bar should have position -1',
		({ document }) => {
			const indeterminate = document.getElementById('indeterminate') as HTMLProgressElement;

			expect(indeterminate.position).toBe(-1);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'Revoming the value attribute makes an intermediate progress bar, which should have position -1',
		({ document }) => {
			const removevalue = document.getElementById('removevalue') as HTMLProgressElement;

			removevalue.removeAttribute('value');
			expect(removevalue.position).toBe(-1);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'Determinate progress bar should have fractional position',
		({ document }) => {
			const quarter = document.getElementById('quarter') as HTMLProgressElement;

			expect(quarter.position).toBe(quarter.value / quarter.max);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'Indeterminate progress bar should have value 0',
		({ document }) => {
			const indeterminate = document.getElementById('indeterminate') as HTMLProgressElement;

			expect(indeterminate.value).toBe(0);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'Value must equal max if the parsed value is larger than max',
		({ document }) => {
			const largerthanmax = document.getElementById('largerthanmax') as HTMLProgressElement;

			expect(largerthanmax.value).toBe(1);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'Max must be 1 by default',
		({ document }) => {
			const indeterminate = document.getElementById('indeterminate') as HTMLProgressElement;

			expect(indeterminate.max).toBe(1);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'Max must be 1 by default, even if value is specified',
		({ document }) => {
			const largerthanmax = document.getElementById('largerthanmax') as HTMLProgressElement;

			expect(largerthanmax.max).toBe(1);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'Max must be 1 if max value is invalid',
		({ document }) => {
			const invalidmax = document.getElementById('invalidmax') as HTMLProgressElement;

			expect(invalidmax.max).toBe(1);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'Max must be 1 if the parsed max value is less than or equal to zero',
		({ document }) => {
			const negativemax = document.getElementById('negativemax') as HTMLProgressElement;

			expect(negativemax.max).toBe(1);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'Value must be 0 if value is invalid',
		({ document }) => {
			const invalidvalue = document.getElementById('invalidvalue') as HTMLProgressElement;

			expect(invalidvalue.value).toBe(0);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'Value must be 0 if the parsed value is less than or equal to zero',
		({ document }) => {
			const negativevalue = document.getElementById('negativevalue') as HTMLProgressElement;

			expect(negativevalue.value).toBe(0);
		},
		{ document: { contentType: 'text/html', content } },
	);
}
