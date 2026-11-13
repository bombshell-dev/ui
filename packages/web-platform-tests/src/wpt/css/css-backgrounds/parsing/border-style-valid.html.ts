// Author: Eric Willigers <ericwilligers@chromium.org>.
// Helper: /css/support/parsing-testcommon.js.
import type { CompatibilityContext } from '../../../../shared/context.ts';
import { test_valid_value } from '../../support/parsing-testcommon.js.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	const values: [string, string, string?][] = [
		['border-style', 'none'],
		['border-style', 'none hidden dotted dashed'],
		['border-style', 'solid double groove ridge'],
		['border-style', 'inset outset'],
		['border-top-style', 'solid'],
		['border-right-style', 'double'],
		['border-bottom-style', 'groove'],
		['border-left-style', 'ridge'],
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
