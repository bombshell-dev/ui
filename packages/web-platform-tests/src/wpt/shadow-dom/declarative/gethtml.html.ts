import type { CompatibilityContext } from '../../../shared/context.ts';
import { HTML5_ELEMENTS, HTML5_SHADOW_ALLOWED_ELEMENTS } from '../../html/resources/common.js.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	function testElementType(
		allowsShadowDom: boolean,
		elementType: string,
		runGetHTMLOnShadowRoot: boolean,
		lightDOMContent: string,
		declarativeShadowDom?: boolean,
		mode?: ShadowRootMode,
		delegatesFocus?: boolean,
		serializable?: string,
		clonable?: boolean,
		emptyShadowTree?: boolean,
	) {
		context.test(
			`${runGetHTMLOnShadowRoot ? 'ShadowRoot' : 'Element'}.getHTML() on ` +
				`<${elementType}>${lightDOMContent}${
					allowsShadowDom
						? `, with ${declarativeShadowDom ? 'declarative' : 'imperative'} shadow, ` +
							`mode=${mode}, delegatesFocus=${delegatesFocus}, ` +
							`serializable=${serializable}, clonable=${clonable},`
						: ''
				}` +
				` with${emptyShadowTree ? `out` : ``} shadow tree contents.`,
			({ document, cleanup }) => {
				// Create and attach element
				let wrapper: HTMLElement | ShadowRoot;
				if (runGetHTMLOnShadowRoot) {
					// This ensures we're testing both Element.getHTML() and ShadowRoot.getHTML().
					const host = document.createElement('div');
					cleanup(function () {
						host.remove();
					});
					document.body.appendChild(host);
					wrapper = host.attachShadow({ mode: 'open' });
				} else {
					wrapper = document.createElement('div');
					cleanup(function () {
						(wrapper as HTMLElement).remove();
					});
					document.body.appendChild(wrapper);
				}

				let shadowRoot: ShadowRoot | undefined;
				let initDict: ShadowRootInit = {
					mode: mode as ShadowRootMode,
					delegatesFocus: delegatesFocus,
					clonable,
				};
				let expectedSerializable = null;
				switch (serializable) {
					case undefined:
						expectedSerializable = false;
						break;
					case 'true':
						initDict.serializable = expectedSerializable = true;
						break;
					case 'false':
						initDict.serializable = expectedSerializable = false;
						break;
					default:
						throw new Error(`Invalid serializable ${serializable}`);
				}
				const delegatesAttr = delegatesFocus ? ' shadowrootdelegatesfocus=""' : '';
				const serializableAttr = expectedSerializable ? ' shadowrootserializable=""' : '';
				const clonableAttr = clonable ? ' shadowrootclonable=""' : '';

				if (allowsShadowDom && declarativeShadowDom) {
					const html =
						`<${elementType}>${lightDOMContent}<template ` +
						`shadowrootmode=${mode}${delegatesAttr}${serializableAttr}` +
						`${clonableAttr}>`;
					wrapper.setHTMLUnsafe(html);
					// Get hold of the declarative shadow root in a way that works when its mode is "closed"
					shadowRoot = wrapper.firstElementChild!.attachShadow(initDict);
				} else {
					// Imperative shadow dom
					const element = document.createElement(elementType);
					wrapper.appendChild(element);
					const temp = document.createElement('div');
					temp.innerHTML = lightDOMContent;
					element.append(...temp.childNodes);
					if (allowsShadowDom) {
						shadowRoot = element.attachShadow(initDict);
					}
				}
				expect(!allowsShadowDom || !!shadowRoot).toBe(true);

				if (allowsShadowDom) {
					const correctShadowHtml =
						`<template shadowrootmode="${mode}"` +
						`${delegatesAttr}${serializableAttr}${clonableAttr}>` +
						(emptyShadowTree ? `` : `<slot></slot>`) +
						`</template>`;
					const correctHtml =
						`<${elementType}>${correctShadowHtml}` + `${lightDOMContent}</${elementType}>`;
					expect(shadowRoot!.mode).toBe(mode);
					expect(shadowRoot!.delegatesFocus).toBe(delegatesFocus);
					expect(shadowRoot!.serializable).toBe(expectedSerializable);
					expect(shadowRoot!.clonable).toBe(clonable);
					if (!emptyShadowTree) {
						shadowRoot!.appendChild(document.createElement('slot'));
					}
					const emptyElement = `<${elementType}>${lightDOMContent}</${elementType}>`;
					if (expectedSerializable) {
						expect(wrapper.getHTML({ serializableShadowRoots: true })).toBe(correctHtml);
						expect(
							wrapper.firstElementChild!.getHTML({
								serializableShadowRoots: true,
							}),
						).toBe(`${correctShadowHtml}${lightDOMContent}`);
					} else {
						expect(wrapper.getHTML({ serializableShadowRoots: true })).toBe(emptyElement);
					}
					// If we provide the shadow root, serialize it, regardless of serializableShadowRoots.
					expect(
						wrapper.getHTML({
							serializableShadowRoots: true,
							shadowRoots: [shadowRoot!],
						}),
					).toBe(correctHtml);
					expect(
						wrapper.getHTML({
							serializableShadowRoots: false,
							shadowRoots: [shadowRoot!],
						}),
					).toBe(correctHtml);
					expect(wrapper.getHTML({ shadowRoots: [shadowRoot!] })).toBe(correctHtml);
				} else {
					// For non-shadow hosts, getHTML() should also match .innerHTML
					expect(wrapper.getHTML({ serializableShadowRoots: true })).toBe(wrapper.innerHTML);
				}

				// Either way, make sure getHTML({serializableShadowRoots: false}) matches .innerHTML
				expect(
					wrapper.getHTML({ serializableShadowRoots: false }),
					'getHTML() with serializableShadowRoots false should return the same as .innerHTML',
				).toBe(wrapper.innerHTML);
				// ...and that the default for serializableShadowRoots is false.
				expect(wrapper.getHTML(), 'The default for serializableShadowRoots should be false').toBe(
					wrapper.innerHTML,
				);
			},
			{
				document: {
					contentType: 'text/html',
					content:
						'<!DOCTYPE html>\n<title>getHTML behavior</title>\n<meta name="timeout" content="long">\n\n\n\n\n\n\n<body>\n\n\n',
				},
			},
		);
	}
	function runAllTests() {
		const allElements = [...HTML5_ELEMENTS, 'htmlunknown'];
		const safelisted = HTML5_SHADOW_ALLOWED_ELEMENTS.filter((el) => el != 'body');
		for (const elementName of allElements) {
			const allowsShadowDom = safelisted.includes(elementName);
			for (const runGetHTMLOnShadowRoot of [false, true]) {
				for (const lightDOMContent of ['', '<span>light</span>']) {
					if (allowsShadowDom) {
						for (const declarativeShadowDom of [false, true]) {
							for (const delegatesFocus of [false, true]) {
								for (const clonable of [false, true]) {
									for (const mode of ['open', 'closed'] as const) {
										for (const serializable of [undefined, 'false', 'true']) {
											for (const emptyShadowTree of [false, true]) {
												testElementType(
													true,
													elementName,
													runGetHTMLOnShadowRoot,
													lightDOMContent,
													declarativeShadowDom,
													mode,
													delegatesFocus,
													serializable,
													clonable,
													emptyShadowTree,
												);
											}
										}
									}
								}
							}
						}
					} else {
						testElementType(false, elementName, runGetHTMLOnShadowRoot, lightDOMContent);
					}
				}
			}
		}
	}

	runAllTests();
}
