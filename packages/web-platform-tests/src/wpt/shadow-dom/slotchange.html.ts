import type { CompatibilityContext, DOMFixture } from '../../shared/context.ts';
import { createTestTree, removeWhiteSpaceOnlyTextNodes } from './resources/shadow-dom.js.ts';

const markup = `<!DOCTYPE html>
<title>Shadow DOM: slotchange Events</title>
<meta name="author" title="Hayato Ito" href="mailto:hayato@google.com">




<div id="test1">
  <div id="host1">
    <template data-mode="open">
      <slot id="s1" name="slot1"></slot>
    </template>
    <div id="c1" slot="slot1"></div>
  </div>
</div>



<div id="test2">
  <div id="host1">
    <template data-mode="open">
      <slot id="s1" name="slot1"></slot>
    </template>
    <div id="c2" slot="slot2"></div>
  </div>
</div>



<div id="test_fallback">
  <div id="host1">
    <template data-mode="open">
      <slot id="s1"></slot>
    </template>
  </div>
</div>



<div id="test_fallback2">
  <div id="host1">
    <template data-mode="open">
      <slot id="s1">
        <div id="f1"></div>
      </slot>
    </template>
  </div>
</div>



<div id="test_fallback3">
  <div id="host1">
    <template data-mode="open">
      <slot id="s2">
        <slot id="s1">
          <div id="f1"></div>
        </slot>
      </slot>
    </template>
  </div>
</div>



<div id="test3">
  <div id="host1">
    <template id="shadowroot" data-mode="open">
      <slot id="s1" name="slot1"></slot>
    </template>
    <div id="c1" slot="slot1"></div>
  </div>
</div>



<div id="test4">
  <div id="host1">
    <template id="shadowroot" data-mode="open">
      <slot id="s1" name="slot1"></slot>
      <slot id="s2" name="slot1"></slot>
    </template>
    <div id="c1" slot="slot1"></div>
  </div>
</div>



<div id="test5">
  <div id="host1">
    <template data-mode="open">
      <div id="host2">
        <template data-mode="open">
          <slot id="s2" name="slot2"></slot>
        </template>
        <slot id="s1" name="slot1" slot="slot2"></slot>
      </div>
    </template>
    <div id="c1" slot="slot1"></div>
  </div>
</div>



<div id="test6">
  <div id="host1">
    <template data-mode="open">
      <div id="host2">
        <template data-mode="open">
          <slot id="s2" name="slot2"></slot>
        </template>
        <slot id="s1" name="slot1" slot="slot2"></slot>
      </div>
    </template>
  </div>
</div>



<div id="test7">
  <div id="host1">
    <template data-mode="open">
      <div id="host2">
        <template data-mode="open">
          <slot id="s2" name="slot2"></slot>
        </template>
        <slot id="s1" name="slot1" slot="slot2"></slot>
      </div>
    </template>
  </div>
</div>


`;

