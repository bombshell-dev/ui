import type { CompatibilityContext } from '../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	for (const [assignedValue, expectedValue, expectedAttribute] of [
		[false, false, null],
		[true, true, ''],
		['foo', true, ''],
		['false', true, ''],
		['', false, null],
		['until-found', 'until-found', 'until-found'],
		['UNTIL-FOUND', 'until-found', 'until-found'],
		['UnTiL-FoUnD', 'until-found', 'until-found'],
		['unt\u0131l-found', true, ''],
		['unt\u0130l-found', true, ''],
		[null, false, null],
		[undefined, false, null],
		[1, true, ''],
		[0, false, null],
		[NaN, false, null],
	] as const) {
		context.test(
			`div.hidden = ${Number.isNaN(assignedValue) ? 'NaN' : JSON.stringify(assignedValue)}`,
			({ document }) => {
				const div = document.querySelector('div')!;

				div.hidden = assignedValue as boolean | 'until-found';
				expect(
					div.hidden,
					`div.hidden = ${JSON.stringify(assignedValue)} should return ${JSON.stringify(expectedValue)}`,
				).toBe(expectedValue);
				expect(
					div.getAttribute('hidden'),
					`div.hidden = ${JSON.stringify(assignedValue)} should set the hidden attribute to ${JSON.stringify(expectedAttribute)}`,
				).toBe(expectedAttribute);
			},
			{ document: { contentType: 'text/html', content: '<!doctype html><div>hello</div>' } },
		);
	}
	for (const [assignedAttribute, expectedValue] of [
		['false', true],
		['foo', true],
	] as const) {
		context.test(
			`div.setAttribute('hidden', ${JSON.stringify(assignedAttribute)}) should make div.hidden return ${JSON.stringify(expectedValue)}`,
			({ document }) => {
				const div = document.querySelector('div')!;

				div.setAttribute('hidden', assignedAttribute);
				expect(div.hidden).toBe(expectedValue);
			},
			{ document: { contentType: 'text/html', content: '<!doctype html><div>hello</div>' } },
		);
	}
}
