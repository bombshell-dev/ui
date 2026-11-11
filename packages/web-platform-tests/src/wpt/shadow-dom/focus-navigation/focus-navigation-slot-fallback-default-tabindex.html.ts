import type { CompatibilityContext } from '../../../shared/context.ts';

export const input = ['keyboard'] as const;

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'Default tabindex for a slot node should be 0.',
		async ({ document, Node, input }) => {
			function convertTemplatesToShadowRootsWithin(node: ParentNode) {
				var nodes = node.querySelectorAll('template');
				for (var i = 0; i < nodes.length; ++i) {
					var template = nodes[i]!;
					var mode = template.getAttribute('data-mode');
					var delegatesFocus = template.hasAttribute('data-delegatesFocus');
					var parent = template.parentNode! as HTMLElement;
					parent.removeChild(template);
					var shadowRoot;
					if (!mode) {
						shadowRoot = parent.attachShadow({ mode: 'open' });
					} else {
						shadowRoot = parent.attachShadow({
							mode: mode as ShadowRootMode,
							delegatesFocus: delegatesFocus,
						});
					}
					var expose = template.getAttribute('data-expose-as');
					if (expose) Reflect.set(document.defaultView!, expose, shadowRoot);
					if (template.id) Reflect.set(shadowRoot, 'id', template.id);
					var fragments = document.importNode(template.content, true);
					shadowRoot.appendChild(fragments);

					convertTemplatesToShadowRootsWithin(shadowRoot);
				}
			}

			function isShadowHost(node: Element | null): node is HTMLElement {
				return Boolean(node && node.nodeType == Node.ELEMENT_NODE && node.shadowRoot);
			}

			function isIFrameElement(element: Element | null): element is HTMLIFrameElement {
				return Boolean(element && element.nodeName == 'IFRAME');
			}

			// Returns node from shadow/iframe tree "path".
			function getNodeInComposedTree(path: string) {
				var ids = path.split('/');
				var node = document.getElementById(ids[0]!);
				for (var i = 1; node != null && i < ids.length; ++i) {
					if (isIFrameElement(node)) node = node.contentDocument!.getElementById(ids[i]!);
					else if (isShadowHost(node)) node = node.shadowRoot!.getElementById(ids[i]!);
					else return null;
				}
				return node;
			}

			function waitForRender() {
				return new Promise<void>((resolve) =>
					document.defaultView!.requestAnimationFrame(() =>
						document.defaultView!.requestAnimationFrame(() => resolve()),
					),
				);
			}
			async function navigateFocusForward() {
				await waitForRender();
				document.body.focus();
				await input.press('Tab');
				await waitForRender();
			}
			async function navigateFocusBackward() {
				await waitForRender();
				await input.keyDown('Shift');
				await input.press('Tab');
				await input.keyUp('Shift');
				await waitForRender();
			}
			function innermostActiveElement(element: Element | null = null): Element | null {
				element = element || document.activeElement;
				if (isIFrameElement(element)) {
					if (element.contentDocument!.activeElement)
						return innermostActiveElement(element.contentDocument!.activeElement);
					return element;
				}
				if (isShadowHost(element)) {
					let shadowRoot = element.shadowRoot;
					if (shadowRoot) {
						if (shadowRoot.activeElement) return innermostActiveElement(shadowRoot.activeElement);
					}
				}
				return element;
			}

			function isInnermostActiveElement(path: string) {
				const element = getNodeInComposedTree(path);
				if (!element) return false;
				return element === innermostActiveElement();
			}

			async function shouldNavigateFocus(fromElement: HTMLElement | null, direction: string) {
				if (!fromElement) return false;

				fromElement.focus();
				if (fromElement !== innermostActiveElement()) return false;

				if (direction == 'forward') await navigateFocusForward();
				else await navigateFocusBackward();

				return true;
			}

			async function assert_focus_navigation_element(
				fromPath: string,
				toPath: string,
				direction: string,
			) {
				const fromElement = getNodeInComposedTree(fromPath) as HTMLElement | null;
				const result = await shouldNavigateFocus(fromElement, direction);
				expect(result, 'Failed to focus ' + fromPath).toBe(true);

				const message = `Focus should move ${direction} from ${fromPath} to ${toPath}`;
				const toElement = getNodeInComposedTree(toPath);
				expect(innermostActiveElement(), message).toBe(toElement);
			}

			async function assert_focus_navigation_elements(elements: string[], direction: string) {
				expect(
					elements.length >= 2,
					'length of elements should be greater than or equal to 2.',
				).toBe(true);
				for (var i = 0; i + 1 < elements.length; ++i)
					await assert_focus_navigation_element(elements[i]!, elements[i + 1]!, direction);
			}

			async function assert_focus_navigation_forward(elements: string[]) {
				return assert_focus_navigation_elements(elements, 'forward');
			}

			async function assert_focus_navigation_backward(elements: string[]) {
				return assert_focus_navigation_elements(elements, 'backward');
			}

			async function assert_focus_navigation_bidirectional(elements: string[]) {
				await assert_focus_navigation_forward(elements);
				elements.reverse();
				await assert_focus_navigation_backward(elements);
			}

			const host = document.getElementById('host')!;

			convertTemplatesToShadowRootsWithin(host);

			let elements = ['host/i1', 'i2', 'host/i3', 'host/i4', 'host/i5', 'host/i6', 'host/i7'];

			await assert_focus_navigation_bidirectional(elements);
		},
		{
			document: {
				contentType: 'text/html',
				content: `<!DOCTYPE html>







<p>Tests for moving focus by pressing tab key across shadow boundaries.<br>
To manually test, press tab key six times then shift+tab seven times.<br>
It should traverse focusable elements in the increasing numerical order and then in the reverse order.</p>

<div id='host'>
  <div slot='slot5' id='i2' tabindex=4>2. Assigned to slot5 whose tabindex is 2.</div>
  <template data-mode='open'>
    <slot name='slot1'>
      x. The default tabindex for a slot node is set to 0.
      <div id='i5' tabindex=0>5. The parent slot node's tabindex is 0. Second.</div>
      <div id='i4' tabindex=2>4. The parent slot node's tabindex is 0. First.</div>
    </slot>

    <slot name='slot2' id='x1' tabindex=3>
      x. The tabindex is 3. The slot node should be ignored.
      <div id='i3' tabindex=10>3. The parent slot node's tabindex is 3. The slot node's tabindex matters. This element's tabindex comes after.</div>
    </slot>

    <slot name='slot3' id='x2' tabindex=0>
      x. The tabindex is 0. The slot node should be ignored. If there is another slot node in same tabindex, the younger child comes first.
      <div id='i6' tabindex=1>6. The parent slot node's tabindex is 0. First.</div>
      <div id='i7' tabindex=1>7. The parent slot node's tabindex is 0. Second.</div>
    </slot>

    <slot name='slot4' id='x3' tabindex=1>
      x. The tabindex is 1. The slot node should be ignored.
      <div id='i1' tabindex=5>1. The slot node tabindex is 1.</div>
    </slot>

    <slot name='slot5' id='x5' tabindex=2>
      x. The tabindex is 2. The slot node should be ignored. The host child is assigned to this slot node.
      <div id='-' tabindex=1>-. The host child is assigned to the parent slot node. This text shouldn't appear.</div>
    </slot>

    <slot name='slot6' id='x6' tabindex=5>
      x. The tabindex is 5. The slot node should be ignored.
      <div id='x6' tabindex=-1>x. tabindex is -1. Should be skipped.</div>
    </slot>

    <slot name='slot7' id='x7' tabindex=-1>
      x. tabindex is -1. Should be skipped.
      <div id='x8' tabindex=1>x. The parent slot node is skipped.</div>
    </slot>
  </template>
</div>

`,
			},
		},
	);
}
