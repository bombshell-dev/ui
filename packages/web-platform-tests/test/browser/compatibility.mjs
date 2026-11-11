// Development-only browser runner. Bundle this file, then open compatibility.html.
// The assertions and WPT source selection are the same modules used by Vitest.
import * as chai from 'chai';
import { JestChaiExpect, JestAsymmetricMatchers } from '@vitest/expect';
import { testDOMCompatibility } from '../../src/shared/test-dom-compatibility.ts';
import { browserWPTConfig } from './wpt.config.ts';
import { createBrowserInputDriver } from './input-driver.mts';

const parameters = new URLSearchParams(location.search);
const inputMode = parameters.get('input');
const inputOnly = parameters.has('input-only');

chai.use(JestChaiExpect);
chai.use(JestAsymmetricMatchers);
const expect = Object.assign(chai.expect, {
	unreachable(message) {
		chai.assert.fail(message ?? 'Expected unreachable code');
	},
});
const cases = [];
const names = [];
const releases = new WeakMap();
const pendingReleases = new Set();
const errorsByDocument = new WeakMap();
let currentErrors = null;
let currentDocument = null;
window.addEventListener('error', (event) => {
	const errors = currentErrors;
	queueMicrotask(() => {
		if (errors && !event.defaultPrevented) errors.push(event.error ?? event.message);
	});
});
const runner = {
	expect,
	describe(name, register) {
		names.push(name);
		try {
			register();
		} finally {
			names.pop();
		}
	},
	it: Object.assign(
		(name, run) => {
			cases.push({ name: [...names, name].join(' > '), run });
		},
		{
			todo(name) {
				cases.push({ name: [...names, name].join(' > '), todo: true });
			},
		},
	),
};

class BrowserDocumentError extends Error {
	constructor(message, details) {
		super(message);
		this.name = 'BrowserDocumentError';
		this.details = details;
	}
}

function createFrame() {
	const frame = document.createElement('iframe');
	frame.style.cssText = 'position:absolute;left:0;top:0;width:800px;height:600px';
	return frame;
}

function initializeFrame(frame, release) {
	const fixtureDocument = frame.contentDocument;
	if (!fixtureDocument) chai.assert.fail('Could not construct browser document');
	fixtureDocument.defaultView.focus();
	releases.set(fixtureDocument, release);
	const errors = [];
	errorsByDocument.set(fixtureDocument, errors);
	currentErrors = errors;
	currentDocument = fixtureDocument;
	fixtureDocument.defaultView.addEventListener('error', (event) => {
		// Listener exceptions are reported, not thrown by dispatchEvent. Wait until
		// intentional error-reporting tests have had a chance to preventDefault.
		queueMicrotask(() => {
			if (!event.defaultPrevented) errors.push(event.error ?? event.message);
		});
	});
	return fixtureDocument;
}

async function createRequestedDocument(request) {
	const frame = createFrame();
	const blobURL = URL.createObjectURL(new Blob([request.content], { type: request.contentType }));
	const navigation = new URL(blobURL);
	navigation.hash = request.fragment ?? '';
	let released = false;
	const release = () => {
		if (released) return;
		released = true;
		frame.remove();
		URL.revokeObjectURL(blobURL);
		pendingReleases.delete(release);
	};
	pendingReleases.add(release);
	let timeout;
	let animationFrame;
	let view;
	let onLoad;
	let onError;
	try {
		await new Promise((resolve, reject) => {
			timeout = setTimeout(
				() =>
					reject(
						new BrowserDocumentError('Requested fixture document did not load within 4 seconds', {
							contentType: request.contentType,
							phase: 'load',
						}),
					),
				4000,
			);
			onError = () =>
				reject(
					new BrowserDocumentError('Requested fixture document failed to load', {
						contentType: request.contentType,
						phase: 'load',
					}),
				);
			onLoad = () => {
				view = frame.contentWindow;
				if (!view) {
					reject(
						new BrowserDocumentError('Requested fixture document has no browsing context', {
							contentType: request.contentType,
							phase: 'load',
						}),
					);
					return;
				}
				animationFrame = view.requestAnimationFrame(() => resolve());
			};
			frame.addEventListener('load', onLoad, { once: true });
			frame.addEventListener('error', onError, { once: true });
			frame.src = navigation.href;
			document.body.append(frame);
		});
		if (released)
			throw new BrowserDocumentError(
				'Requested fixture document was disposed before creation completed',
				{ contentType: request.contentType, phase: 'creation' },
			);
		expect(frame.contentDocument.contentType).toBe(request.contentType);
		const fixtureDocument = initializeFrame(frame, release);
		pendingReleases.delete(release);
		return fixtureDocument;
	} catch (error) {
		release();
		throw error;
	} finally {
		clearTimeout(timeout);
		if (animationFrame !== undefined) view.cancelAnimationFrame(animationFrame);
		frame.removeEventListener('load', onLoad);
		frame.removeEventListener('error', onError);
	}
}

