// Author: Sam Weinig <weinig@apple.com>.
// Helper: /css/support/parsing-testcommon.js.
import type { CompatibilityContext } from '../../../../shared/context.ts';
import { test_invalid_value } from '../../support/parsing-testcommon.js.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	const tests = [
		['hwba(120 30% 50%)', 'HWB syntax does not have the hwba function'],
		['hwba(120 30% 50% / 0.5)', 'HWB syntax does not have the hwba function'],
		['hwb(90deg, 50%, 50%)', 'HWB value with commas should not be parsed'],
		['hwb(90deg, 50%, 50%, 0.2)', 'HWB value with commas should not be parsed'],
		['hwb(90, 50%, 50%)', 'HWB value with commas should not be parsed'],
		['hwb(90, 50%, 50%, 0.2)', 'HWB value with commas should not be parsed'],
	] as const;

	for (const [value] of tests) {
		context.test(
			`e.style['color'] = ${JSON.stringify(value)} should not set the property value`,
			({ document }) => {
				test_invalid_value({ document, expect }, 'color', value);
			},
		);
	}
}
