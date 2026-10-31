import type { FeatureModule } from './context.ts';
import type { DOMFeaturePath } from './features.ts';
import * as expansion0 from './document/basic-creation.ts';
import * as feature12 from './document/creation.ts';
import * as feature14 from './document/lookup.ts';
import * as feature13 from './document/import-node.ts';
import * as expansion1 from './document/xml.ts';
import * as extra1 from './document/parsing.ts';
import * as interactionDocumentXmlSerialization from './document/xml-serialization.ts';
import * as expansion2 from './node/basic-append.ts';
import * as feature126 from './node/relationships.ts';
import * as feature122 from './node/connectivity.ts';
import * as feature125 from './node/live-collections.ts';
import * as feature129 from './node/text-content.ts';
import * as feature120 from './node/append.ts';
import * as feature124 from './node/insert-before.ts';
import * as feature127 from './node/remove.ts';
import * as feature128 from './node/replace.ts';
import * as feature123 from './node/fragments.ts';
import * as feature130 from './node/variadic-mutation.ts';
import * as feature121 from './node/cloning.ts';
import * as expansion3 from './node/comparison.ts';
import * as expansion4 from './node/normalization.ts';
import * as feature119 from './node/adoption.ts';
import * as expansion5 from './character-data/string-storage.ts';
import * as feature0 from './character-data/data.ts';
import * as feature1 from './character-data/editing.ts';
import * as feature2 from './character-data/split-text.ts';
import * as expansion6 from './element/child-elements.ts';
import * as feature16 from './element/attributes.ts';
import * as feature15 from './element/attribute-nodes.ts';
import * as feature18 from './element/namespaces.ts';
import * as feature17 from './element/class-list.ts';
import * as expansion8 from './element/dataset.ts';
import * as expansion9 from './element/reflection.ts';
import * as expansion7 from './element/selectors.ts';
import * as expansion12 from './traversal/node-iterator.ts';
import * as feature164 from './traversal/tree-walker.ts';
import * as feature131 from './parsing/fragments.ts';
import * as feature132 from './parsing/namespaces.ts';
import * as feature133 from './parsing/serialization.ts';
import * as expansion10 from './parsing/contextual.ts';
import * as expansion11 from './parsing/markup-mutation.ts';
import * as interactionParsingRecovery from './parsing/recovery.ts';
import * as feature162 from './templates/content.ts';
import * as feature161 from './templates/cloning.ts';
import * as feature163 from './templates/parsing.ts';
import * as feature82 from './events/data/custom.ts';
import * as feature83 from './events/data/focus.ts';
import * as feature85 from './events/data/keyboard.ts';
import * as feature86 from './events/data/mouse.ts';
import * as feature84 from './events/data/input.ts';
import * as feature95 from './events/dispatch/target.ts';
import * as feature89 from './events/dispatch/capture.ts';
import * as feature87 from './events/dispatch/bubbling.ts';
import * as feature88 from './events/dispatch/cancellation.ts';
import * as feature94 from './events/dispatch/stop-propagation.ts';
import * as feature93 from './events/dispatch/stop-immediate-propagation.ts';
import * as feature90 from './events/dispatch/path-snapshot.ts';
import * as feature92 from './events/dispatch/reuse.ts';
import * as feature91 from './events/dispatch/reentrancy.ts';
import * as feature101 from './events/listeners/registration.ts';
import * as feature98 from './events/listeners/objects.ts';
import * as feature99 from './events/listeners/once.ts';
import * as feature100 from './events/listeners/passive.ts';
import * as feature96 from './events/listeners/abort-signal.ts';
import * as feature102 from './events/listeners/snapshots.ts';
import * as feature97 from './events/listeners/exception-reporting.ts';
import * as feature116 from './mutation-observer/registration.ts';
import * as feature114 from './mutation-observer/records/child-list.ts';
import * as feature112 from './mutation-observer/records/attributes.ts';
import * as feature113 from './mutation-observer/records/character-data.ts';
import * as feature109 from './mutation-observer/filtering.ts';
import * as feature111 from './mutation-observer/old-value.ts';
import * as feature117 from './mutation-observer/subtree.ts';
import * as feature118 from './mutation-observer/take-records.ts';
import * as feature108 from './mutation-observer/disconnect.ts';
import * as feature110 from './mutation-observer/microtask-delivery.ts';
import * as feature107 from './mutation-observer/detached.ts';
import * as feature115 from './mutation-observer/reentrancy.ts';
import * as feature103 from './focus/eligibility.ts';
import * as feature106 from './focus/transitions.ts';
import * as feature105 from './focus/removal.ts';
import * as interactionFocusInert from './focus/inert.ts';
import * as feature104 from './focus/reentrancy.ts';
import * as feature138 from './selection/range/boundaries.ts';
import * as feature140 from './selection/range/comparison.ts';
import * as feature144 from './selection/range/stringification.ts';
import * as feature139 from './selection/range/clone-contents.ts';
import * as feature141 from './selection/range/delete-contents.ts';
import * as feature142 from './selection/range/extract-contents.ts';
import * as feature143 from './selection/range/live-boundaries.ts';
import * as extra0 from './selection/range/mutation.ts';
import * as feature137 from './selection/document/range-management.ts';
import * as feature135 from './selection/document/direction.ts';
import * as feature134 from './selection/document/connectivity.ts';
import * as feature136 from './selection/document/live-updates.ts';
import * as interactionSelectionDocumentMutation from './selection/document/mutation.ts';
import * as interactionSelectionDocumentChangeEvents from './selection/document/change-events.ts';
import * as feature66 from './elements/progress.ts';
import * as feature58 from './elements/meter.ts';
import * as feature60 from './elements/option/attributes.ts';
import * as feature62 from './elements/option/text.ts';
import * as feature61 from './elements/option/selectedness.ts';
import * as feature59 from './elements/optgroup.ts';
import * as feature22 from './elements/datalist.ts';
import * as feature54 from './elements/input/value.ts';
import * as feature50 from './elements/input/sanitization.ts';
import * as feature43 from './elements/input/color-value.ts';
import * as feature47 from './elements/input/numeric-value.ts';
import * as feature44 from './elements/input/date-value.ts';
import * as feature52 from './elements/input/stepping.ts';
import * as feature41 from './elements/input/checkedness.ts';
import * as feature48 from './elements/input/radio-groups.ts';
import * as feature51 from './elements/input/selection.ts';
import * as feature49 from './elements/input/range-text.ts';
import * as feature53 from './elements/input/validation.ts';
import * as feature45 from './elements/input/form-association.ts';
import * as feature46 from './elements/input/labels.ts';
import * as feature40 from './elements/input/activation.ts';
import * as feature42 from './elements/input/cloning.ts';
import * as feature81 from './elements/textarea/value.ts';
import * as feature79 from './elements/textarea/selection.ts';
import * as feature78 from './elements/textarea/range-text.ts';
import * as feature80 from './elements/textarea/validation.ts';
import * as feature76 from './elements/textarea/form-association.ts';
import * as feature77 from './elements/textarea/labels.ts';
import * as feature75 from './elements/textarea/cloning.ts';
import * as feature70 from './elements/select/options.ts';
import * as feature68 from './elements/select/indexed-options.ts';
import * as feature71 from './elements/select/selection.ts';
import * as feature69 from './elements/select/mutation.ts';
import * as feature72 from './elements/select/validation.ts';
import * as feature67 from './elements/select/cloning.ts';
import * as feature73 from './elements/selectedcontent.ts';
import * as feature34 from './elements/form/controls.ts';
import * as feature36 from './elements/form/named-controls.ts';
import * as feature37 from './elements/form/reset.ts';
import * as feature39 from './elements/form/validation.ts';
import * as feature38 from './elements/form/submission.ts';
import * as feature35 from './elements/form/form-data.ts';
import * as interactionElementsFormDataEvents from './elements/form/data-events.ts';
import * as feature20 from './elements/button/attributes.ts';
import * as feature21 from './elements/button/form-association.ts';
import * as feature19 from './elements/button/activation.ts';
import * as feature56 from './elements/label/association.ts';
import * as feature55 from './elements/label/activation.ts';
import * as feature32 from './elements/fieldset/controls.ts';
import * as feature33 from './elements/fieldset/disabled.ts';
import * as feature57 from './elements/legend.ts';
import * as feature63 from './elements/output/html-for.ts';
import * as feature65 from './elements/output/value.ts';
import * as feature64 from './elements/output/reset.ts';
import * as feature24 from './elements/details/open.ts';
import * as feature25 from './elements/details/toggle-events.ts';
import * as feature23 from './elements/details/exclusive-groups.ts';
import * as feature74 from './elements/summary/activation.ts';
import * as feature31 from './elements/dialog/show.ts';
import * as feature26 from './elements/dialog/close.ts';
import * as feature29 from './elements/dialog/modal.ts';
import * as feature30 from './elements/dialog/request-close.ts';
import * as feature27 from './elements/dialog/focus.ts';
import * as feature28 from './elements/dialog/form-submission.ts';
import * as feature10 from './custom-elements/registration.ts';
import * as feature5 from './custom-elements/construction.ts';
import * as feature11 from './custom-elements/upgrading.ts';
import * as feature7 from './custom-elements/observed-attributes.ts';
import * as feature4 from './custom-elements/connection.ts';
import * as feature3 from './custom-elements/adoption.ts';
import * as feature8 from './custom-elements/reaction-ordering.ts';
import * as feature9 from './custom-elements/reentrancy.ts';
import * as feature6 from './custom-elements/exception-reporting.ts';
import * as interactionCustomElementsFormAssociation from './custom-elements/form-association.ts';
import * as feature152 from './shadow/roots/attachment.ts';
import * as feature155 from './shadow/roots/host-eligibility.ts';
import * as feature154 from './shadow/roots/connectivity.ts';
import * as feature153 from './shadow/roots/cloning.ts';
import * as feature151 from './shadow/roots/adoption.ts';
import * as feature159 from './shadow/slots/named.ts';
import * as feature157 from './shadow/slots/fallback.ts';
import * as feature158 from './shadow/slots/manual.ts';
import * as feature160 from './shadow/slots/slotchange.ts';
import * as interactionShadowSlotsObserverOrdering from './shadow/slots/observer-ordering.ts';
import * as feature148 from './shadow/events/retargeting.ts';
import * as feature146 from './shadow/events/composed-path.ts';
import * as feature147 from './shadow/events/related-target.ts';
import * as feature150 from './shadow/focus/retargeting.ts';
import * as feature149 from './shadow/focus/delegation.ts';
import * as feature145 from './shadow/declarative.ts';
import * as feature156 from './shadow/serialization.ts';
import * as expansion13 from './style/inline.ts';
import * as expansion15 from './style/parsing.ts';
import * as expansion14 from './style/attribute-synchronization.ts';
import * as expansion16 from './style/custom-properties.ts';
import * as expansion17 from './style/stylesheets.ts';
import * as expansion18 from './style/computed.ts';
import * as extra2 from './style/cascade.ts';
import * as interactionStyleLayers from './style/layers.ts';
import * as interactionStyleConstructedStylesheets from './style/constructed-stylesheets.ts';
import * as interactionStyleFocusState from './style/focus-state.ts';
import * as interactionStyleControlSelectors from './style/control-selectors.ts';
import * as interactionStyleRelationalSelectors from './style/relational-selectors.ts';
import * as interactionStyleMutationObservation from './style/mutation-observation.ts';
import * as inputKeyboardDelivery from './input/keyboard/delivery.ts';
import * as inputKeyboardModifiers from './input/keyboard/modifiers.ts';
import * as inputKeyboardNavigation from './input/keyboard/navigation.ts';
import * as inputKeyboardActivation from './input/keyboard/activation.ts';
import * as inputKeyboardEditing from './input/keyboard/editing.ts';
import * as interactionInputKeyboardMultilineEditing from './input/keyboard/multiline-editing.ts';
import * as interactionInputKeyboardNumberStepping from './input/keyboard/number-stepping.ts';
import * as interactionInputKeyboardFocusStyles from './input/keyboard/focus-styles.ts';
import * as interactionInputKeyboardFocusVisible from './input/keyboard/focus-visible.ts';
import * as interactionInputKeyboardShadow from './input/keyboard/shadow.ts';
import * as inputKeyboardImplicitSubmission from './input/keyboard/implicit-submission.ts';
import * as inputKeyboardTrustedEvents from './input/keyboard/trusted-events.ts';
import * as inputMouseDelivery from './input/mouse/delivery.ts';
import * as inputMouseButtons from './input/mouse/buttons.ts';
import * as inputMouseHover from './input/mouse/hover.ts';
import * as inputMouseFocus from './input/mouse/focus.ts';
import * as inputMouseActivation from './input/mouse/activation.ts';
import * as interactionInputMouseStateStyles from './input/mouse/state-styles.ts';
import * as interactionInputMouseFocusVisible from './input/mouse/focus-visible.ts';
import * as inputMouseShadow from './input/mouse/shadow.ts';
import * as inputMouseTrustedEvents from './input/mouse/trusted-events.ts';

