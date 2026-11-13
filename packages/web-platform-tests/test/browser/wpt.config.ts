import type { CompatibilityRunner } from '../../src/shared/context.ts';
import type { DOMGlobalBindings } from '../../src/shared/globals.ts';
import { registry } from '../../src/shared/registry.ts';
import type { WPTConfig } from '../../src/shared/test-dom-compatibility.ts';

/** Input cases run only when the automation runner supplies its Playwright bridge. */
export function browserWPTConfig(
	runner: CompatibilityRunner,
	{ input, inputOnly = false }: { input: boolean; inputOnly?: boolean },
): WPTConfig<Document> {
	const config: WPTConfig<Document> = { globals: browserGlobals };
	if (input && !inputOnly) return config;
	const inputCases: Record<string, string[]> = {};
	for (const [source, module] of Object.entries(registry)) {
		if (!('input' in module) || !module.input.length) continue;
		module.register({
			runner,
			test(name) {
				(inputCases[source] ??= []).push(name);
			},
		});
	}
	if (input && inputOnly) {
		config.exclude = { '**': true };
		config.include = inputCases;
	} else {
		config.exclude = inputCases;
	}
	return config;
}

function browserGlobals(fixtureDocument: Document): DOMGlobalBindings {
	const view = fixtureDocument.defaultView as Window & typeof globalThis;
	return {
		Document: view.Document,
		Range: view.Range,
		NodeFilter: view.NodeFilter,
		CustomElementRegistry: view.CustomElementRegistry,
		Promise: view.Promise,
		HTMLSlotElement: view.HTMLSlotElement,
		Selection: view.Selection,
		SubmitEvent: view.SubmitEvent,
		PointerEvent: view.PointerEvent,
		XMLDocument: view.XMLDocument,

		Array: view.Array,
		HTMLDivElement: view.HTMLDivElement,
		ProcessingInstruction: view.ProcessingInstruction,
		Attr: view.Attr,
		NamedNodeMap: view.NamedNodeMap,
		DocumentType: view.DocumentType,
		HTMLUnknownElement: view.HTMLUnknownElement,
		HTMLAnchorElement: view.HTMLAnchorElement,
		HTMLAreaElement: view.HTMLAreaElement,
		HTMLAudioElement: view.HTMLAudioElement,
		HTMLBaseElement: view.HTMLBaseElement,
		HTMLBodyElement: view.HTMLBodyElement,
		HTMLBRElement: view.HTMLBRElement,
		HTMLButtonElement: view.HTMLButtonElement,
		HTMLCanvasElement: view.HTMLCanvasElement,
		HTMLTableCaptionElement: view.HTMLTableCaptionElement,
		HTMLTableColElement: view.HTMLTableColElement,
		HTMLDataElement: view.HTMLDataElement,
		HTMLDataListElement: view.HTMLDataListElement,
		HTMLDialogElement: view.HTMLDialogElement,
		HTMLModElement: view.HTMLModElement,
		HTMLDirectoryElement: view.HTMLDirectoryElement,
		HTMLDListElement: view.HTMLDListElement,
		HTMLEmbedElement: view.HTMLEmbedElement,
		HTMLFieldSetElement: view.HTMLFieldSetElement,
		HTMLFontElement: view.HTMLFontElement,
		HTMLFormElement: view.HTMLFormElement,
		HTMLFrameElement: view.HTMLFrameElement,
		HTMLFrameSetElement: view.HTMLFrameSetElement,
		HTMLHeadingElement: view.HTMLHeadingElement,
		HTMLHeadElement: view.HTMLHeadElement,
		HTMLHRElement: view.HTMLHRElement,
		HTMLHtmlElement: view.HTMLHtmlElement,
		HTMLIFrameElement: view.HTMLIFrameElement,
		HTMLImageElement: view.HTMLImageElement,
		HTMLLabelElement: view.HTMLLabelElement,
		HTMLLegendElement: view.HTMLLegendElement,
		HTMLLIElement: view.HTMLLIElement,
		HTMLLinkElement: view.HTMLLinkElement,
		HTMLMapElement: view.HTMLMapElement,
		HTMLMetaElement: view.HTMLMetaElement,
		HTMLMeterElement: view.HTMLMeterElement,
		HTMLObjectElement: view.HTMLObjectElement,
		HTMLOListElement: view.HTMLOListElement,
		HTMLOptGroupElement: view.HTMLOptGroupElement,
		HTMLOptionElement: view.HTMLOptionElement,
		HTMLOutputElement: view.HTMLOutputElement,
		HTMLParagraphElement: view.HTMLParagraphElement,
		HTMLParamElement: view.HTMLParamElement,
		HTMLPreElement: view.HTMLPreElement,
		HTMLProgressElement: view.HTMLProgressElement,
		HTMLQuoteElement: view.HTMLQuoteElement,
		HTMLScriptElement: view.HTMLScriptElement,
		HTMLSourceElement: view.HTMLSourceElement,
		HTMLSpanElement: view.HTMLSpanElement,
		HTMLStyleElement: view.HTMLStyleElement,
		HTMLTableElement: view.HTMLTableElement,
		HTMLTableSectionElement: view.HTMLTableSectionElement,
		HTMLTableCellElement: view.HTMLTableCellElement,
		HTMLTimeElement: view.HTMLTimeElement,
		HTMLTitleElement: view.HTMLTitleElement,
		HTMLTableRowElement: view.HTMLTableRowElement,
		HTMLTrackElement: view.HTMLTrackElement,
		HTMLUListElement: view.HTMLUListElement,
		HTMLVideoElement: view.HTMLVideoElement,
		Node: view.Node,
		Text: view.Text,
		Comment: view.Comment,
		CharacterData: view.CharacterData,
		DocumentFragment: view.DocumentFragment,
		HTMLCollection: view.HTMLCollection,
		Option: view.Option,
		Date: view.Date,
		DOMException: view.DOMException,
		NodeList: view.NodeList,
		TypeError: view.TypeError,
		CSSStyleSheet: view.CSSStyleSheet,
		CSSStyleDeclaration: view.CSSStyleDeclaration,
		CSSMediaRule: view.CSSMediaRule,
		ShadowRoot: view.ShadowRoot,
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
		ToggleEvent: view.ToggleEvent,
		MutationObserver: view.MutationObserver,
		AbortController: view.AbortController,
		FormData: view.FormData,
		File: view.File,
		customElements: view.customElements,
		// Callbacks are authored in this module's realm, so the standard
		// exception-reporting target and ErrorEvent constructor belong here.
		window,
		ErrorEvent,
	};
}
