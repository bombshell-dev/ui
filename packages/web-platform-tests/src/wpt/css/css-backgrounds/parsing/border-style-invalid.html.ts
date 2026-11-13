// Author: Eric Willigers <ericwilligers@chromium.org>.
// Helper: /css/support/parsing-testcommon.js.
import type { CompatibilityContext } from '../../../../shared/context.ts';
import { test_invalid_value } from '../../support/parsing-testcommon.js.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	const values: [string, string][] = [
		['border-style', 'auto'],
		['border-style', 'solid double groove ridge none'],
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
