// Development-only registration and data audit against the pinned WPT sources.
// Usage: node scripts/check-wpt-selectors.mjs
// Options: --source-root <pinned checkout>, --offline, --json
// Downloads are cached in ignored node_modules/.cache; no reports are written.
import { deepStrictEqual } from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { pathToFileURL } from 'node:url';
import { runInNewContext } from 'node:vm';
import { chromium } from 'playwright';
import { register } from '../src/compatibility/element/selectors.ts';
import {
	invalidSelectors,
	validSelectors,
	scopedSelectors,
	TEST_QSA,
	TEST_FIND,
	TEST_MATCH,
} from '../src/compatibility/element/selectors/data.ts';
import * as fixtureMarkup from '../src/compatibility/element/selectors/fixtures.ts';

class SelectorAuditError extends Error {
	constructor(message, details = {}) {
		super(message);
		this.name = 'SelectorAuditError';
		this.details = details;
	}
}

const revision = 'b719612f963a05ece9c89a7dd7598c1c59618874';
const cacheRoot = new URL(`../node_modules/.cache/wpt-selectors/${revision}/`, import.meta.url);
const options = { offline: false, json: false, sourceRoot: undefined };
for (let index = 2; index < process.argv.length; index++) {
	const argument = process.argv[index];
	if (argument === '--offline') options.offline = true;
	else if (argument === '--json') options.json = true;
	else if (argument === '--source-root' && process.argv[index + 1])
		options.sourceRoot = pathToFileURL(`${process.argv[++index]}/`);
	else throw new SelectorAuditError(`Unknown or incomplete argument: ${argument}`);
}

// The audit discovers every matching file in dom/nodes at the pinned revision.
// CSS coverage is deliberately scoped to these two additional adapted sources.
const supplementalSources = ['css/selectors/is-where-basic.html', 'css/selectors/has-basic.html'];
const sourceExclusions = new Map([
	[
		'dom/nodes/Element-webkitMatchesSelector.html',
		'Vendor-prefixed alias; the unprefixed Element.matches matrix is adapted.',
	],
]);
const caseExclusions = new Map([
	[
		'dom/nodes/Element-matches-namespaced-elements.html',
		new Set([
			'empty string namespace, webkitMatchesSelector',
			'has a namespace, webkitMatchesSelector',
			'has a namespace, *|, webkitMatchesSelector',
		]),
	],
]);
const bootstrapSources = new Set([
	'dom/nodes/ParentNode-querySelector-All.html',
	'dom/nodes/ParentNode-querySelector-All-xht.xht',
	'dom/nodes/Element-matches.html',
]);
const directoryPromises = new Map();
const sourcePromises = new Map();

async function optionalRead(path) {
	try {
		return await readFile(path);
	} catch (error) {
		if (error.code !== 'ENOENT') throw error;
		return undefined;
	}
}

async function download(url) {
	if (options.offline) throw new SelectorAuditError(`Not cached in offline mode: ${url}`);
	const response = await fetch(url, {
		headers: { 'User-Agent': '@bomb.sh/web-platform-tests WPT selector audit' },
		signal: AbortSignal.timeout(30_000),
	});
	if (!response.ok)
		throw new SelectorAuditError(`${response.status} ${response.statusText}: ${url}`);
	return Buffer.from(await response.arrayBuffer());
}

async function directory(path) {
	if (!directoryPromises.has(path)) {
		directoryPromises.set(
			path,
			(async () => {
				const cachePath = new URL(`directories/${path}.json`, cacheRoot);
				let data = await optionalRead(cachePath);
				if (!data) {
					data = await download(
						`https://api.github.com/repos/web-platform-tests/wpt/contents/${path}?ref=${revision}`,
					);
					await mkdir(new URL('./', cachePath), { recursive: true });
					await writeFile(cachePath, data);
				}
				const entries = JSON.parse(data.toString());
				// GitHub's contents API truncates at 1,000 files. Never accept a partial listing.
				if (!Array.isArray(entries) || entries.length >= 1_000)
					throw new SelectorAuditError(`Incomplete upstream directory listing: ${path}`);
				return entries;
			})(),
		);
	}
	return directoryPromises.get(path);
}

