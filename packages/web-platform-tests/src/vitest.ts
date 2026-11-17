import { access, readdir } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadConfigFromFile, normalizePath, type Plugin } from 'vite';
import { startVitest, type Vitest } from 'vitest/node';
import { defineConfig } from 'vitest/config';
import type { WPTConfig, WPTSelectors } from './config.ts';
import { matchesSource, selectsFile } from './vitest/selection.ts';

export interface RunWPTOptions {
	config: string;
	files?: string[];
	namePattern?: string;
}

class WPTConfigurationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'WPTConfigurationError';
	}
}

function validateSelectors(
	selectors: WPTSelectors | undefined,
	{ files, kind }: { files: string[]; kind: string },
): void {
	if (selectors === undefined) {
		return;
	}
	if (!selectors || typeof selectors !== 'object' || Array.isArray(selectors)) {
		throw new WPTConfigurationError(`${kind} must map source paths to true or case selectors`);
	}
	for (const [pattern, cases] of Object.entries(selectors)) {
		if (!pattern || (cases !== true && (!Array.isArray(cases) || cases.length === 0))) {
			throw new WPTConfigurationError(`Invalid ${kind} selector for ${JSON.stringify(pattern)}`);
		}
		if (!files.some((file) => matchesSource(file, pattern))) {
			throw new WPTConfigurationError(
				`${kind} source ${JSON.stringify(pattern)} matched no WPT files`,
			);
		}
		if (cases !== true) {
			for (const selector of cases) {
				if (
					(typeof selector !== 'string' || selector.length === 0) &&
					!(selector instanceof RegExp)
				) {
					throw new WPTConfigurationError(`Invalid ${kind} case selector for ${pattern}`);
				}
			}
		}
	}
}

function wptTransform(options: { sourceRoot: string; files: string[] }): Plugin {
	const files = new Set(
		options.files.map((file) => normalizePath(`${options.sourceRoot}/${file}`)),
	);
	const runner = normalizePath(
		fileURLToPath(import.meta.resolve('@bomb.sh/web-platform-tests/vitest/runner')),
	);
	return {
		name: 'wpt-html-tests',
		enforce: 'pre',
		configureVitest({ defineCacheKeyGenerator }) {
			// The upstream file's contents do not include this generated test module.
			defineCacheKeyGenerator(({ id }) => (files.has(normalizePath(id)) ? false : undefined));
		},
		transform(_source, id) {
			if (!files.has(normalizePath(id))) {
				return;
			}
			return {
				code: [
					`import { registerWPTFile } from ${JSON.stringify(runner)};`,
					`await registerWPTFile(${JSON.stringify(id)});`,
				].join('\n'),
				map: null,
			};
		},
	};
}

/** Run selected upstream files with the package's Vitest configuration. */
export async function runWPT(options: RunWPTOptions): Promise<Vitest> {
	const configFile = fileURLToPath(pathToFileURL(options.config));
	const packageRoot = new URL(
		'./',
		import.meta.resolve('@bomb.sh/web-platform-tests/package.json'),
	);
	const sourceRoot = fileURLToPath(new URL('wpt', packageRoot));
	try {
		await access(new URL('wpt/resources/testharness.js', packageRoot));
	} catch {
		throw new WPTConfigurationError(
			'WPT checkout is missing. Run git submodule update --init --recursive.',
		);
	}
	if (options.namePattern !== undefined) {
		RegExp(options.namePattern);
	}
	const loaded = await loadConfigFromFile({ command: 'serve', mode: 'test' }, configFile);
	if (!loaded) {
		throw new WPTConfigurationError(`Unable to load WPT configuration ${configFile}`);
	}
	const config = loaded.config as unknown as WPTConfig;
	if (typeof config.createDocument !== 'function') {
		throw new WPTConfigurationError('WPT configuration must provide createDocument().');
	}
	if (config.timeout !== undefined && (!Number.isFinite(config.timeout) || config.timeout <= 0)) {
		throw new WPTConfigurationError('WPT timeout must be a positive number of milliseconds.');
	}
	const files = (await readdir(sourceRoot, { recursive: true }))
		.map((file) => normalizePath(file))
		.filter((file) => /(?:\.html|\.any\.js|\.window\.js)$/.test(file));
	validateSelectors(config.include, { files, kind: 'include' });
	validateSelectors(config.exclude, { files, kind: 'exclude' });
	const included = files.filter((file) => selectsFile(file, config));
	if (included.length === 0) {
		throw new WPTConfigurationError('WPT configuration selected no files.');
	}
	const vitest = await startVitest(
		options.files ?? [],
		{ config: false, run: true },
		defineConfig({
			root: sourceRoot,
			cacheDir: fileURLToPath(new URL('node_modules/.vite/wpt', packageRoot)),
			plugins: [wptTransform({ sourceRoot, files: included })],
			test: {
				include: included,
				provide: { wpt: { configFile, sourceRoot, namePattern: options.namePattern } },
				environment: 'node',
				// Each upstream file owns its script globals and top-level lexical bindings.
				pool: 'forks',
				isolate: true,
				maxWorkers: 1,
				passWithNoTests: true,
				experimental: { viteModuleRunner: true },
			},
		}),
	);
	if (vitest.state.getFiles().length === 0) {
		await vitest.close();
		throw new WPTConfigurationError('No configured WPT files matched the filename filters.');
	}
	return vitest;
}