/** Exhaustiveness is checked by TypeScript and compatibility-harness.ts. */
export const registry = {
	'document.basicCreation': expansion0,
	'document.creation': feature12,
	'document.lookup': feature14,
	'document.importNode': feature13,
	'document.xml': expansion1,
	'document.parsing': extra1,
	'document.xmlSerialization': interactionDocumentXmlSerialization,
	'node.basicAppend': expansion2,
	'node.relationships': feature126,
	'node.connectivity': feature122,
	'node.liveCollections': feature125,
	'node.textContent': feature129,
	'node.append': feature120,
	'node.insertBefore': feature124,
	'node.remove': feature127,
	'node.replace': feature128,
	'node.fragments': feature123,
	'node.variadicMutation': feature130,
	'node.cloning': feature121,
	'node.comparison': expansion3,
	'node.normalization': expansion4,
	'node.adoption': feature119,
	'characterData.stringStorage': expansion5,
	'characterData.data': feature0,
	'characterData.editing': feature1,
	'characterData.splitText': feature2,
	'element.childElements': expansion6,
	'element.attributes': feature16,
	'element.attributeNodes': feature15,
	'element.namespaces': feature18,
	'element.classList': feature17,
	'element.dataset': expansion8,
	'element.reflection': expansion9,
	'element.selectors': expansion7,
	'traversal.nodeIterator': expansion12,
	'traversal.treeWalker': feature164,
	'parsing.fragments': feature131,
	'parsing.namespaces': feature132,
	'parsing.serialization': feature133,
	'parsing.contextual': expansion10,
	'parsing.markupMutation': expansion11,
	'parsing.recovery': interactionParsingRecovery,
	'templates.content': feature162,
	'templates.cloning': feature161,
	'templates.parsing': feature163,
	'events.data.custom': feature82,
	'events.data.focus': feature83,
	'events.data.keyboard': feature85,
	'events.data.mouse': feature86,
	'events.data.input': feature84,
	'events.dispatch.target': feature95,
	'events.dispatch.capture': feature89,
	'events.dispatch.bubbling': feature87,
	'events.dispatch.cancellation': feature88,
	'events.dispatch.stopPropagation': feature94,
	'events.dispatch.stopImmediatePropagation': feature93,
	'events.dispatch.pathSnapshot': feature90,
	'events.dispatch.reuse': feature92,
	'events.dispatch.reentrancy': feature91,
	'events.listeners.registration': feature101,
	'events.listeners.objects': feature98,
	'events.listeners.once': feature99,
	'events.listeners.passive': feature100,
	'events.listeners.abortSignal': feature96,
	'events.listeners.snapshots': feature102,
	'events.listeners.exceptionReporting': feature97,
	'mutationObserver.registration': feature116,
	'mutationObserver.records.childList': feature114,
	'mutationObserver.records.attributes': feature112,
	'mutationObserver.records.characterData': feature113,
	'mutationObserver.filtering': feature109,
	'mutationObserver.oldValue': feature111,
	'mutationObserver.subtree': feature117,
	'mutationObserver.takeRecords': feature118,
	'mutationObserver.disconnect': feature108,
	'mutationObserver.microtaskDelivery': feature110,
	'mutationObserver.detached': feature107,
	'mutationObserver.reentrancy': feature115,
	'focus.eligibility': feature103,
	'focus.transitions': feature106,
	'focus.removal': feature105,
	'focus.inert': interactionFocusInert,
	'focus.reentrancy': feature104,
	'selection.range.boundaries': feature138,
	'selection.range.comparison': feature140,
	'selection.range.stringification': feature144,
	'selection.range.cloneContents': feature139,
	'selection.range.deleteContents': feature141,
	'selection.range.extractContents': feature142,
	'selection.range.liveBoundaries': feature143,
	'selection.range.mutation': extra0,
	'selection.document.rangeManagement': feature137,
	'selection.document.direction': feature135,
	'selection.document.connectivity': feature134,
	'selection.document.liveUpdates': feature136,
	'selection.document.mutation': interactionSelectionDocumentMutation,
	'selection.document.changeEvents': interactionSelectionDocumentChangeEvents,
	'elements.progress': feature66,
	'elements.meter': feature58,
	'elements.option.attributes': feature60,
	'elements.option.text': feature62,
	'elements.option.selectedness': feature61,
	'elements.optgroup': feature59,
	'elements.datalist': feature22,
	'elements.input.value': feature54,
	'elements.input.sanitization': feature50,
	'elements.input.colorValue': feature43,
	'elements.input.numericValue': feature47,
	'elements.input.dateValue': feature44,
	'elements.input.stepping': feature52,
	'elements.input.checkedness': feature41,
	'elements.input.radioGroups': feature48,
	'elements.input.selection': feature51,
	'elements.input.rangeText': feature49,
	'elements.input.validation': feature53,
	'elements.input.formAssociation': feature45,
	'elements.input.labels': feature46,
	'elements.input.activation': feature40,
	'elements.input.cloning': feature42,
	'elements.textarea.value': feature81,
	'elements.textarea.selection': feature79,
	'elements.textarea.rangeText': feature78,
	'elements.textarea.validation': feature80,
	'elements.textarea.formAssociation': feature76,
	'elements.textarea.labels': feature77,
	'elements.textarea.cloning': feature75,
	'elements.select.options': feature70,
	'elements.select.indexedOptions': feature68,
	'elements.select.selection': feature71,
	'elements.select.mutation': feature69,
	'elements.select.validation': feature72,
	'elements.select.cloning': feature67,
	'elements.selectedcontent': feature73,
	'elements.form.controls': feature34,
	'elements.form.namedControls': feature36,
	'elements.form.reset': feature37,
	'elements.form.validation': feature39,
	'elements.form.submission': feature38,
	'elements.form.formData': feature35,
	'elements.form.dataEvents': interactionElementsFormDataEvents,
	'elements.button.attributes': feature20,
	'elements.button.formAssociation': feature21,
	'elements.button.activation': feature19,
	'elements.label.association': feature56,
	'elements.label.activation': feature55,
	'elements.fieldset.controls': feature32,
	'elements.fieldset.disabled': feature33,
	'elements.legend': feature57,
	'elements.output.htmlFor': feature63,
	'elements.output.value': feature65,
	'elements.output.reset': feature64,
	'elements.details.open': feature24,
	'elements.details.toggleEvents': feature25,
	'elements.details.exclusiveGroups': feature23,
	'elements.summary.activation': feature74,
	'elements.dialog.show': feature31,
	'elements.dialog.close': feature26,
	'elements.dialog.modal': feature29,
	'elements.dialog.requestClose': feature30,
	'elements.dialog.focus': feature27,
	'elements.dialog.formSubmission': feature28,
	'customElements.registration': feature10,
	'customElements.construction': feature5,
	'customElements.upgrading': feature11,
	'customElements.observedAttributes': feature7,
	'customElements.connection': feature4,
	'customElements.adoption': feature3,
	'customElements.reactionOrdering': feature8,
	'customElements.reentrancy': feature9,
	'customElements.exceptionReporting': feature6,
	'customElements.formAssociation': interactionCustomElementsFormAssociation,
	'shadow.roots.attachment': feature152,
	'shadow.roots.hostEligibility': feature155,
	'shadow.roots.connectivity': feature154,
	'shadow.roots.cloning': feature153,
	'shadow.roots.adoption': feature151,
	'shadow.slots.named': feature159,
	'shadow.slots.fallback': feature157,
	'shadow.slots.manual': feature158,
	'shadow.slots.slotchange': feature160,
	'shadow.slots.observerOrdering': interactionShadowSlotsObserverOrdering,
	'shadow.events.retargeting': feature148,
	'shadow.events.composedPath': feature146,
	'shadow.events.relatedTarget': feature147,
	'shadow.focus.retargeting': feature150,
	'shadow.focus.delegation': feature149,
	'shadow.declarative': feature145,
	'shadow.serialization': feature156,
	'style.inline': expansion13,
	'style.parsing': expansion15,
	'style.attributeSynchronization': expansion14,
	'style.customProperties': expansion16,
	'style.stylesheets': expansion17,
	'style.computed': expansion18,
	'style.cascade': extra2,
	'style.layers': interactionStyleLayers,
	'style.constructedStylesheets': interactionStyleConstructedStylesheets,
	'style.focusState': interactionStyleFocusState,
	'style.controlSelectors': interactionStyleControlSelectors,
	'style.relationalSelectors': interactionStyleRelationalSelectors,
	'style.mutationObservation': interactionStyleMutationObservation,
	'input.keyboard.delivery': inputKeyboardDelivery,
	'input.keyboard.modifiers': inputKeyboardModifiers,
	'input.keyboard.navigation': inputKeyboardNavigation,
	'input.keyboard.activation': inputKeyboardActivation,
	'input.keyboard.editing': inputKeyboardEditing,
	'input.keyboard.multilineEditing': interactionInputKeyboardMultilineEditing,
	'input.keyboard.numberStepping': interactionInputKeyboardNumberStepping,
	'input.keyboard.focusStyles': interactionInputKeyboardFocusStyles,
	'input.keyboard.focusVisible': interactionInputKeyboardFocusVisible,
	'input.keyboard.shadow': interactionInputKeyboardShadow,
	'input.keyboard.implicitSubmission': inputKeyboardImplicitSubmission,
	'input.keyboard.trustedEvents': inputKeyboardTrustedEvents,
	'input.mouse.delivery': inputMouseDelivery,
	'input.mouse.buttons': inputMouseButtons,
	'input.mouse.hover': inputMouseHover,
	'input.mouse.focus': inputMouseFocus,
	'input.mouse.activation': inputMouseActivation,
	'input.mouse.stateStyles': interactionInputMouseStateStyles,
	'input.mouse.focusVisible': interactionInputMouseFocusVisible,
	'input.mouse.shadow': inputMouseShadow,
	'input.mouse.trustedEvents': inputMouseTrustedEvents,
} satisfies Record<DOMFeaturePath, FeatureModule>;
