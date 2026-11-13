// Helper: /css/support/parsing-testcommon.js.
import type { CompatibilityContext } from '../../../../shared/context.ts';
import { test_invalid_value } from '../../support/parsing-testcommon.js.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	const values: [string, string][] = [
		['padding', 'auto'],
		['padding', 'available'],
		['padding', '10px border-box'],
		['padding', 'calc(2em + 3ex) auto'],
		['padding', '10px 20px 30px 40px 50px'],
		['padding-top', 'auto'],
		['padding-bottom', '10px 20px calc(2em + 3ex) auto'],
		['padding-bottom-left', '10px 20px'],
		['padding-top', '-10px'],
		['padding-right', '-20%'],
	];
	for (const [property, value] of values) {
		context.test(
			`e.style['${property}'] = ${JSON.stringify(value)} should not set the property value`,
			({ document }) => {
				test_invalid_value({ document, expect }, property, value);
			},
		);
	}
}
