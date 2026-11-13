// Author: Eric Willigers <ericwilligers@chromium.org>.
// Helper: /css/support/parsing-testcommon.js.
import type { CompatibilityContext } from '../../../../shared/context.ts';
import { test_valid_value } from '../../support/parsing-testcommon.js.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	const tests: ReadonlyArray<readonly [value: string, serializedValue?: string]> = [
		['currentcolor'],
		['transparent'],
		['red'],
		['magenta'],
		['#234', 'rgb(34, 51, 68)'],
		['#FEDCBA', 'rgb(254, 220, 186)'],
		['rgb(2, 3, 4)'],
		['rgb(100%, 0%, 0%)', 'rgb(255, 0, 0)'],
		['rgba(2, 3, 4, 0.5)'],
		['rgba(2, 3, 4, 50%)', 'rgba(2, 3, 4, 0.5)'],
		['hsl(120, 100%, 50%)', 'rgb(0, 255, 0)'],
		['hsla(120, 100%, 50%, 0.25)', 'rgba(0, 255, 0, 0.25)'],
		['rgb(-2, 3, 4)', 'rgb(0, 3, 4)'],
		['rgb(100, 200, 300)', 'rgb(100, 200, 255)'],
		['rgb(20, 10, 0, -10)', 'rgba(20, 10, 0, 0)'],
		['rgb(100%, 200%, 300%)', 'rgb(255, 255, 255)'],
		['light-dark(black, white)'],
	];

	for (const [value, serializedValue] of tests) {
		context.test(
			`e.style['color'] = ${JSON.stringify(value)} should set the property value`,
			({ document }) => {
				test_valid_value({ document, expect }, 'color', value, serializedValue);
			},
		);
	}
}
