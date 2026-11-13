// Author: Eric Willigers <ericwilligers@chromium.org>.
import type { CompatibilityContext } from '../../../../shared/context.ts';
import { test_valid_value } from '../../support/parsing-testcommon.js.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	for (const value of ['row', 'row-reverse', 'column', 'column-reverse']) {
		context.test(
			`e.style['flex-direction'] = ${JSON.stringify(value)} should set the property value`,
			({ document }) => {
				test_valid_value({ document, expect }, 'flex-direction', value);
			},
		);
	}
}
