// Helper: /css/support/parsing-testcommon.js.
import type { CompatibilityContext } from '../../../../shared/context.ts';
import { test_valid_value } from '../../support/parsing-testcommon.js.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	const values: [string, string, string?][] = [
		['padding', '10px'],
		['padding', '10px 20px 30px 40px'],
		['padding', 'calc(2em + 3ex)'],
		['padding-top', '10px'],
		['padding-right', '20px'],
		['padding-bottom', '30px'],
		['padding-left', '40px'],
		['padding', '20%'],
		['padding', '10px 20% 30% 40px'],
		['padding-right', '20%'],
		['padding-right', 'calc(2em + 3%)', 'calc(3% + 2em)'],
	];
	for (const [property, value, serializedValue = value] of values) {
		context.test(
			`e.style['${property}'] = ${JSON.stringify(value)} should set the property value`,
			({ document }) => {
				test_valid_value({ document, expect }, property, value, serializedValue);
			},
		);
	}
}