const options = {
	runner,
	config: browserWPTConfig(runner, { input: inputMode === 'playwright', inputOnly }),
	...(inputMode === 'playwright'
		? { input: (document) => createBrowserInputDriver(document, window.__domInput) }
		: {}),
	create(request) {
		if (request) return createRequestedDocument(request);
		const frame = createFrame();
		document.body.append(frame);
		try {
			const fixtureDocument = frame.contentDocument;
			if (!fixtureDocument) chai.assert.fail('Could not construct browser document');
			// about:blank starts in quirks mode even when the parent is in standards mode.
			// These cases use standard selector semantics, including bare :hover/:active.
			fixtureDocument.open();
			fixtureDocument.write('<!doctype html><html><head></head><body></body></html>');
			fixtureDocument.close();
			expect(fixtureDocument.compatMode).toBe('CSS1Compat');
			return initializeFrame(frame, () => frame.remove());
		} catch (error) {
			frame.remove();
			throw error;
		}
	},
	dispose(fixtureDocument) {
		releases.get(fixtureDocument)?.();
		releases.delete(fixtureDocument);
		const errors = errorsByDocument.get(fixtureDocument);
		errorsByDocument.delete(fixtureDocument);
		if (currentDocument === fixtureDocument) {
			currentErrors = null;
			currentDocument = null;
		}
		if (errors?.length) throw errors[0];
	},
};

const results = [];
let selectedCases = [];
const start = Number(parameters.get('start') ?? 0);
const limit = Number(parameters.get('limit') ?? Infinity);
let aborted = false;
const report = document.getElementById('results');
try {
	if (inputMode && inputMode !== 'playwright')
		chai.assert.fail(`Unknown input adapter: ${inputMode}`);
	if (inputMode === 'playwright' && typeof window.__domInput !== 'function')
		chai.assert.fail(
			'Playwright input requires the test/browser/run-compatibility.mjs automation runner',
		);
	if (inputOnly && inputMode !== 'playwright')
		chai.assert.fail('Input-only mode requires an input adapter');
	testDOMCompatibility(options);
	if (!Number.isSafeInteger(start) || start < 0 || !(limit > 0))
		chai.assert.fail('Invalid browser case batch');
	selectedCases = cases.slice(start, start + limit);
	for (const test of selectedCases) {
		if (test.todo) {
			results.push({ name: test.name, status: 'todo' });
			continue;
		}
		let timeout;
		if (report)
			report.textContent = JSON.stringify({ running: test.name, completed: results.length });
		try {
			await Promise.race([
				test.run(),
				new Promise((_, reject) => {
					timeout = setTimeout(() => {
						aborted = true;
						reject(new Error('Test did not finish within 5 seconds; remaining cases aborted'));
					}, 5000);
				}),
			]);
			results.push({ name: test.name, status: 'passed' });
		} catch (error) {
			results.push({
				name: test.name,
				status: 'failed',
				message: error instanceof Error ? error.message : String(error),
			});
		} finally {
			clearTimeout(timeout);
			if (currentDocument) {
				releases.get(currentDocument)?.();
				releases.delete(currentDocument);
				errorsByDocument.delete(currentDocument);
				currentDocument = null;
				currentErrors = null;
			}
			for (const release of pendingReleases) release();
		}
		// A timeout cannot cancel the pending test or its host input. Starting
		// another fixture would let that input leak into the next test.
		if (aborted) break;
	}
} catch (error) {
	results.push({
		name: 'suite registration',
		status: 'failed',
		message: error instanceof Error ? error.message : String(error),
	});
}
const summary = {
	userAgent: navigator.userAgent,
	input: inputMode ?? 'disabled',
	aborted,
	total: cases.length,
	next: start + selectedCases.length < cases.length ? start + selectedCases.length : null,
	notRun: Math.max(0, selectedCases.length - results.length),
	passed: results.filter((result) => result.status === 'passed').length,
	failed: results.filter((result) => result.status === 'failed').length,
	todo: results.filter((result) => result.status === 'todo').length,
	results,
};
if (report) report.textContent = JSON.stringify(summary, null, 2);
document.documentElement.dataset.complete = 'true';
