// The former registry exposed case names without running their assertions. With original WPT
// sources, collect those names in Chromium, then apply the same profile-resolution checks.
import { chromium, type Browser } from 'playwright';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
	features,
	featureSelectors,
	framework,
	frameworks,
	type DOMFeature,
	type Framework,
	type WPTSelectors,
} from '../src/index.ts';
import { matchesName } from '../src/vitest/selection.ts';
import { runInBrowser, type HarnessResult } from './browser.ts';

describe('framework selector resolution', () => {
	let browser: Browser | undefined;
	const results = new Map<string, Promise<HarnessResult>>();

	beforeAll(async () => {
		browser = await chromium.launch();
	}, 30_000);

	afterAll(async () => {
		await browser?.close();
	});

	function run(source: string): Promise<HarnessResult> {
		let result = results.get(source);
		if (result === undefined) {
			result = runInBrowser(browser!, source);
			results.set(source, result);
		}
		return result;
	}

	async function resolve(selectors: WPTSelectors): Promise<void> {
		expect(Object.keys(selectors).length).toBeGreaterThan(0);
		for (const [source, cases] of Object.entries(selectors)) {
			const { tests } = await run(source);
			expect(tests.length, `${source} registers original WPT cases`).toBeGreaterThan(0);
			if (cases === true) continue;
			expect(cases.length, `${source} selects original WPT cases`).toBeGreaterThan(0);
			for (const selector of cases) {
				expect(
					tests.some(({ name }) => matchesName(name, selector)),
					`${String(selector)} matched no original WPT cases in ${source}`,
				).toBe(true);
			}
		}
	}

	describe('feature selectors', () => {
		for (const [name, selectors] of Object.entries(features)) {
			if (Object.keys(selectors).length === 0) continue;
			it(`${name} matches original WPT cases`, async () => {
				await resolve(featureSelectors([name as DOMFeature]));
			}, 45_000);
		}
	});

	describe('framework profiles', () => {
		for (const [name, profile] of Object.entries(frameworks)) {
			it(`${name} resolves required selections`, async () => {
				await resolve(framework(name as Framework));
			}, 45_000);
			for (const module of Object.keys(profile.optional)) {
				it(`${name}/${module} resolves optional selections`, async () => {
					await resolve(framework(name as Framework, [module]));
				}, 45_000);
			}
		}
	});
});
