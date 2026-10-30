import type { CompatibilityRunner } from '../../src/compatibility/context.ts';
import { testDOMCompatibility } from '../../src/compatibility/test-dom-compatibility.ts';
import { browserFeatures } from './features.ts';
import { createBrowserInputDriver, type BrowserInputBridge } from './input-driver.mts';

/** Native documents and bindings can enter the suite without application casts. */
export function registerBrowserCompatibility(
	runner: CompatibilityRunner,
	send: BrowserInputBridge,
): void {
	testDOMCompatibility({
		runner,
		create: () => document,
		input: (document) => createBrowserInputDriver(document, send),
		globals: {
			Document,
			DOMParser,
			XMLSerializer,
			CSSStyleSheet,
			getComputedStyle,
			Element,
			HTMLElement,
			HTMLTemplateElement,
			HTMLInputElement,
			HTMLTextAreaElement,
			HTMLSelectElement,
			Event,
			EventTarget,
			CustomEvent,
			KeyboardEvent,
			MouseEvent,
			FocusEvent,
			InputEvent,
			ErrorEvent,
			MutationObserver,
			AbortController,
			FormData,
			customElements,
			window,
		},
		features: browserFeatures(true),
	});
}
