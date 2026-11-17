import type { WPTConfig, WPTSelectors } from '../config.ts';

const sourcePatterns = new Map<string, RegExp>();

/** Match the upstream-relative source globs accepted by WPT configuration. */
export function matchesSource(source: string, pattern: string): boolean {
	const cached = sourcePatterns.get(pattern);
	if (cached) {
		return cached.test(source);
	}
	let expression = '^';
	for (let index = 0; index < pattern.length; index++) {
		const character = pattern[index]!;
		if (character === '*') {
			if (pattern[index + 1] === '*') {
				index++;
				if (pattern[index + 1] === '/') {
					index++;
					expression += '(?:.*/)?';
				} else {
					expression += '.*';
				}
			} else {
				expression += '[^/]*';
			}
		} else {
			expression += character.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&');
		}
	}
	const compiled = new RegExp(`${expression}$`);
	sourcePatterns.set(pattern, compiled);
	return compiled.test(source);
}

export function matchesName(name: string, selector: string | RegExp): boolean {
	if (typeof selector === 'string') {
		return name === selector;
	}
	return new RegExp(selector.source, selector.flags).test(name);
}

export function selectsFile(
	source: string,
	{ include, exclude }: Pick<WPTConfig, 'include' | 'exclude'>,
): boolean {
	if (Object.keys(include ?? {}).some((pattern) => matchesSource(source, pattern))) {
		return true;
	}
	return !Object.entries(exclude ?? {}).some(
		([pattern, cases]) => cases === true && matchesSource(source, pattern),
	);
}

export function selectsTest(
	{ source, name }: { source: string; name: string },
	{ include, exclude }: Pick<WPTConfig, 'include' | 'exclude'>,
): boolean {
	const matches = (selectors: WPTSelectors | undefined): boolean =>
		Object.entries(selectors ?? {}).some(
			([pattern, cases]) =>
				matchesSource(source, pattern) &&
				(cases === true || cases.some((selector) => matchesName(name, selector))),
		);
	return matches(include) || !matches(exclude);
}
