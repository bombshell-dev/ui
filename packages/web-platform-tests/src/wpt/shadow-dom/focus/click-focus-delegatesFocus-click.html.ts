import { setTabIndex, removeTabIndex, resetFocus } from './resources/shadow-utils.js.ts';
import type { CompatibilityContext } from '../../../shared/context.ts';

export const input = ['mouse'] as const;

const markup = `<!DOCTYPE html>
<meta charset="utf-8">
<title>HTML Test: click on shadow host with delegatesFocus</title>






<body>
<div id="host">
  <div id="slotted">slotted</div>
</div>
<div id="outside">outside</div>
</body>


`;

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	function createNestedHosts(
		document: Document,
		outerDelegatesFocus: boolean,
		innerDelegatesFocus: boolean,
	) {
		// Structure:
		// <div> outerHost
		//   <input> outerLightChild
		//   #shadowRoot outerShadow delegatesFocus=true
		//     <div> spacer
		//     <span> innerHost
		//       #shadowRoot innerShadow delegatesFocus=true/false
		//         <input> innerShadowChild
		//     <input> outerShadowChild
		const outerHost = document.createElement('div');
		const outerLightChild = document.createElement('input');
		outerHost.appendChild(outerLightChild);
		const innerHost = document.createElement('span');
		const outerShadow = outerHost.attachShadow({
			mode: 'closed',
			delegatesFocus: outerDelegatesFocus,
		});

		const spacer = document.createElement('div');
		spacer.style.cssText = 'height: 1000px;';
		outerShadow.appendChild(spacer);

		outerShadow.appendChild(innerHost);
		const outerShadowChild = document.createElement('input');
		outerShadow.appendChild(outerShadowChild);

		const innerShadow = innerHost.attachShadow({
			mode: 'closed',
			delegatesFocus: innerDelegatesFocus,
		});
		const innerShadowChild = document.createElement('input');
		innerShadow.appendChild(innerShadowChild);

		document.body.insertBefore(outerHost, document.body.firstChild);
		return {
			outerHost: outerHost,
			outerLightChild: outerLightChild,
			outerShadow: outerShadow,
			outerShadowChild: outerShadowChild,
			innerHost: innerHost,
			innerShadow: innerShadow,
			innerShadowChild: innerShadowChild,
		};
	}
	context.test(
		'click on the host with delegatesFocus with another host with delegatesFocus and a focusable child',
		async ({ document, input }) => {
			const dom = createNestedHosts(document, true, true);
			await input.click(dom.outerHost);
			expect(document.activeElement).toBe(dom.outerHost);
			expect(dom.outerShadow.activeElement).toBe(dom.innerHost);
			expect(dom.innerShadow.activeElement).toBe(dom.innerShadowChild);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'click on the host with delegatesFocus with another host with no delegatesFocus and a focusable child',
		async ({ document, input }) => {
			const dom = createNestedHosts(document, true, false);
			await input.click(dom.outerHost);
			expect(document.activeElement).toBe(dom.outerHost);
			expect(dom.outerShadow.activeElement).toBe(dom.outerShadowChild);
			expect(dom.innerShadow.activeElement).toBe(null);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'click on the host with no delegatesFocus with another host with delegatesFocus and a focusable child',
		async ({ document, input }) => {
			const dom = createNestedHosts(document, false, true);
			await input.click(dom.outerHost);
			expect(document.activeElement).toBe(document.body);
			expect(dom.outerShadow.activeElement).toBe(null);
			expect(dom.innerShadow.activeElement).toBe(null);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'click on the host with no delegatesFocus with another host with no delegatesFocus and a focusable child',
		async ({ document, input }) => {
			const dom = createNestedHosts(document, false, false);
			await input.click(dom.outerHost);
			expect(document.activeElement).toBe(document.body);
			expect(dom.outerShadow.activeElement).toBe(null);
			expect(dom.innerShadow.activeElement).toBe(null);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);

	context.test(
		'call click() on host with delegatesFocus, all tabindex=0',
		({ document }) => {
			const host = document.getElementById('host')!;
			const slotted = document.getElementById('slotted')!;

			const shadowRoot = host.attachShadow({ mode: 'open', delegatesFocus: true });
			const aboveSlot = document.createElement('div');
			aboveSlot.innerText = 'aboveSlot';
			const slot = document.createElement('slot');
			shadowRoot.appendChild(aboveSlot);
			shadowRoot.appendChild(slot);

			const outside = document.getElementById('outside')!;
			const elementsInFlatTreeOrder = [host, aboveSlot, slot, slotted, outside];

			// Final structure:
			// <div #host> (delegatesFocus=true)
			//    #shadowRoot
			//      <div #aboveSlot>
			//      <slot #slot>
			//        (slotted) <div #slotted>
			// <div #outside>

			function setAllTabIndex(value: number) {
				setTabIndex(elementsInFlatTreeOrder, value);
			}

			function removeAllTabIndex() {
				removeTabIndex(elementsInFlatTreeOrder);
			}

			function resetTabIndexAndFocus() {
				removeAllTabIndex();
				resetFocus(document);
				resetFocus(shadowRoot);
			}

			resetTabIndexAndFocus();
			setAllTabIndex(0);
			host.click();
			expect(shadowRoot.activeElement).toBe(null);
			expect(document.activeElement).toBe(document.body);
		},
		{ document: { contentType: 'text/html', content: markup } },
	);
	context.test(
		'call click() on slotted element in delegatesFocus shadow tree, all tabindex=0',
		({ document }) => {
			const host = document.getElementById('host')!;
			const slotted = document.getElementById('slotted')!;

			const shadowRoot = host.attachShadow({ mode: 'open', delegatesFocus: true });
			const aboveSlot = document.createElement('div');
			aboveSlot.innerText = 'aboveSlot';
			const slot = document.createElement('slot');
			shadowRoot.appendChild(aboveSlot);
			shadowRoot.appendChild(slot);

			const outside = document.getElementById('outside')!;
			const elementsInFlatTreeOrder = [host, aboveSlot, slot, slotted, outside];

			// Final structure:
			// <div #host> (delegatesFocus=true)
			//    #shadowRoot
			//      <div #aboveSlot>
			//      <slot #slot>
			//        (slotted) <div #slotted>
			// <div #outside>

			function setAllTabIndex(value: number) {
				setTabIndex(elementsInFlatTreeOrder, value);
			}

			function removeAllTabIndex() {
				removeTabIndex(elementsInFlatTreeOrder);
			}

			function resetTabIndexAndFocus() {
				removeAllTabIndex();
				resetFocus(document);
				resetFocus(shadowRoot);
			}

			resetTabIndexAndFocus();
			setAllTabIndex(0);
			slotted.click();
			expect(shadowRoot.activeElement).toBe(null);
			expect(document.activeElement).toBe(document.body);
		},
		{ document: { contentType: 'text/html', content: markup } },
	);
}
