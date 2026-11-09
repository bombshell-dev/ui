import type { CompatibilityContext } from '../../../shared/context.ts';

const markup = `<!DOCTYPE html>






<template id='ShadowTemplate'>
  <ul>
    <li tabindex='0' id='one'>One</li>
    <li tabindex='0' id='two'>Two</li>
    <li id='three'>Three</li>
  </ul>
</template>
<template id='NoFocusableShadowTemplate'>
  <ul>
    <li id='one'>One</li>
    <li id='two'>Two</li>
    <li id='three'>Three</li>
  </ul>
</template>
<body>
<input id='input0'>
<x-shadow id='xshadow0'></x-shadow>
<x-shadow id='xshadow1' tabindex='0'></x-shadow>
<x-shadow id='xshadow2' tabindex='0' delegatesFocus></x-shadow>
<x-shadow-nofocus id='xshadow3'></x-shadow-nofocus>
<x-shadow-nofocus id='xshadow4' tabindex='0'></x-shadow-nofocus>
<x-shadow-nofocus id='xshadow5' tabindex='0' delegatesFocus></x-shadow-nofocus>
</body>

`;

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'xshadow0 is not focusable without tabindex.',
		({ document, HTMLElement, customElements }) => {
			function registerShadow(templateId: string, tagName: string) {
				const template = document.getElementById(templateId) as HTMLTemplateElement;

				customElements.define(
					tagName,
					class extends HTMLElement {
						connectedCallback() {
							const delegatesFocus = this.hasAttribute('delegatesFocus');
							this.attachShadow({ mode: 'open', delegatesFocus: delegatesFocus }).appendChild(
								document.importNode(template.content, true),
							);
						}
					},
				);
			}

			registerShadow('ShadowTemplate', 'x-shadow');
			registerShadow('NoFocusableShadowTemplate', 'x-shadow-nofocus');
			const input0 = document.getElementById('input0')!;
			const xshadow0 = document.getElementById('xshadow0')!;
			const xshadow1 = document.getElementById('xshadow1')!;
			const xshadow2 = document.getElementById('xshadow2')!;
			const xshadow3 = document.getElementById('xshadow3')!;
			const xshadow4 = document.getElementById('xshadow4')!;
			const xshadow5 = document.getElementById('xshadow5')!;

			xshadow0.focus();
			expect(document.activeElement!.tagName).toBe('BODY');
			expect(xshadow0.shadowRoot!.activeElement).toBe(null);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'xshadow1 becomes focusable with tabindex.',
		({ document, HTMLElement, customElements }) => {
			function registerShadow(templateId: string, tagName: string) {
				const template = document.getElementById(templateId) as HTMLTemplateElement;

				customElements.define(
					tagName,
					class extends HTMLElement {
						connectedCallback() {
							const delegatesFocus = this.hasAttribute('delegatesFocus');
							this.attachShadow({ mode: 'open', delegatesFocus: delegatesFocus }).appendChild(
								document.importNode(template.content, true),
							);
						}
					},
				);
			}

			registerShadow('ShadowTemplate', 'x-shadow');
			registerShadow('NoFocusableShadowTemplate', 'x-shadow-nofocus');
			const input0 = document.getElementById('input0')!;
			const xshadow0 = document.getElementById('xshadow0')!;
			const xshadow1 = document.getElementById('xshadow1')!;
			const xshadow2 = document.getElementById('xshadow2')!;
			const xshadow3 = document.getElementById('xshadow3')!;
			const xshadow4 = document.getElementById('xshadow4')!;
			const xshadow5 = document.getElementById('xshadow5')!;
			xshadow0.focus();
			xshadow1.focus();
			expect(document.activeElement!.id).toBe('xshadow1');
			expect(xshadow1.shadowRoot!.activeElement).toBe(null);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'on focus(), focusable xshadow2 with delegatesFocus=true delegates focus into its inner element.',
		({ document, HTMLElement, customElements }) => {
			function registerShadow(templateId: string, tagName: string) {
				const template = document.getElementById(templateId) as HTMLTemplateElement;

				customElements.define(
					tagName,
					class extends HTMLElement {
						connectedCallback() {
							const delegatesFocus = this.hasAttribute('delegatesFocus');
							this.attachShadow({ mode: 'open', delegatesFocus: delegatesFocus }).appendChild(
								document.importNode(template.content, true),
							);
						}
					},
				);
			}

			registerShadow('ShadowTemplate', 'x-shadow');
			registerShadow('NoFocusableShadowTemplate', 'x-shadow-nofocus');
			const input0 = document.getElementById('input0')!;
			const xshadow0 = document.getElementById('xshadow0')!;
			const xshadow1 = document.getElementById('xshadow1')!;
			const xshadow2 = document.getElementById('xshadow2')!;
			const xshadow3 = document.getElementById('xshadow3')!;
			const xshadow4 = document.getElementById('xshadow4')!;
			const xshadow5 = document.getElementById('xshadow5')!;
			xshadow0.focus();
			xshadow1.focus();
			xshadow2.focus();
			expect(document.activeElement!.id).toBe('xshadow2');
			expect(xshadow2.shadowRoot!.activeElement!.id).toBe('one');
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'if an element within shadow is focused, focusing on shadow host should not slide focus to its inner element.',
		({ document, HTMLElement, customElements }) => {
			function registerShadow(templateId: string, tagName: string) {
				const template = document.getElementById(templateId) as HTMLTemplateElement;

				customElements.define(
					tagName,
					class extends HTMLElement {
						connectedCallback() {
							const delegatesFocus = this.hasAttribute('delegatesFocus');
							this.attachShadow({ mode: 'open', delegatesFocus: delegatesFocus }).appendChild(
								document.importNode(template.content, true),
							);
						}
					},
				);
			}

			registerShadow('ShadowTemplate', 'x-shadow');
			registerShadow('NoFocusableShadowTemplate', 'x-shadow-nofocus');
			const input0 = document.getElementById('input0')!;
			const xshadow0 = document.getElementById('xshadow0')!;
			const xshadow1 = document.getElementById('xshadow1')!;
			const xshadow2 = document.getElementById('xshadow2')!;
			const xshadow3 = document.getElementById('xshadow3')!;
			const xshadow4 = document.getElementById('xshadow4')!;
			const xshadow5 = document.getElementById('xshadow5')!;
			xshadow0.focus();
			xshadow1.focus();
			xshadow2.focus();
			xshadow2.shadowRoot!.querySelector<HTMLElement>('#two')!.focus();
			expect(document.activeElement!.id).toBe('xshadow2');
			expect(xshadow2.shadowRoot!.activeElement!.id).toBe('two');
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		"xshadow2.focus() shouldn't move focus to #one when its inner element is already focused.",
		({ document, HTMLElement, customElements }) => {
			function registerShadow(templateId: string, tagName: string) {
				const template = document.getElementById(templateId) as HTMLTemplateElement;

				customElements.define(
					tagName,
					class extends HTMLElement {
						connectedCallback() {
							const delegatesFocus = this.hasAttribute('delegatesFocus');
							this.attachShadow({ mode: 'open', delegatesFocus: delegatesFocus }).appendChild(
								document.importNode(template.content, true),
							);
						}
					},
				);
			}

			registerShadow('ShadowTemplate', 'x-shadow');
			registerShadow('NoFocusableShadowTemplate', 'x-shadow-nofocus');
			const input0 = document.getElementById('input0')!;
			const xshadow0 = document.getElementById('xshadow0')!;
			const xshadow1 = document.getElementById('xshadow1')!;
			const xshadow2 = document.getElementById('xshadow2')!;
			const xshadow3 = document.getElementById('xshadow3')!;
			const xshadow4 = document.getElementById('xshadow4')!;
			const xshadow5 = document.getElementById('xshadow5')!;
			xshadow0.focus();
			xshadow1.focus();
			xshadow2.focus();
			xshadow2.shadowRoot!.querySelector<HTMLElement>('#two')!.focus();
			xshadow2.focus();
			expect(document.activeElement!.id).toBe('xshadow2');
			expect(xshadow2.shadowRoot!.activeElement!.id).toBe('two');
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'focus() inside shadow DOM should not focus its shadow host, nor focusable siblings.',
		({ document, HTMLElement, customElements }) => {
			function registerShadow(templateId: string, tagName: string) {
				const template = document.getElementById(templateId) as HTMLTemplateElement;

				customElements.define(
					tagName,
					class extends HTMLElement {
						connectedCallback() {
							const delegatesFocus = this.hasAttribute('delegatesFocus');
							this.attachShadow({ mode: 'open', delegatesFocus: delegatesFocus }).appendChild(
								document.importNode(template.content, true),
							);
						}
					},
				);
			}

			registerShadow('ShadowTemplate', 'x-shadow');
			registerShadow('NoFocusableShadowTemplate', 'x-shadow-nofocus');
			const input0 = document.getElementById('input0')!;
			const xshadow0 = document.getElementById('xshadow0')!;
			const xshadow1 = document.getElementById('xshadow1')!;
			const xshadow2 = document.getElementById('xshadow2')!;
			const xshadow3 = document.getElementById('xshadow3')!;
			const xshadow4 = document.getElementById('xshadow4')!;
			const xshadow5 = document.getElementById('xshadow5')!;
			xshadow0.focus();
			xshadow1.focus();
			xshadow2.focus();
			xshadow2.shadowRoot!.querySelector<HTMLElement>('#two')!.focus();
			xshadow2.focus();
			// Focus outside shadow DOMs.
			input0.focus();

			// within shadow root.  This is different from mouse click behavior.
			xshadow1.shadowRoot!.querySelector<HTMLElement>('#three')!.focus();
			expect(document.activeElement!.id).toBe('input0');
			xshadow2.shadowRoot!.querySelector<HTMLElement>('#three')!.focus();
			expect(document.activeElement!.id).toBe('input0');
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		"If any element including shadow host is not focusable, focus doesn't change.",
		({ document, HTMLElement, customElements }) => {
			function registerShadow(templateId: string, tagName: string) {
				const template = document.getElementById(templateId) as HTMLTemplateElement;

				customElements.define(
					tagName,
					class extends HTMLElement {
						connectedCallback() {
							const delegatesFocus = this.hasAttribute('delegatesFocus');
							this.attachShadow({ mode: 'open', delegatesFocus: delegatesFocus }).appendChild(
								document.importNode(template.content, true),
							);
						}
					},
				);
			}

			registerShadow('ShadowTemplate', 'x-shadow');
			registerShadow('NoFocusableShadowTemplate', 'x-shadow-nofocus');
			const input0 = document.getElementById('input0')!;
			const xshadow0 = document.getElementById('xshadow0')!;
			const xshadow1 = document.getElementById('xshadow1')!;
			const xshadow2 = document.getElementById('xshadow2')!;
			const xshadow3 = document.getElementById('xshadow3')!;
			const xshadow4 = document.getElementById('xshadow4')!;
			const xshadow5 = document.getElementById('xshadow5')!;
			xshadow0.focus();
			xshadow1.focus();
			xshadow2.focus();
			xshadow2.shadowRoot!.querySelector<HTMLElement>('#two')!.focus();
			xshadow2.focus();
			input0.focus();
			xshadow1.shadowRoot!.querySelector<HTMLElement>('#three')!.focus();
			xshadow2.shadowRoot!.querySelector<HTMLElement>('#three')!.focus();
			xshadow3.focus();
			expect(document.activeElement!.id).toBe('input0');
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		"If no element is focusable within a delegatesFocus shadow root, the host can't get focus regardless of host's tabIndex.",
		({ document, HTMLElement, customElements }) => {
			function registerShadow(templateId: string, tagName: string) {
				const template = document.getElementById(templateId) as HTMLTemplateElement;

				customElements.define(
					tagName,
					class extends HTMLElement {
						connectedCallback() {
							const delegatesFocus = this.hasAttribute('delegatesFocus');
							this.attachShadow({ mode: 'open', delegatesFocus: delegatesFocus }).appendChild(
								document.importNode(template.content, true),
							);
						}
					},
				);
			}

			registerShadow('ShadowTemplate', 'x-shadow');
			registerShadow('NoFocusableShadowTemplate', 'x-shadow-nofocus');
			const input0 = document.getElementById('input0')!;
			const xshadow0 = document.getElementById('xshadow0')!;
			const xshadow1 = document.getElementById('xshadow1')!;
			const xshadow2 = document.getElementById('xshadow2')!;
			const xshadow3 = document.getElementById('xshadow3')!;
			const xshadow4 = document.getElementById('xshadow4')!;
			const xshadow5 = document.getElementById('xshadow5')!;
			xshadow0.focus();
			xshadow1.focus();
			xshadow2.focus();
			xshadow2.shadowRoot!.querySelector<HTMLElement>('#two')!.focus();
			xshadow2.focus();
			input0.focus();
			xshadow1.shadowRoot!.querySelector<HTMLElement>('#three')!.focus();
			xshadow2.shadowRoot!.querySelector<HTMLElement>('#three')!.focus();
			xshadow3.focus();
			xshadow4.focus();
			expect(document.activeElement!.id).toBe('xshadow4');
			xshadow5.focus();
			expect(document.activeElement!.id).toBe('xshadow4');
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
}
