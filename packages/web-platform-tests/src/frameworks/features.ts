import type { WPTSelectors } from '../shared/selection.ts';

/**
 * DOM members measured in framework runtimes, keyed by interface member, mapped to the adapted
 * WPT cases that exercise them. An empty selector map means no adapted WPT source covers the
 * member yet; it stays listed so profiles keep recording the requirement.
 */
export const features = {
	// Document
	'Document#createElement': { 'dom/nodes/Document-createElement.html': true },
	'Document#createElementNS': { 'dom/nodes/Document-createElementNS.html': true },
	'Document#createTextNode': { 'dom/nodes/Document-createTextNode.html': true },
	'Document#createComment': { 'dom/nodes/Document-createComment.html': true },
	'Document#createDocumentFragment': {},
	'Document#activeElement': { 'html/editing/focus/focus-management/focus-blur.html': true },
	'Document#defaultView': {},
	'Document#head': {},
	'Document#importNode': {
		'dom/nodes/Document-importNode.html': [/'deep' argument\.$/],
	},
	'Document#createTreeWalker': {
		'dom/traversal/TreeWalker-basic.html': true,
		'dom/traversal/TreeWalker-acceptNode-filter.html': true,
		'dom/traversal/TreeWalker-traversal-reject.html': true,
		'dom/traversal/TreeWalker-traversal-skip.html': true,
	},
	'Document#createRange': {
		'dom/ranges/Range-constructor.html': true,
		'dom/ranges/Range-attributes.html': true,
	},

	// Node
	'Node#nodeType': {},
	'Node#ownerDocument': {},
	'Node#parentNode': {
		'dom/nodes/Node-parentNode.html': ['sets the parent of an appended element', 'Root element'],
	},
	'Node#firstChild': {},
	'Node#lastChild': {},
	'Node#nextSibling': {},
	'Node#childNodes': { 'dom/nodes/Node-childNodes.html': true },
	'Node#insertBefore': { 'dom/nodes/Node-insertBefore.html': true },
	'Node#appendChild': {},
	'Node#removeChild': { 'dom/nodes/Node-removeChild.html': true },
	'Node#replaceChild': { 'dom/nodes/Node-replaceChild.html': true },
	'Node#cloneNode': { 'dom/nodes/Node-cloneNode.html': true },
	// Frameworks never create ProcessingInstruction or DocumentType nodes, nor set Document text.
	'Node#textContent': {
		'dom/nodes/Node-textContent.html': [/^(?!.*(ProcessingInstruction|DocumentType|Documents))/],
	},
	'Node#nodeValue': { 'dom/nodes/Node-nodeValue.html': ['Text.nodeValue', 'Comment.nodeValue'] },
	'Node#contains': { 'dom/nodes/Node-contains.html': true },
	'Node#getRootNode': {},
	'Node#isConnected': { 'dom/nodes/Node-isConnected.html': true },
	'Node#compareDocumentPosition': { 'dom/nodes/Node-compareDocumentPosition.html': true },

	// ChildNode / ParentNode / CharacterData
	'ChildNode#remove': {
		'dom/nodes/Element-remove.html': true,
		'dom/nodes/CharacterData-remove.html': [
			/^(text|comment) should support remove\(\)$/,
			/if (text|comment) /,
		],
	},
	'ChildNode#before': {},
	'ParentNode#moveBefore': {},
	'ChildNode#after': {},
	'ParentNode#children': { 'dom/nodes/ParentNode-children.html': true },
	'CharacterData#data': { 'dom/nodes/CharacterData-data.html': true },

	// Element
	'Element#setAttribute': {
		'dom/nodes/Element-setAttribute.html': true,
		'dom/nodes/Element-setAttribute-crbug-1138487.html': true,
		'dom/nodes/attributes.html': [/\bsetAttribute\b/],
	},
	'Element#getAttribute': {
		'dom/nodes/attributes.html': [
			'Unset attributes return null',
			'First set attribute is returned by getAttribute',
			'Only lowercase attributes are returned on HTML elements (upper case attribute)',
			'Only lowercase attributes are returned on HTML elements (mixed case attribute)',
		],
	},
	'Element#namespaceURI': { 'dom/nodes/Document-createElementNS.html': true },
	'Element#localName': {
		'dom/nodes/Document-createElement.html': true,
		'dom/nodes/Document-createElementNS.html': true,
	},
	'Element#removeAttribute': { 'dom/nodes/Element-removeAttribute.html': true },
	'Element#className': { 'html/dom/reflection-misc.html': [/^html\.className /] },
	'Element#classList': { 'dom/nodes/Element-classlist.html': true },
	'Element#innerHTML': {
		'domparsing/innerhtml-04.html': true,
		'domparsing/innerhtml-07.html': true,
		'domparsing/innerhtml-08.html': true,
		'domparsing/innerhtml-li-autoclosing.html': true,
		'html/syntax/serializing-html-fragments/serializing.html': [/^innerHTML /],
	},
	// Svelte's select binding queries `:checked`, `[selected]`, and `option:not([disabled])` only.
	'Element#querySelector': { 'html/semantics/selectors/pseudo-classes/checked.html': true },
	'DocumentFragment#querySelectorAll': {
		'dom/nodes/DocumentFragment-querySelectorAll-after-modification.html': true,
	},
	'Element#attachShadow': { 'shadow-dom/Element-interface-attachShadow.html': true },

	// HTMLElement and CSSOM
	'HTMLElement#style': {
		'css/cssom/css-style-attr-decl-block.html': true,
		'css/cssom/css-style-attribute-modifications.html': true,
		'css/cssom/CSSStyleDeclaration-indexed-properties.html': true,
	},
	'CSSStyleDeclaration#setProperty': { 'css/cssom/cssom-setProperty-shorthand.html': true },
	getComputedStyle: { 'css/cssom/computed-style-001.html': true },
	'HTMLElement#contentEditable': {},
	'HTMLElement#focus': {
		'html/editing/focus/focus-management/focus-blur.html': true,
		'html/interaction/focus/focus-management/focus-events.html': true,
	},
	'HTMLTemplateElement#content': {
		'html/semantics/scripting-1/the-template-element/definitions/template-contents.html': true,
		'html/semantics/scripting-1/the-template-element/innerhtml-on-templates/innerhtml.html': true,
		'html/semantics/scripting-1/the-template-element/additions-to-the-steps-to-clone-a-node/template-clone-children.html': true,
	},

	// Form controls. Reflection must use prototype accessors (React's value tracker); no WPT covers that.
	'HTMLInputElement#value': {
		'html/semantics/forms/the-input-element/input-value-dirty-flag.html': true,
		'html/semantics/forms/the-input-element/text.html': [/^(Value returns|Setting value changes)/],
	},
	'HTMLInputElement#checked': {
		'html/semantics/forms/the-input-element/input-value-dirty-flag.html': [
			'Input checked/defaultChecked dirty checkedness semantics',
		],
		'html/semantics/forms/the-input-element/checkbox-click-events.html': true,
	},
	'HTMLInputElement#setSelectionRange': {
		'html/semantics/forms/textfieldselection/selection.html': true,
	},
	'HTMLTextAreaElement#value': {
		'html/semantics/forms/the-textarea-element/value-defaultValue-textContent.html': true,
	},
	'HTMLOptionElement#value': { 'html/semantics/forms/the-option-element/option-value.html': true },
	'HTMLOptionElement#selected': {
		'html/semantics/forms/the-option-element/option-selected.html': true,
	},
	'HTMLSelectElement#value': {
		'html/semantics/forms/the-select-element/select-value.html': true,
		'html/semantics/forms/the-select-element/selected-index.html': true,
	},

	// Events
	'EventTarget#addEventListener': {
		'dom/events/EventTarget-addEventListener.any.js': true,
		'dom/events/EventTarget-add-remove-listener.any.js': true,
		'dom/events/AddEventListenerOptions-once.any.js': true,
		'dom/events/AddEventListenerOptions-passive.any.js': true,
		'dom/events/AddEventListenerOptions-signal.any.js': true,
		'dom/events/EventListenerOptions-capture.html': true,
		'dom/events/EventListener-handleEvent.html': true,
		'dom/events/EventTarget-this-of-listener.html': true,
	},
	'EventTarget#removeEventListener': {
		'dom/events/EventTarget-removeEventListener.any.js': true,
		'dom/events/remove-all-listeners.html': true,
	},
	// Capture/target/bubble over the ancestor path, with target/currentTarget maintenance.
	'EventTarget#dispatchEvent': {
		'dom/events/EventTarget-dispatchEvent.html': true,
		'dom/events/EventTarget-dispatchEvent-returnvalue.html': true,
		'dom/events/Event-dispatch-bubbles-false.html': true,
		'dom/events/Event-dispatch-bubbles-true.html': true,
		'dom/events/Event-dispatch-handlers-changed.html': true,
		'dom/events/Event-dispatch-multiple-cancelBubble.html': true,
		'dom/events/Event-dispatch-multiple-stopPropagation.html': true,
		'dom/events/Event-dispatch-propagation-stopped.html': true,
		'dom/events/Event-dispatch-reenter.html': true,
		'dom/events/Event-dispatch-target-moved.html': true,
		'dom/events/Event-dispatch-throwing.html': true,
		'dom/events/Event-stopImmediatePropagation.html': true,
		'dom/events/Event-defaultPrevented-after-dispatch.html': true,
	},
	Event: { 'dom/events/Event-constructors.any.js': true },
	'Event#composedPath': {
		'shadow-dom/event-composed-path.html': ['Event Path without ShadowRoots.'],
	},
	'Event#isTrusted': {},
	'MutationObserver#childList': {
		'dom/nodes/MutationObserver-childList.html': [/^childList (?!Range\.|Node\.normalize)/],
	},
} as const satisfies Record<string, WPTSelectors>;

export type DOMFeature = keyof typeof features;
