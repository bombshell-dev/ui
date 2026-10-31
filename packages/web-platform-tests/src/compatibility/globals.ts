import type { DOMDocument, DOMElement, DOMHTMLElement } from './contracts/nodes.ts';
import type {
	DOMEvent,
	DOMEventTarget,
	DOMEventConstructor,
	DOMEventTargetConstructor,
	DOMCustomEventConstructor,
	DOMKeyboardEventConstructor,
	DOMMouseEventConstructor,
	DOMFocusEventConstructor,
	DOMInputEventConstructor,
} from './contracts/events.ts';
import type { DOMMutationObserverConstructor } from './contracts/observation.ts';
import type { DOMTemplateElement, DOMCustomElementRegistry } from './contracts/shadow.ts';
import type {
	DOMFormElement,
	DOMInputElement,
	DOMTextAreaElement,
	DOMSelectElement,
} from './contracts/elements.ts';

/** Implementations supply only the bindings needed by their selected features. */
export type DOMGlobalBindings = Record<string, unknown>;

interface DOMFormData {
	get(name: string): string | File | null;
	getAll(name: string): (string | File)[];
	entries(): IterableIterator<[string, string | File]>;
}

/** Idealized test contracts, not a claim about an implementation's supported APIs. */
export interface DOMGlobals extends DOMGlobalBindings {
	Document: new () => DOMDocument;
	Element: abstract new (...args: never[]) => DOMElement;
	HTMLElement: new () => DOMHTMLElement;
	HTMLTemplateElement: abstract new (...args: never[]) => DOMTemplateElement;
	HTMLInputElement: abstract new (...args: never[]) => DOMInputElement;
	HTMLTextAreaElement: abstract new (...args: never[]) => DOMTextAreaElement;
	HTMLSelectElement: abstract new (...args: never[]) => DOMSelectElement;
	Event: DOMEventConstructor;
	EventTarget: DOMEventTargetConstructor;
	CustomEvent: DOMCustomEventConstructor;
	KeyboardEvent: DOMKeyboardEventConstructor;
	MouseEvent: DOMMouseEventConstructor;
	FocusEvent: DOMFocusEventConstructor;
	InputEvent: DOMInputEventConstructor;
	ErrorEvent: abstract new (...args: never[]) => DOMEvent & { readonly error: unknown };
	MutationObserver: DOMMutationObserverConstructor;
	AbortController: typeof AbortController;
	FormData: new (form?: DOMFormElement, submitter?: DOMHTMLElement | null) => DOMFormData;
	customElements: DOMCustomElementRegistry;
	window: DOMEventTarget;
}

/** Compatibility MissingGlobalError support. */
export class MissingGlobalError extends Error {
	constructor(name: string) {
		super(`Missing globals.${name}`);
		this.name = 'MissingGlobalError';
	}
}