async function source(path) {
	if (!sourcePromises.has(path)) {
		sourcePromises.set(
			path,
			(async () => {
				const entry = (await directory(path.split('/').slice(0, -1).join('/'))).find(
					(item) => item.path === path,
				);
				if (!entry || entry.type !== 'file')
					throw new SelectorAuditError(`Unknown pinned WPT file: ${path}`, { missing: true });
				const cachePath = new URL(`sources/${path}`, cacheRoot);
				const local = options.sourceRoot && (await optionalRead(new URL(path, options.sourceRoot)));
				const cached = await optionalRead(cachePath);
				const data =
					local ||
					cached ||
					(await download(
						`https://raw.githubusercontent.com/web-platform-tests/wpt/${revision}/${path}`,
					));
				const hash = createHash('sha1').update(`blob ${data.length}\0`).update(data).digest('hex');
				if (hash !== entry.sha)
					throw new SelectorAuditError(`Source does not match pinned Git blob: ${path}`);
				if (!cached) {
					await mkdir(new URL('./', cachePath), { recursive: true });
					await writeFile(cachePath, data);
				}
				return data.toString();
			})(),
		);
	}
	return sourcePromises.get(path);
}

function difference(expected, actual) {
	const remaining = new Map();
	for (const name of actual) remaining.set(name, (remaining.get(name) ?? 0) + 1);
	return expected.filter((name) => {
		const count = remaining.get(name) ?? 0;
		if (!count) return true;
		remaining.set(name, count - 1);
		return false;
	});
}

// Record the real public leaf registration, including conditionally required
// cases, without executing bodies or filtering by an implementation manifest.
const adapted = [];
register({ runner: { expect: {} }, test: (name) => adapted.push(name) });
const adaptedNames = adapted.filter((name) => name.startsWith('WPT '));
const declaredSources = new Set();
const moduleRoot = new URL('../src/compatibility/element/selectors/', import.meta.url);
for (const file of (await readdir(moduleRoot)).filter((name) => name.endsWith('.ts'))) {
	const module = await import(new URL(file, moduleRoot).href);
	for (const path of module.sourceFiles ?? []) declaredSources.add(path);
}

const candidates = (await directory('dom/nodes'))
	.filter(
		(entry) =>
			entry.type === 'file' &&
			/queryselector|^Element-(?:closest|matches|webkitMatchesSelector)/i.test(entry.name),
	)
	.map((entry) => entry.path);
