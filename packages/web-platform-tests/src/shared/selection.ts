import type { DOMFixtureOptions } from './fixture.ts';

/** Source globs select files; arrays select exact case names or regular expressions within them. */
export type WPTSelectors = Readonly<Record<string, true | readonly (string | RegExp)[]>>;

/** All adapted cases run by default. Explicit includes override exclusions. */
export interface WPTConfig<D = unknown> {
	/** Bindings for the implementation, optionally resolved for each fresh document. */
	globals?: DOMFixtureOptions<D>['globals'];
	include?: WPTSelectors;
	exclude?: WPTSelectors;
}

/** Invalid or stale test selection. */
export class CompatibilityConfigurationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'CompatibilityConfigurationError';
	}
}

interface WPTCase {
	source: string;
	name: string;
}

function sourcePattern(pattern: string): RegExp {
	let expression = '^';
	for (let index = 0; index < pattern.length; index++) {
		const character = pattern[index]!;
		if (character === '*') {
			if (pattern[index + 1] === '*') {
				index++;
				if (pattern[index + 1] === '/') {
					index++;
					expression += '(?:.*/)?';
				} else expression += '.*';
			} else expression += '[^/]*';
		} else expression += character.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&');
	}
	return new RegExp(expression + '$');
}

function matches<T extends WPTCase>(
	cases: readonly T[],
	{ selectors, kind }: { selectors: WPTSelectors | undefined; kind: 'include' | 'exclude' },
): Set<T> {
	const selected = new Set<T>();
	if (selectors === undefined) return selected;
	if (!selectors || typeof selectors !== 'object' || Array.isArray(selectors))
		throw new CompatibilityConfigurationError(
			`${kind} must map source paths to true or case selectors`,
		);
	for (const [source, names] of Object.entries(selectors)) {
		if (!source || (names !== true && (!Array.isArray(names) || names.length === 0)))
			throw new CompatibilityConfigurationError(
				`Invalid ${kind} selector for ${JSON.stringify(source)}`,
			);
		const pattern = sourcePattern(source);
		const sourceCases = cases.filter((test) => pattern.test(test.source));
		if (sourceCases.length === 0)
			throw new CompatibilityConfigurationError(
				`${kind} source ${JSON.stringify(source)} matched no WPT tests`,
			);
		if (names === true) {
			for (const test of sourceCases) selected.add(test);
			continue;
		}
		for (const name of names) {
			if ((typeof name !== 'string' || name.length === 0) && !(name instanceof RegExp))
				throw new CompatibilityConfigurationError(`Invalid ${kind} case selector for ${source}`);
			const expression = name instanceof RegExp ? new RegExp(name.source, name.flags) : undefined;
			let found = false;
			for (const test of sourceCases) {
				if (expression) expression.lastIndex = 0;
				if (expression ? expression.test(test.name) : test.name === name) {
					selected.add(test);
					found = true;
				}
			}
			if (!found)
				throw new CompatibilityConfigurationError(
					`${kind} case ${String(name)} in ${source} matched no WPT tests`,
				);
		}
	}
	return selected;
}

/** Validate against the whole catalogue before applying either list. */
export function selectTests<T extends WPTCase>(
	cases: readonly T[],
	config: Pick<WPTConfig, 'include' | 'exclude'> = {},
): T[] {
	const included = matches(cases, { selectors: config.include, kind: 'include' });
	const excluded = matches(cases, { selectors: config.exclude, kind: 'exclude' });
	return cases.filter((test) => included.has(test) || !excluded.has(test));
}
