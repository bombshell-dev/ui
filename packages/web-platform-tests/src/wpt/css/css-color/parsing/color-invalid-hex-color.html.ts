// Author: Chris Nardi <csnardi1@gmail.com>.
// Helper: /css/support/parsing-testcommon.js.
import type { CompatibilityContext } from '../../../../shared/context.ts';
import { test_invalid_value } from '../../support/parsing-testcommon.js.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	const tests = [
		['#', 'Should not parse invalid hex'],
		['#f', 'Should not parse invalid hex'],
		['#ff', 'Should not parse invalid hex'],
		['#ffg', 'Should not parse invalid hex'],
		['#fffg', 'Should not parse invalid hex'],
		['#fffff', 'Should not parse invalid hex'],
		['#fffffg', 'Should not parse invalid hex'],
		['#fffffff', 'Should not parse invalid hex'],
		['#fffffffg', 'Should not parse invalid hex'],
		['#fffffffff', 'Should not parse invalid hex'],
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
