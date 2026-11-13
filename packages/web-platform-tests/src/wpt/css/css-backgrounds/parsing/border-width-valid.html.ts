// Author: Eric Willigers <ericwilligers@chromium.org>.
// Helper: /css/support/parsing-testcommon.js.
import type { CompatibilityContext } from '../../../../shared/context.ts';
import { test_valid_value } from '../../support/parsing-testcommon.js.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	const values: [string, string, string?][] = [
		['border-width', '1em'],
		['border-width', '2px thin medium thick'],
		['border-top-width', '0px'],
		['border-right-width', 'thin'],
		['border-bottom-width', 'medium'],
		['border-left-width', 'thick'],
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