const pages = [];
const supportFiles = [];
for (const path of [...candidates, ...supplementalSources].toSorted()) {
	const content = await source(path);
	if (
		path.endsWith('.window.js') ||
		/<script\b[^>]*\bsrc\s*=\s*["']?\/resources\/testharness\.js\b/i.test(content)
	)
		pages.push(path);
	else supportFiles.push(path);
}
for (const path of supportFiles) {
	if (!declaredSources.has(path))
		throw new SelectorAuditError(`Unclassified upstream selector source: ${path}`);
}
// Check provenance declarations too, including shared selectors.js and fixtures.
for (const path of declaredSources) await source(path);

// selectors.js contains declarations of literal data and bit-mask expressions.
// Evaluate the hash-verified pinned source independently of the adaptation;
// JSON conversion removes cross-realm prototypes before strict comparison.
const preservationChecks = [];
const preservationErrors = [];
const corpusSource = 'dom/nodes/selectors.js';
const selectorData = {
	invalidSelectors,
	validSelectors,
	scopedSelectors,
	TEST_QSA,
	TEST_FIND,
	TEST_MATCH,
};
const corpusKeys = [
	'invalidSelectors',
	'validSelectors',
	'scopedSelectors',
	'TEST_QSA',
	'TEST_FIND',
	'TEST_MATCH',
];
try {
	const upstreamData = JSON.parse(
		JSON.stringify(
			runInNewContext(
				`${await source(corpusSource)}\n({ ${corpusKeys.join(', ')} });`,
				Object.create(null),
				{
					filename: corpusSource,
					timeout: 1_000,
					contextCodeGeneration: { strings: false, wasm: false },
				},
			),
		),
	);
	for (const key of corpusKeys) {
		try {
			deepStrictEqual(selectorData[key], upstreamData[key]);
			preservationChecks.push(`${corpusSource}: ${key}`);
		} catch (error) {
			preservationErrors.push({
				source: corpusSource,
				message: `${key} differs from pinned upstream data: ${error.message}`,
			});
		}
	}
} catch (error) {
	preservationErrors.push({
		source: corpusSource,
		message: `Could not evaluate pinned corpus: ${error.message}`,
	});
}
for (const [markup, extension] of [
	[fixtureMarkup.html, 'html'],
	[fixtureMarkup.xhtml, 'xht'],
]) {
	const path = `dom/nodes/ParentNode-querySelector-All-content.${extension}`;
	try {
		deepStrictEqual(Buffer.from(markup), Buffer.from(await source(path)));
		preservationChecks.push(`${path}: exact UTF-8 bytes`);
	} catch (error) {
		preservationErrors.push({
			source: path,
			message: `Fixture bytes differ from pinned upstream content: ${error.message}`,
		});
	}
}

const completionHook = `\nadd_completion_callback((tests, status) => {
  globalThis.__selectorAudit = {
    title: document.title,
    tests: tests.map(test => ({ name: test.name, status: test.status, message: test.message })),
    status: { status: status.status, message: status.message }
  };
});\n`;
const requestErrors = [];
const server = createServer(async (request, response) => {
	try {
		const url = new URL(request.url, 'http://localhost');
		const path = decodeURIComponent(url.pathname.slice(1));
		if (!path || path.split('/').includes('..'))
			throw new SelectorAuditError(`Invalid request: ${path}`);
		if (path === 'favicon.ico') {
			response.writeHead(204).end();
			return;
		}
		let body = await source(path);
		let contentType = path.endsWith('.js')
			? 'text/javascript'
			: path.endsWith('.css')
				? 'text/css'
				: /\.x(?:ht|html)$/.test(path)
					? 'application/xhtml+xml'
					: 'text/html';
		if (path.endsWith('.window.js') && url.searchParams.has('audit-wrapper')) {
			contentType = 'text/html';
			const dependencies = [...body.matchAll(/^\/\/ META: script=(.*)$/gm)]
				.map((match) => `<script src=${JSON.stringify(match[1].trim())}></script>`)
				.join('');
			body = `<!doctype html><meta charset="utf-8"><script src="/resources/testharness.js"></script>${dependencies}<script src=${JSON.stringify(`/${path}`)}></script>`;
		} else if (path === 'resources/testharness.js') body += completionHook;
		response.writeHead(200, { 'Content-Type': `${contentType}; charset=utf-8` }).end(body);
	} catch (error) {
		// The upstream fixture intentionally references nonexistent foo.jpg. A WPT
		// server returns 404; missing test documents/scripts must still fail the audit.
		if (error.details?.missing && request.headers['sec-fetch-dest'] === 'image') {
			response.writeHead(404).end();
			return;
		}
		requestErrors.push(error.message);
		response.writeHead(500).end(error.message);
	}
});

let browser;
const results = [];
const exclusions = [];
const errors = [];
try {
	await new Promise((resolve, reject) => {
		server.once('error', reject);
		server.listen(0, '127.0.0.1', resolve);
	});
	browser = await chromium.launch({
		headless: true,
		...(process.env.CHROME_BIN ? { executablePath: process.env.CHROME_BIN } : {}),
	});
	const origin = `http://127.0.0.1:${server.address().port}`;
	for (const path of pages) {
		const context = await browser.newContext();
		try {
			await context.route('**/*', (route) =>
				new URL(route.request().url()).origin === origin ? route.continue() : route.abort(),
			);
			const page = await context.newPage();
			await page.goto(`${origin}/${path}${path.endsWith('.window.js') ? '?audit-wrapper' : ''}`);
			await page.waitForFunction(() => globalThis.__selectorAudit, undefined, { timeout: 30_000 });
			const result = await page.evaluate(() => globalThis.__selectorAudit);
			if (result.status.status !== 0)
				throw new SelectorAuditError(
					`WPT harness status ${result.status.status}: ${result.status.message}`,
				);
			let tests = result.tests;
			if (sourceExclusions.has(path)) {
				exclusions.push({
					source: path,
					reason: sourceExclusions.get(path),
					cases: tests.map((test) => test.name),
				});
				continue;
			}
			if (caseExclusions.has(path)) {
				const names = caseExclusions.get(path);
				const excluded = tests.filter((test) => names.has(test.name));
				if (excluded.length !== names.size)
					throw new SelectorAuditError(
						'Vendor alias exclusions do not match upstream registrations',
						{ source: path },
					);
				exclusions.push({
					source: path,
					reason:
						'Vendor-prefixed alias cases; the same namespace assertions for unprefixed matches are adapted.',
					cases: excluded.map((test) => test.name),
				});
				tests = tests.filter((test) => !names.has(test.name));
			}
			if (bootstrapSources.has(path)) {
				const bootstrap = tests.filter((test) => test.name === result.title);
				if (bootstrap.length !== 1)
					throw new SelectorAuditError(
						`Expected exactly one unnamed iframe-loader case, found ${bootstrap.length}`,
					);
				exclusions.push({
					source: path,
					reason:
						'WPT iframe-loader harness case; adapted cases receive their fixture from the document factory.',
					cases: bootstrap.map((test) => test.name),
				});
				tests = tests.filter((test) => test.name !== result.title);
			}
			if (!tests.length) throw new SelectorAuditError('No upstream behavioral cases registered');
			results.push({
				source: path,
				cases: tests.map((test) => `WPT ${path.split('/').at(-1)}: ${test.name}`),
				browserFailures: tests
					.filter((test) => test.status !== 0)
					.map(({ name, status, message }) => ({ name, status, message })),
			});
		} catch (error) {
			errors.push({ source: path, message: error.message });
		} finally {
			await context.close();
		}
	}
} finally {
	await browser?.close();
	await new Promise((resolve) => server.close(resolve));
}

const expectedNames = results.flatMap((result) => result.cases);
const report = {
	revision,
	scope:
		'All dom/nodes querySelector/querySelectorAll, matches and closest testharness sources, plus css/selectors/is-where-basic.html and has-basic.html.',
	upstreamSources: results.length,
	upstreamCases: expectedNames.length,
	adaptedCases: adaptedNames.length,
	sources: results.map((result) => ({ source: result.source, cases: result.cases.length })),
	missing: difference(expectedNames, adaptedNames),
	extra: difference(adaptedNames, expectedNames),
	undeclaredSources: results
		.filter((result) => !declaredSources.has(result.source))
		.map((result) => result.source),
	exclusions,
	supportFiles,
	preservationChecks,
	errors: [...preservationErrors, ...errors, ...requestErrors.map((message) => ({ message }))],
	// Assertion failures are retained for visibility but this tool checks case
	// registration coverage, not browser conformance or assertion equivalence.
	upstreamBrowserFailures: results
		.filter((result) => result.browserFailures.length)
		.map((result) => ({ source: result.source, cases: result.browserFailures })),
};
if (options.json) console.info(JSON.stringify(report, null, 2));
else {
	console.info(
		`Pinned WPT ${revision}: ${report.upstreamCases} upstream cases in ${report.upstreamSources} sources; ${report.adaptedCases} adapted cases.`,
	);
	console.info(`Corpus and fixture preservation checks passed: ${preservationChecks.length}/8.`);
	for (const exclusion of exclusions)
		console.info(
			`EXCLUDED ${exclusion.source}: ${exclusion.cases.length} case(s). ${exclusion.reason}`,
		);
	for (const name of report.missing) console.info(`MISSING ${name}`);
	for (const name of report.extra) console.info(`EXTRA ${name}`);
	for (const path of report.undeclaredSources) console.info(`UNDECLARED SOURCE ${path}`);
	for (const error of report.errors)
		console.info(`ERROR ${error.source ?? 'resource'}: ${error.message}`);
	for (const result of report.upstreamBrowserFailures)
		console.info(
			`UPSTREAM BROWSER FAILURES ${result.source}: ${result.cases.map((test) => `${test.name}: ${test.message}`).join('; ')}`,
		);
	console.info(
		`Missing: ${report.missing.length}; extra: ${report.extra.length}; undeclared sources: ${report.undeclaredSources.length}; extraction errors: ${report.errors.length}.`,
	);
	console.info(
		'Case registration and matrix data preservation only: this audit does not establish complete assertion equivalence or selector conformance. Use --json for full source and exclusion details.',
	);
}
if (
	report.missing.length ||
	report.extra.length ||
	report.undeclaredSources.length ||
	report.errors.length
)
	process.exitCode = 1;
