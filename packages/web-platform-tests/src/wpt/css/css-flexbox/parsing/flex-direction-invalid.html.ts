// Author: Eric Willigers <ericwilligers@chromium.org>.
import type { CompatibilityContext } from '../../../../shared/context.ts';
import { test_invalid_value } from '../../support/parsing-testcommon.js.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	for (const value of ['auto', 'column row-reverse']) {
		context.test(
			`e.style['flex-direction'] = ${JSON.stringify(value)} should not set the property value`,
			({ document }) => {
				test_invalid_value({ document, expect }, 'flex-direction', value);
			},
		);
	}
}
