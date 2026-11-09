import type { CompatibilityRunner } from '../../src/shared/context.ts';
import { testDOMCompatibility } from '../../src/shared/test-dom-compatibility.ts';
import { browserWPTConfig } from './wpt.config.ts';
import { createBrowserInputDriver, type BrowserInputBridge } from './input-driver.mts';

/** Native documents and bindings can enter the suite without application casts. */
export function registerBrowserCompatibility(
	runner: CompatibilityRunner,
	send: BrowserInputBridge,
): void {
	testDOMCompatibility({
		runner,
		create: () => document,
		input: (document) => createBrowserInputDriver(document, send),
		config: browserWPTConfig(runner, { input: true }),
	});
}
