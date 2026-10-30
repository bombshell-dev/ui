// Development-only browser runner. Bundle this file, then open compatibility.html.
// The assertions and feature catalogue are the same modules used by Vitest.
import * as chai from 'chai';
import { JestChaiExpect, JestAsymmetricMatchers } from '@vitest/expect';
import { testDOMCompatibility } from '../../src/compatibility/test-dom-compatibility.ts';
import { browserFeatures } from './features.ts';
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
const frames = new WeakMap();
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
	it(name, run) {
		if (!inputOnly || names[0] === 'input') cases.push({ name: [...names, name].join(' > '), run });
	},
};

const options = {
	runner,
	features: browserFeatures(inputMode === 'playwright'),
	...(inputMode === 'playwright'
		? { input: (document) => createBrowserInputDriver(document, window.__domInput) }
		: {}),
	create() {
		const frame = document.createElement('iframe');
		frame.style.cssText = 'position:absolute;left:0;top:0;width:800px;height:600px';
		document.body.append(frame);
		const fixtureDocument = frame.contentDocument;
		if (!fixtureDocument) chai.assert.fail('Could not construct browser document');
		// about:blank starts in quirks mode even when the parent is in standards mode.
		// These cases use standard selector semantics, including bare :hover/:active.
		fixtureDocument.open();
		fixtureDocument.write('<!doctype html><html><head></head><body></body></html>');
		fixtureDocument.close();
		expect(fixtureDocument.compatMode).toBe('CSS1Compat');
		fixtureDocument.defaultView.focus();
		frames.set(fixtureDocument, frame);
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
	},
	globals(fixtureDocument) {
		const view = fixtureDocument.defaultView;
		return {
			Document: view.Document,
			CSSStyleSheet: view.CSSStyleSheet,
			DOMParser: view.DOMParser,
			XMLSerializer: view.XMLSerializer,
			getComputedStyle: view.getComputedStyle.bind(view),
			Element: view.Element,
			HTMLElement: view.HTMLElement,
			HTMLInputElement: view.HTMLInputElement,
			HTMLTextAreaElement: view.HTMLTextAreaElement,
			HTMLSelectElement: view.HTMLSelectElement,
			HTMLTemplateElement: view.HTMLTemplateElement,
			Event: view.Event,
			EventTarget: view.EventTarget,
			CustomEvent: view.CustomEvent,
			KeyboardEvent: view.KeyboardEvent,
			MouseEvent: view.MouseEvent,
			FocusEvent: view.FocusEvent,
			InputEvent: view.InputEvent,
			MutationObserver: view.MutationObserver,
			AbortController: view.AbortController,
			FormData: view.FormData,
			customElements: view.customElements,
			// Callbacks are authored in this module's realm, so the standard
			// exception-reporting target and ErrorEvent constructor belong here.
			window,
			ErrorEvent,
		};
	},
	dispose(fixtureDocument) {
		frames.get(fixtureDocument)?.remove();
		frames.delete(fixtureDocument);
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
	for (const test of cases) {
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
				frames.get(currentDocument)?.remove();
				frames.delete(currentDocument);
				errorsByDocument.delete(currentDocument);
				currentDocument = null;
				currentErrors = null;
			}
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
	notRun: Math.max(0, cases.length - results.length),
	passed: results.filter((result) => result.status === 'passed').length,
	failed: results.filter((result) => result.status === 'failed').length,
	results,
};
if (report) report.textContent = JSON.stringify(summary, null, 2);
document.documentElement.dataset.complete = 'true';
