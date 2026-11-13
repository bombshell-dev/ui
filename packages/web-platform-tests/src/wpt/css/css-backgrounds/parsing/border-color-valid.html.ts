// Author: Eric Willigers <ericwilligers@chromium.org>.
// Helper: /css/support/parsing-testcommon.js.
import type { CompatibilityContext } from '../../../../shared/context.ts';
import { test_valid_value } from '../../support/parsing-testcommon.js.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	const values: [string, string, string?][] = [
		['border-color', 'currentcolor', 'currentcolor'],
		['border-color', 'currentColor', 'currentcolor'],
		['border-color', 'red yellow green blue'],
		['border-top-color', 'red'],
		['border-right-color', 'yellow'],
		['border-bottom-color', 'green'],
		['border-left-color', 'blue'],
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
