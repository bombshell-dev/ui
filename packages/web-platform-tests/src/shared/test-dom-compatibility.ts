import type { CompatibilityRunner, CompatibilityTestOptions, DOMFixture } from './context.ts';
import { withFixture, type DOMFixtureOptions } from './fixture.ts';
import { registry } from './registry.ts';
import { selectTests, type WPTConfig } from './selection.ts';

export { CompatibilityConfigurationError } from './selection.ts';
export type { WPTConfig, WPTSelectors } from './selection.ts';

export interface DOMCompatibilityOptions<D> extends Omit<DOMFixtureOptions<D>, 'globals'> {
	runner: CompatibilityRunner;
	/** Omit to run every adapted case. */
	config?: WPTConfig<D>;
}

interface RegisteredCase {
	source: string;
	name: string;
	run(fixture: DOMFixture): void | Promise<void>;
	options: CompatibilityTestOptions;
}

/** Select upstream files and cases independently; supporting APIs are exercised by each case. */
export function testDOMCompatibility<D>(options: DOMCompatibilityOptions<D>): void {
	const cases: RegisteredCase[] = [];
	for (const [source, leaf] of Object.entries(registry)) {
		leaf.register({
			runner: options.runner,
			test(name, run, request = {}) {
				cases.push({ source, name, run, options: request });
			},
		});
	}
	const groups = new Map<string, RegisteredCase[]>();
	for (const test of selectTests(cases, options.config)) {
		const group = groups.get(test.source) ?? [];
		group.push(test);
		groups.set(test.source, group);
	}
	if (groups.size === 0) {
		options.runner.it.todo('implement DOM features and enable their WPT cases');
		return;
	}
	for (const [source, tests] of groups) {
		options.runner.describe(source, () => {
			for (const test of tests)
				options.runner.it(test.name, () =>
					withFixture(
						{
							...options,
							globals: options.config?.globals ?? {},
							document: test.options.document,
						},
						test.run,
					),
				);
		});
	}
}
