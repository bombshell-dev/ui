// Helper: /css/support/parsing-testcommon.js.
import type { CompatibilityContext } from '../../../../shared/context.ts';
import { test_invalid_value } from '../../support/parsing-testcommon.js.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	for (const colorSpace of ['lab', 'oklab']) {
		for (const value of [
			`${colorSpace}(0% 0 0 1)`,
			`${colorSpace}(0% 0 0 10%)`,
			`${colorSpace}(0% 0 0deg)`,
			`${colorSpace}(0% 0% 0deg)`,
			`${colorSpace}(40% 0 0deg)`,
			`color(${colorSpace} 20% 0 10 / 50%)`,
		]) {
			context.test(
				`e.style['color'] = ${JSON.stringify(value)} should not set the property value`,
				({ document }) => {
					test_invalid_value({ document, expect }, 'color', value);
				},
			);
		}
	}

	for (const colorSpace of ['lch', 'oklch']) {
		for (const value of [
			`${colorSpace}(20% 10 10deg 10)`,
			`${colorSpace}(20% 10 10deg 10 / 0.5)`,
			`color(${colorSpace} 20% 0 10 / 50%)`,
		]) {
			context.test(
				`e.style['color'] = ${JSON.stringify(value)} should not set the property value`,
				({ document }) => {
					test_invalid_value({ document, expect }, 'color', value);
				},
			);
		}
	}
}
