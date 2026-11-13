import { CompatibilityConfigurationError, type WPTSelectors } from '../shared/selection.ts';
import { features, type DOMFeature } from './features.ts';

interface FrameworkProfile {
	/** Non-hydrated mount, update, and unmount of a typical application. */
	required: readonly DOMFeature[];
	/** Opt-in renderer modules, each enabled only when the integration supports it. */
	optional: Readonly<Record<string, readonly DOMFeature[]>>;
}

/** Shared by every measured framework. */
const core = [
	'Element#innerHTML',
	'Element#setAttribute',
	'EventTarget#addEventListener',
	'EventTarget#dispatchEvent',
	'Event',
	'HTMLElement#style',
	'CSSStyleDeclaration#setProperty',
	'Document#createTextNode',
	'Node#nodeType',
	'HTMLInputElement#value',
	'HTMLInputElement#checked',
	'HTMLInputElement#type',
	'HTMLTextAreaElement#value',
] as const satisfies readonly DOMFeature[];

/**
 * Measured DOM baseline per framework, from the non-hydrated happy-dom recorder study.
 * Recorded against React 19.3.1, Preact 11.2.0, Vue 3.5.45, Solid 1.9.19, and Svelte 5.57.3.
 */
export const frameworks = {
	react: {
		required: [
			...core,
			'Document#createElement',
			'Document#createElementNS',
			'Node#insertBefore',
			'Node#firstChild',
			'Node#textContent',
			'Node#ownerDocument',
			'Element#removeAttribute',
			'Node#nodeValue',
			'Node#appendChild',
			'Node#removeChild',
			'HTMLOptionElement#value',
			'HTMLOptionElement#selected',
			'HTMLSelectElement#value',
			'Document#activeElement',
			'Document#defaultView',
			'Document#documentElement',
			'Node#lastChild',
			'Node#getRootNode',
			'Node#contains',
			'HTMLElement#contentEditable',
			'Event#composedPath',
			'Event#isTrusted',
			'Element#namespaceURI',
			'Element#tagName',
			'Element#nodeName',
			'GlobalEventHandlers#onclick',
			'HTMLInputElement#name',
			'HTMLInputElement#defaultValue',
			'HTMLInputElement#defaultChecked',
			'HTMLInputElement#selectionStart',
			'HTMLInputElement#selectionEnd',
			'HTMLTextAreaElement#defaultValue',
			'HTMLOptionElement#disabled',
		],
		optional: {
			// Resource hoisting inserts <link>, <style>, and <meta> into the head.
			resources: ['Document#head'],
			selection: [
				'Document#createRange',
				'HTMLInputElement#setSelectionRange',
				'Node#compareDocumentPosition',
			],
		},
	},
	preact: {
		required: [
			...core,
			'Document#createElementNS',
			'Node#insertBefore',
			'Node#firstChild',
			'Node#nextSibling',
			'Node#parentNode',
			'ChildNode#remove',
			'Node#ownerDocument',
			'Element#namespaceURI',
			'Element#id',
			'HTMLOptionElement#value',
			'CharacterData#data',
			'EventTarget#removeEventListener',
		],
		optional: {
			hydration: ['Node#childNodes', 'Element#localName'],
			// Feature-detected; falls back to insertBefore.
			moveBefore: ['ParentNode#moveBefore'],
		},
	},
	vue: {
		required: [
			...core,
			'Document#createElement',
			'Document#createElementNS',
			'Document#createComment',
			'Node#insertBefore',
			'Node#nextSibling',
			'Node#parentNode',
			'Node#textContent',
			'Element#className',
			'Element#id',
			'Element#tagName',
			'Element#removeAttribute',
			'Element#getAttribute',
			'Node#nodeValue',
			'Node#removeChild',
			'HTMLOptionElement#value',
			'HTMLOptionElement#selected',
			'HTMLSelectElement#value',
			'EventTarget#removeEventListener',
		],
		optional: {
			hydration: ['Document#createTreeWalker', 'Node#childNodes'],
			transitions: ['getComputedStyle', 'Element#classList'],
			customElements: ['Element#attachShadow', 'Node#isConnected'],
		},
	},
	solid: {
		required: [
			...core,
			'Document#createElement',
			'Document#createElementNS',
			'Node#insertBefore',
			'Node#firstChild',
			'Node#nextSibling',
			'Node#parentNode',
			'Node#textContent',
			'ChildNode#remove',
			'Element#className',
			'Element#classList',
			'Node#appendChild',
			'Node#cloneNode',
			'Node#replaceChild',
			'HTMLTemplateElement#content',
			'CharacterData#data',
			'HTMLButtonElement#disabled',
			'HTMLInputElement#disabled',
			'HTMLTextAreaElement#disabled',
			'Event#composedPath',
		],
		optional: {
			hydration: ['Document#importNode', 'DocumentFragment#querySelectorAll', 'Node#isConnected'],
		},
	},
	svelte: {
		required: [
			...core,
			'Document#createElement',
			'Document#createDocumentFragment',
			'Node#firstChild',
			'Node#lastChild',
			'Node#nextSibling',
			'Node#parentNode',
			'ChildNode#remove',
			'ChildNode#before',
			'ChildNode#after',
			'Node#ownerDocument',
			'Element#className',
			'Node#nodeValue',
			'CharacterData#data',
			'Node#appendChild',
			'Node#removeChild',
			'Node#cloneNode',
			'HTMLTemplateElement#content',
			'HTMLOptionElement#value',
			'HTMLOptionElement#selected',
			'HTMLSelectElement#value',
			'Document#activeElement',
			'EventTarget#removeEventListener',
			'Element#querySelector',
			'ParentNode#children',
			'MutationObserver#childList',
			'MutationObserver#observe',
			'MutationObserver#disconnect',
			'Element#namespaceURI',
			'Element#nodeName',
			'Document#contentType',
			'HTMLButtonElement#disabled',
			'Event#composedPath',
		],
		optional: {
			hydration: ['DocumentFragment#querySelectorAll', 'Element#getAttribute'],
		},
	},
} as const satisfies Record<string, FrameworkProfile>;

export type Framework = keyof typeof frameworks;

/** Union of the WPT cases covering the given features. */
export function featureSelectors(names: Iterable<DOMFeature>): WPTSelectors {
	const merged: Record<string, true | (string | RegExp)[]> = {};
	for (const name of names) {
		for (const [source, cases] of Object.entries(features[name] as WPTSelectors)) {
			const current = merged[source];
			if (current === true || cases === true) merged[source] = true;
			else merged[source] = [...new Set([...(current ?? []), ...cases])];
		}
	}
	return merged;
}

/** WPT cases a framework requires, plus any named optional modules. */
export function framework(name: Framework, modules: readonly string[] = []): WPTSelectors {
	const { required, optional } = frameworks[name] as FrameworkProfile;
	const extra = modules.flatMap((module) => {
		const listed = optional[module];
		if (!listed)
			throw new CompatibilityConfigurationError(`${name} has no optional module ${module}`);
		return listed;
	});
	return featureSelectors([...required, ...extra]);
}

/** Required features with no adapted WPT coverage yet. */
export function uncoveredByWPT(name: Framework): DOMFeature[] {
	return [...new Set(frameworks[name].required)].filter(
		(feature) => Object.keys(features[feature]).length === 0,
	);
}
