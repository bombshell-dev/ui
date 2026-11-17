import { pathToFileURL } from 'node:url';
import { inject, test } from 'vitest';
import type { WPTConfig } from '../config.ts';
import { runWPTFile } from '../node/isolated.ts';
import { matchesName, matchesSource, selectsTest } from './selection.ts';

declare module 'vitest' {
	export interface ProvidedContext {
		wpt: {
			configFile: string;
			sourceRoot: string;
			namePattern?: string;
		};
	}
}

class WPTFailure extends Error {
	constructor(message: string, stack?: string | null) {
		super(message);
		this.name = 'WPTFailure';
		if (stack) {
			this.stack = `${this.name}: ${message}\n${stack}`;
		}
	}
}

/** Execute upstream once during collection, then register only selected results. */
export async function registerWPTFile(file: string): Promise<void> {
	const { configFile, sourceRoot, namePattern } = inject('wpt');
	const { default: config } = (await import(configFile)) as { default: WPTConfig };
	const source = decodeURIComponent(
		pathToFileURL(file).href.slice(pathToFileURL(`${sourceRoot}/`).href.length),
	);
	const result = await runWPTFile({ file, sourceRoot, configFile, timeout: config.timeout });
	const expression = namePattern === undefined ? undefined : new RegExp(namePattern);

	// Exact file selectors can be checked here without executing unrelated files.
	for (const [kind, selectors] of Object.entries({
		include: config.include,
		exclude: config.exclude,
	})) {
		for (const [pattern, cases] of Object.entries(selectors ?? {})) {
			if (
				result.status.status !== 0 ||
				pattern.includes('*') ||
				!matchesSource(source, pattern) ||
				cases === true
			) {
				continue;
			}
			for (const selector of cases) {
				if (!result.tests.some((entry) => matchesName(entry.name, selector))) {
					test(`WPT configuration: ${kind} case ${String(selector)}`, () => {
						throw new WPTFailure(
							`${kind} case ${String(selector)} in ${source} matched no WPT tests`,
						);
					});
				}
			}
		}
	}

	for (const entry of result.tests) {
		if (!selectsTest({ source, name: entry.name }, config)) {
			continue;
		}
		if (expression && !expression.test(entry.name)) {
			continue;
		}
		test(entry.name, () => {
			if (entry.status !== 0) {
				throw new WPTFailure(entry.message || `WPT status ${entry.status}`, entry.stack);
			}
		});
	}
	if (result.status.status !== 0) {
		test('WPT harness completion', () => {
			throw new WPTFailure(result.status.message || 'WPT harness failed', result.status.stack);
		});
	}
}
