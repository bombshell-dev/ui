import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import type { Browser } from 'playwright';

interface HarnessStatus {
	status: number;
	message: string | null;
}

export interface HarnessResult {
	tests: { name: string }[];
	status: HarnessStatus;
}

interface ProfileWindow extends Window {
	completion_callback?(tests: HarnessResult['tests'], status: HarnessStatus): void;
	profileResult?: HarnessResult;
}

class BrowserWPTError extends Error {
	readonly source: string;

	constructor(source: string, message: string) {
		super(`${source}: ${message}`);
		this.name = 'BrowserWPTError';
		this.source = source;
	}
}

const sourceRoot = new URL('../wpt/', import.meta.url);
const origin = 'https://web-platform.test';

/** Run the original source and all its subtests to collect framework case names. */
export async function runInBrowser(browser: Browser, source: string): Promise<HarnessResult> {
	const wrapper = source.endsWith('.any.js') ? await windowWrapper(source) : undefined;
	if (wrapper === undefined && !source.endsWith('.html')) {
		throw new BrowserWPTError(source, 'Unsupported browser WPT source');
	}
	const entry = wrapper === undefined ? source : source.replace(/\.js$/, '.html');
	const context = await browser.newContext();
	const loadErrors: string[] = [];
	try {
		// Serve the checkout unchanged, including its harness, reporter, helpers, and iframes.
		await context.route('**/*', async (route) => {
			const request = route.request();
			const required = ['script', 'document', 'stylesheet'].includes(request.resourceType());
			const url = new URL(request.url());
			const file = new URL(url.pathname.slice(1), sourceRoot);
			if (url.origin !== origin || !file.href.startsWith(sourceRoot.href)) {
				if (required) loadErrors.push(`Unsupported WPT resource: ${url.href}`);
				await route.abort();
				return;
			}
			if (wrapper !== undefined && url.pathname === `/${entry}`) {
				await route.fulfill({ contentType: 'text/html', body: wrapper });
				return;
			}
			try {
				await route.fulfill({ path: fileURLToPath(file) });
			} catch (error) {
				// CSS URL tests can request directory URLs as images; their bytes are not fixtures.
				if (required) loadErrors.push(`${url.href}: ${String(error)}`);
				await route.fulfill({ status: 404, body: 'Not found' });
			}
		});
		const page = await context.newPage();
		await page.addInitScript(() => {
			const target = window as ProfileWindow;
			// testharness.js calls this reporting hook after all original tests finish.
			target.completion_callback = (tests, harnessStatus) => {
				// Ignore child-window reports, whose arrays belong to a different realm.
				// oxlint-disable-next-line unicorn/no-instanceof-builtins -- Array.isArray accepts child realms too.
				if (!(tests instanceof Array)) return;
				target.profileResult = {
					tests: tests.map(({ name }) => ({ name })),
					status: { status: harnessStatus.status, message: harnessStatus.message },
				};
			};
		});
		// The upstream harness handles script errors, including tests that deliberately throw.
		await page.goto(`${origin}/${entry}`, { timeout: 15_000 });
		await page.waitForFunction(
			() => (window as ProfileWindow).profileResult !== undefined,
			undefined,
			{ timeout: 15_000 },
		);
		const result = await page.evaluate(() => (window as ProfileWindow).profileResult!);
		if (loadErrors.length > 0) {
			throw new BrowserWPTError(source, loadErrors.join('\n'));
		}
		if (result.status.status !== 0) {
			throw new BrowserWPTError(source, `WPT harness failed: ${result.status.message}`);
		}
		return result;
	} finally {
		await context.close();
	}
}

/** Use the pinned upstream window wrapper for .any.js sources, without copying test code. */
async function windowWrapper(source: string): Promise<string> {
	const code = await readFile(new URL(source, sourceRoot), 'utf8');
	const metadata: string[] = [];
	for (const [, key, value] of code.matchAll(/^\/\/\s*META:\s*(\w+)\s*=\s*(.*?)\s*$/gm)) {
		// Current profile sources only declare titles. New metadata needs explicit support.
		if (key !== 'title') {
			throw new BrowserWPTError(source, `Unsupported browser WPT metadata ${key}`);
		}
		metadata.push(`<title>${value!.replaceAll('&', '&amp;').replaceAll('<', '&lt;')}</title>`);
	}
	const upstream = await readFile(new URL('tools/serve/serve.py', sourceRoot), 'utf8');
	const template =
		/class AnyHtmlHandler\(HtmlWrapperHandler\):[\s\S]*?wrapper = """([\s\S]*?)"""/.exec(
			upstream,
		)?.[1];
	if (template === undefined) {
		throw new BrowserWPTError(source, 'Cannot find the upstream WPT window wrapper');
	}
	return template
		.replaceAll('%(meta)s', metadata.join('\n'))
		.replaceAll('%(script)s', '')
		.replaceAll('%(path)s', `/${source}`);
}
