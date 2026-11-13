// Helper: /css/support/parsing-testcommon.js.
import type { CompatibilityContext } from '../../../../shared/context.ts';
import { test_invalid_value } from '../../support/parsing-testcommon.js.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	for (const value of ['auto', '-10px', '10px 20% 30px', 'normal 10px normal']) {
		context.test(
			`e.style['gap'] = ${JSON.stringify(value)} should not set the property value`,
			({ document }) => {
				test_invalid_value({ document, expect }, 'gap', value);
			},
		);
	}
}