export function register(context: CompatibilityContext): void {
	function arraysEqual(a: Node[] | null, b: Node[] | null) {
		if (a === b) return true;
		if (a == null || b == null) return false;
		if (a.length !== b.length) return false;
		for (var i = 0; i < a.length; ++i) {
			if (a[i] !== b[i]) return false;
		}
		return true;
	}
	function doneIfSlotChange(
		slots: HTMLSlotElement[],
		expectedAssignedNodes: Node[][],
		{ step }: DOMFixture,
	) {
		return new Promise<void>((resolve) => {
			let matched = Array(slots.length).fill(false);
			for (let i = 0; i < slots.length; i++) {
				slots[i]!.addEventListener(
					'slotchange',
					step((e) => {
						matched[i] = arraysEqual(slots[i]!.assignedNodes(), expectedAssignedNodes[i]!);
						if (matched.every((v) => v)) {
							resolve();
						}
					}),
				);
			}
		});
	}
	context.test(
		'slotchange event: Append a child to a host (onslotchange).',
		async ({ document, Node, step }) => {
			await new Promise<void>((resolve) => {
				let n = createTestTree<{
					test1: HTMLElement;
					host1: HTMLElement;
					s1: HTMLSlotElement;
					c1: HTMLElement;
					test2: HTMLElement;
					c2: HTMLElement;
					test_fallback: HTMLElement;
					test_fallback2: HTMLElement;
					f1: HTMLElement;
					test_fallback3: HTMLElement;
					s2: HTMLSlotElement;
					test3: HTMLElement;
					shadowroot: ShadowRoot;
					test4: HTMLElement;
					test5: HTMLElement;
					host2: HTMLElement;
					test6: HTMLElement;
					test7: HTMLElement;
				}>(document, document.getElementById('test1')!);
				removeWhiteSpaceOnlyTextNodes(n.test1, Node);

				let d1 = document.createElement('div');
				d1.setAttribute('slot', 'slot1');

				n.host1.shadowRoot!.onslotchange = step(() => {
					arraysEqual(n.s1.assignedNodes(), [n.c1, d1]);
					resolve();
				});

				n.host1.appendChild(d1);
			});
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'slotchange event: Append a child to a host.',
		async (fixture) => {
			const { document, Node } = fixture;

			let n = createTestTree<{
				test1: HTMLElement;
				host1: HTMLElement;
				s1: HTMLSlotElement;
				c1: HTMLElement;
				test2: HTMLElement;
				c2: HTMLElement;
				test_fallback: HTMLElement;
				test_fallback2: HTMLElement;
				f1: HTMLElement;
				test_fallback3: HTMLElement;
				s2: HTMLSlotElement;
				test3: HTMLElement;
				shadowroot: ShadowRoot;
				test4: HTMLElement;
				test5: HTMLElement;
				host2: HTMLElement;
				test6: HTMLElement;
				test7: HTMLElement;
			}>(document, document.getElementById('test1')!);
			removeWhiteSpaceOnlyTextNodes(n.test1, Node);

			let d1 = document.createElement('div');
			d1.setAttribute('slot', 'slot1');

			const done = doneIfSlotChange([n.s1], [[n.c1, d1]], fixture);

			n.host1.appendChild(d1);

			await done;
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'slotchange event: Remove a child from a host.',
		async (fixture) => {
			const { document, Node } = fixture;

			let n = createTestTree<{
				test1: HTMLElement;
				host1: HTMLElement;
				s1: HTMLSlotElement;
				c1: HTMLElement;
				test2: HTMLElement;
				c2: HTMLElement;
				test_fallback: HTMLElement;
				test_fallback2: HTMLElement;
				f1: HTMLElement;
				test_fallback3: HTMLElement;
				s2: HTMLSlotElement;
				test3: HTMLElement;
				shadowroot: ShadowRoot;
				test4: HTMLElement;
				test5: HTMLElement;
				host2: HTMLElement;
				test6: HTMLElement;
				test7: HTMLElement;
			}>(document, document.getElementById('test1')!);
			removeWhiteSpaceOnlyTextNodes(n.test1, Node);

			const done = doneIfSlotChange([n.s1], [[]], fixture);

			n.c1.remove();

			await done;
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'slotchange event: Remove a child before adding an event listener.',
		async (fixture) => {
			const { document, Node } = fixture;

			let n = createTestTree<{
				test1: HTMLElement;
				host1: HTMLElement;
				s1: HTMLSlotElement;
				c1: HTMLElement;
				test2: HTMLElement;
				c2: HTMLElement;
				test_fallback: HTMLElement;
				test_fallback2: HTMLElement;
				f1: HTMLElement;
				test_fallback3: HTMLElement;
				s2: HTMLSlotElement;
				test3: HTMLElement;
				shadowroot: ShadowRoot;
				test4: HTMLElement;
				test5: HTMLElement;
				host2: HTMLElement;
				test6: HTMLElement;
				test7: HTMLElement;
			}>(document, document.getElementById('test1')!);
			removeWhiteSpaceOnlyTextNodes(n.test1, Node);

			n.c1.remove();

			const done = doneIfSlotChange([n.s1], [[]], fixture);

			await done;
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'slotchange event: Change slot= attribute to make it un-assigned.',
		async (fixture) => {
			const { document, Node } = fixture;

			let n = createTestTree<{
				test1: HTMLElement;
				host1: HTMLElement;
				s1: HTMLSlotElement;
				c1: HTMLElement;
				test2: HTMLElement;
				c2: HTMLElement;
				test_fallback: HTMLElement;
				test_fallback2: HTMLElement;
				f1: HTMLElement;
				test_fallback3: HTMLElement;
				s2: HTMLSlotElement;
				test3: HTMLElement;
				shadowroot: ShadowRoot;
				test4: HTMLElement;
				test5: HTMLElement;
				host2: HTMLElement;
				test6: HTMLElement;
				test7: HTMLElement;
			}>(document, document.getElementById('test1')!);
			removeWhiteSpaceOnlyTextNodes(n.test1, Node);

			const done = doneIfSlotChange([n.s1], [[]], fixture);

			n.c1.setAttribute('slot', 'slot-none');

			await done;
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		"slotchange event: Change slot's name= attribute so that none is assigned.",
		async (fixture) => {
			const { document, Node } = fixture;

			let n = createTestTree<{
				test1: HTMLElement;
				host1: HTMLElement;
				s1: HTMLSlotElement;
				c1: HTMLElement;
				test2: HTMLElement;
				c2: HTMLElement;
				test_fallback: HTMLElement;
				test_fallback2: HTMLElement;
				f1: HTMLElement;
				test_fallback3: HTMLElement;
				s2: HTMLSlotElement;
				test3: HTMLElement;
				shadowroot: ShadowRoot;
				test4: HTMLElement;
				test5: HTMLElement;
				host2: HTMLElement;
				test6: HTMLElement;
				test7: HTMLElement;
			}>(document, document.getElementById('test1')!);
			removeWhiteSpaceOnlyTextNodes(n.test1, Node);

			const done = doneIfSlotChange([n.s1], [[]], fixture);

			n.s1.setAttribute('name', 'slot-none');

			await done;
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'slotchange event: Change slot= attribute to make it assigned.',
		async (fixture) => {
			const { document, Node } = fixture;

			let n = createTestTree<{
				test1: HTMLElement;
				host1: HTMLElement;
				s1: HTMLSlotElement;
				c1: HTMLElement;
				test2: HTMLElement;
				c2: HTMLElement;
				test_fallback: HTMLElement;
				test_fallback2: HTMLElement;
				f1: HTMLElement;
				test_fallback3: HTMLElement;
				s2: HTMLSlotElement;
				test3: HTMLElement;
				shadowroot: ShadowRoot;
				test4: HTMLElement;
				test5: HTMLElement;
				host2: HTMLElement;
				test6: HTMLElement;
				test7: HTMLElement;
			}>(document, document.getElementById('test2')!);
			removeWhiteSpaceOnlyTextNodes(n.test2, Node);

			const done = doneIfSlotChange([n.s1], [[n.c2]], fixture);

			n.c2.setAttribute('slot', 'slot1');

			await done;
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		"slotchange event: Change slot's name= attribute so that a node is assigned to the slot.",
		async (fixture) => {
			const { document, Node } = fixture;

			let n = createTestTree<{
				test1: HTMLElement;
				host1: HTMLElement;
				s1: HTMLSlotElement;
				c1: HTMLElement;
				test2: HTMLElement;
				c2: HTMLElement;
				test_fallback: HTMLElement;
				test_fallback2: HTMLElement;
				f1: HTMLElement;
				test_fallback3: HTMLElement;
				s2: HTMLSlotElement;
				test3: HTMLElement;
				shadowroot: ShadowRoot;
				test4: HTMLElement;
				test5: HTMLElement;
				host2: HTMLElement;
				test6: HTMLElement;
				test7: HTMLElement;
			}>(document, document.getElementById('test2')!);
			removeWhiteSpaceOnlyTextNodes(n.test2, Node);

			const done = doneIfSlotChange([n.s1], [[n.c2]], fixture);

			n.s1.setAttribute('name', 'slot2');

			await done;
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'slotchange event: Change fallback content - assignedNodes still empty.',
		async (fixture) => {
			const { document, Node } = fixture;

			let n = createTestTree<{
				test1: HTMLElement;
				host1: HTMLElement;
				s1: HTMLSlotElement;
				c1: HTMLElement;
				test2: HTMLElement;
				c2: HTMLElement;
				test_fallback: HTMLElement;
				test_fallback2: HTMLElement;
				f1: HTMLElement;
				test_fallback3: HTMLElement;
				s2: HTMLSlotElement;
				test3: HTMLElement;
				shadowroot: ShadowRoot;
				test4: HTMLElement;
				test5: HTMLElement;
				host2: HTMLElement;
				test6: HTMLElement;
				test7: HTMLElement;
			}>(document, document.getElementById('test_fallback')!);
			removeWhiteSpaceOnlyTextNodes(n.test_fallback, Node);

			const done = doneIfSlotChange([n.s1], [[]], fixture);

			n.s1.appendChild(document.createElement('div'));

			await done;
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'slotchange event: Remove a fallback content - assignedNodes still empty.',
		async (fixture) => {
			const { document, Node } = fixture;

			let n = createTestTree<{
				test1: HTMLElement;
				host1: HTMLElement;
				s1: HTMLSlotElement;
				c1: HTMLElement;
				test2: HTMLElement;
				c2: HTMLElement;
				test_fallback: HTMLElement;
				test_fallback2: HTMLElement;
				f1: HTMLElement;
				test_fallback3: HTMLElement;
				s2: HTMLSlotElement;
				test3: HTMLElement;
				shadowroot: ShadowRoot;
				test4: HTMLElement;
				test5: HTMLElement;
				host2: HTMLElement;
				test6: HTMLElement;
				test7: HTMLElement;
			}>(document, document.getElementById('test_fallback2')!);
			removeWhiteSpaceOnlyTextNodes(n.test_fallback2, Node);

			const done = doneIfSlotChange([n.s1], [[]], fixture);

			n.f1.remove();

			await done;
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'slotchange event: Add a fallback content to nested slots - assignedNodes still empty.',
		async (fixture) => {
			const { document, Node } = fixture;

			let n = createTestTree<{
				test1: HTMLElement;
				host1: HTMLElement;
				s1: HTMLSlotElement;
				c1: HTMLElement;
				test2: HTMLElement;
				c2: HTMLElement;
				test_fallback: HTMLElement;
				test_fallback2: HTMLElement;
				f1: HTMLElement;
				test_fallback3: HTMLElement;
				s2: HTMLSlotElement;
				test3: HTMLElement;
				shadowroot: ShadowRoot;
				test4: HTMLElement;
				test5: HTMLElement;
				host2: HTMLElement;
				test6: HTMLElement;
				test7: HTMLElement;
			}>(document, document.getElementById('test_fallback3')!);
			removeWhiteSpaceOnlyTextNodes(n.test_fallback3, Node);

			const done = doneIfSlotChange([n.s1, n.s2], [[], []], fixture);

			n.s1.appendChild(document.createElement('div'));

			await done;
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'slotchange event: Remove a fallback content from nested slots - assignedNodes still empty.',
		async (fixture) => {
			const { document, Node } = fixture;

			let n = createTestTree<{
				test1: HTMLElement;
				host1: HTMLElement;
				s1: HTMLSlotElement;
				c1: HTMLElement;
				test2: HTMLElement;
				c2: HTMLElement;
				test_fallback: HTMLElement;
				test_fallback2: HTMLElement;
				f1: HTMLElement;
				test_fallback3: HTMLElement;
				s2: HTMLSlotElement;
				test3: HTMLElement;
				shadowroot: ShadowRoot;
				test4: HTMLElement;
				test5: HTMLElement;
				host2: HTMLElement;
				test6: HTMLElement;
				test7: HTMLElement;
			}>(document, document.getElementById('test_fallback3')!);
			removeWhiteSpaceOnlyTextNodes(n.test_fallback3, Node);

			const done = doneIfSlotChange([n.s1, n.s2], [[], []], fixture);

			n.f1.remove();

			await done;
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'slotchange event: Insert a slot before an existing slot.',
		async (fixture) => {
			const { document, Node } = fixture;

			let n = createTestTree<{
				test1: HTMLElement;
				host1: HTMLElement;
				s1: HTMLSlotElement;
				c1: HTMLElement;
				test2: HTMLElement;
				c2: HTMLElement;
				test_fallback: HTMLElement;
				test_fallback2: HTMLElement;
				f1: HTMLElement;
				test_fallback3: HTMLElement;
				s2: HTMLSlotElement;
				test3: HTMLElement;
				shadowroot: ShadowRoot;
				test4: HTMLElement;
				test5: HTMLElement;
				host2: HTMLElement;
				test6: HTMLElement;
				test7: HTMLElement;
			}>(document, document.getElementById('test3')!);
			removeWhiteSpaceOnlyTextNodes(n.test3, Node);

			const done = doneIfSlotChange([n.s1], [[]], fixture);

			let slot = document.createElement('slot');
			slot.setAttribute('name', 'slot1');
			n.shadowroot.insertBefore(slot, n.s1);

			await done;
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'slotchange event: Remove a preceding slot.',
		async (fixture) => {
			const { document, Node } = fixture;

			let n = createTestTree<{
				test1: HTMLElement;
				host1: HTMLElement;
				s1: HTMLSlotElement;
				c1: HTMLElement;
				test2: HTMLElement;
				c2: HTMLElement;
				test_fallback: HTMLElement;
				test_fallback2: HTMLElement;
				f1: HTMLElement;
				test_fallback3: HTMLElement;
				s2: HTMLSlotElement;
				test3: HTMLElement;
				shadowroot: ShadowRoot;
				test4: HTMLElement;
				test5: HTMLElement;
				host2: HTMLElement;
				test6: HTMLElement;
				test7: HTMLElement;
			}>(document, document.getElementById('test4')!);
			removeWhiteSpaceOnlyTextNodes(n.test4, Node);

			const done = doneIfSlotChange([n.s2], [[n.c1]], fixture);

			n.s1.remove();

			await done;
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'slotchange event: A slot is assigned to another slot.',
		async (fixture) => {
			const { document, Node } = fixture;

			let n = createTestTree<{
				test1: HTMLElement;
				host1: HTMLElement;
				s1: HTMLSlotElement;
				c1: HTMLElement;
				test2: HTMLElement;
				c2: HTMLElement;
				test_fallback: HTMLElement;
				test_fallback2: HTMLElement;
				f1: HTMLElement;
				test_fallback3: HTMLElement;
				s2: HTMLSlotElement;
				test3: HTMLElement;
				shadowroot: ShadowRoot;
				test4: HTMLElement;
				test5: HTMLElement;
				host2: HTMLElement;
				test6: HTMLElement;
				test7: HTMLElement;
			}>(document, document.getElementById('test5')!);
			removeWhiteSpaceOnlyTextNodes(n.test5, Node);

			const done = doneIfSlotChange([n.s1, n.s2], [[], [n.s1]], fixture);

			n.c1.remove();

			await done;
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'slotchange event: Slotchange should be fired if assigned nodes are changed.',
		async (fixture) => {
			const { document, Node } = fixture;

			let n = createTestTree<{
				test1: HTMLElement;
				host1: HTMLElement;
				s1: HTMLSlotElement;
				c1: HTMLElement;
				test2: HTMLElement;
				c2: HTMLElement;
				test_fallback: HTMLElement;
				test_fallback2: HTMLElement;
				f1: HTMLElement;
				test_fallback3: HTMLElement;
				s2: HTMLSlotElement;
				test3: HTMLElement;
				shadowroot: ShadowRoot;
				test4: HTMLElement;
				test5: HTMLElement;
				host2: HTMLElement;
				test6: HTMLElement;
				test7: HTMLElement;
			}>(document, document.getElementById('test6')!);
			removeWhiteSpaceOnlyTextNodes(n.test6, Node);

			const done = doneIfSlotChange([n.s2], [[]], fixture);

			n.s1.remove();

			await done;
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'slotchange event: Child content is added to nested slots.',
		async (fixture) => {
			const { document, Node } = fixture;

			let n = createTestTree<{
				test1: HTMLElement;
				host1: HTMLElement;
				s1: HTMLSlotElement;
				c1: HTMLElement;
				test2: HTMLElement;
				c2: HTMLElement;
				test_fallback: HTMLElement;
				test_fallback2: HTMLElement;
				f1: HTMLElement;
				test_fallback3: HTMLElement;
				s2: HTMLSlotElement;
				test3: HTMLElement;
				shadowroot: ShadowRoot;
				test4: HTMLElement;
				test5: HTMLElement;
				host2: HTMLElement;
				test6: HTMLElement;
				test7: HTMLElement;
			}>(document, document.getElementById('test7')!);
			removeWhiteSpaceOnlyTextNodes(n.test7, Node);

			let d1 = document.createElement('div');
			d1.setAttribute('slot', 'slot1');
			const done = doneIfSlotChange([n.s1, n.s2], [[d1], [n.s1]], fixture);

			n.host1.appendChild(d1);

			await done;
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
}
