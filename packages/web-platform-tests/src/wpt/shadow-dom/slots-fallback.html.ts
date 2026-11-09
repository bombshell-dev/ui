import type { CompatibilityContext } from '../../shared/context.ts';
import { createTestTree, removeWhiteSpaceOnlyTextNodes } from './resources/shadow-dom.js.ts';

const markup = `<!DOCTYPE html>
<title>Shadow DOM: Slots and fallback contents</title>
<meta name="author" title="Hayato Ito" href="mailto:hayato@google.com">




<div id="test1">
  <div id="host">
    <template data-mode="open">
      <slot id="s1" name="slot1">
        <div id="f1"></div>
      </slot>
    </template>
  </div>
</div>



<div id="test2">
  <div id="host">
    <template data-mode="open">
      <slot id="s1" name="slot1">
        <slot id="s2" name="slot2">
          <div id="f1"></div>
        </slot>
      </slot>
    </template>
  </div>
</div>



<div id="test3">
  <div id="host">
    <template data-mode="open">
      <slot id="s1" name="slot1">
        <slot id="s2" name="slot2">
          <div id="f1"></div>
        </slot>
      </slot>
    </template>
    <div id="c1" slot="slot1"></div>
  </div>
</div>



<div id="test4">
  <div id="host">
    <template data-mode="open">
      <slot id="s1" name="slot1">
        <slot id="s2" name="slot2">
          <div id="f1"></div>
        </slot>
      </slot>
    </template>
    <div id="c1" slot="slot2"></div>
  </div>
</div>



<div id="test5">
  <div id="host1">
    <template data-mode="open">
      <div id="host2">
        <template data-mode="open">
          <slot id="s4" name="slot4">
            <slot id="s3" name="slot3">
              <div id="f3"></div>
            </slot>
            <div id="f4"></div>
          </slot>
        </template>
        <slot id="s2" name="slot2" slot="slot3">
          <slot id="s1" name="slot1">
            <div id="f1"></div>
          </slot>
          <div id="f2"></div>
        </slot>
      </div>
    </template>
    <div id="c1" slot="slot1"></div>
  </div>
</div>


`;

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'Slots fallback: Basic.',
		({ document, Node }) => {
			let n = createTestTree<{
				test1: HTMLElement;
				host: HTMLElement;
				s1: HTMLSlotElement;
				f1: HTMLElement;
				test2: HTMLElement;
				s2: HTMLSlotElement;
				test3: HTMLElement;
				c1: HTMLElement;
				test4: HTMLElement;
				test5: HTMLElement;
				host1: HTMLElement;
				host2: HTMLElement;
				s4: HTMLSlotElement;
				s3: HTMLSlotElement;
				f3: HTMLElement;
				f4: HTMLElement;
				f2: HTMLElement;
			}>(document, document.getElementById('test1')!);
			removeWhiteSpaceOnlyTextNodes(n.test1, Node);

			expect(n.f1.assignedSlot).toBe(null);

			{
				const actual = n.s1.assignedNodes();
				const expected: never[] = [];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
			{
				const actual = n.s1.assignedNodes({ flatten: true });
				const expected = [n.f1];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'Slots fallback: Basic, elements only.',
		({ document }) => {
			let n = createTestTree<{
				test1: HTMLElement;
				host: HTMLElement;
				s1: HTMLSlotElement;
				f1: HTMLElement;
				test2: HTMLElement;
				s2: HTMLSlotElement;
				test3: HTMLElement;
				c1: HTMLElement;
				test4: HTMLElement;
				test5: HTMLElement;
				host1: HTMLElement;
				host2: HTMLElement;
				s4: HTMLSlotElement;
				s3: HTMLSlotElement;
				f3: HTMLElement;
				f4: HTMLElement;
				f2: HTMLElement;
			}>(document, document.getElementById('test1')!);

			{
				const actual = n.s1.assignedElements();
				const expected: never[] = [];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
			{
				const actual = n.s1.assignedElements({ flatten: true });
				const expected = [n.f1];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'Slots fallback: Slots in Slots.',
		({ document, Node }) => {
			let n = createTestTree<{
				test1: HTMLElement;
				host: HTMLElement;
				s1: HTMLSlotElement;
				f1: HTMLElement;
				test2: HTMLElement;
				s2: HTMLSlotElement;
				test3: HTMLElement;
				c1: HTMLElement;
				test4: HTMLElement;
				test5: HTMLElement;
				host1: HTMLElement;
				host2: HTMLElement;
				s4: HTMLSlotElement;
				s3: HTMLSlotElement;
				f3: HTMLElement;
				f4: HTMLElement;
				f2: HTMLElement;
			}>(document, document.getElementById('test2')!);
			removeWhiteSpaceOnlyTextNodes(n.test2, Node);

			expect(n.f1.assignedSlot).toBe(null);

			{
				const actual = n.s1.assignedNodes();
				const expected: never[] = [];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
			{
				const actual = n.s2.assignedNodes();
				const expected: never[] = [];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}

			{
				const actual = n.s1.assignedNodes({ flatten: true });
				const expected = [n.f1];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
			{
				const actual = n.s2.assignedNodes({ flatten: true });
				const expected = [n.f1];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'Slots fallback: Slots in Slots, elements only.',
		({ document }) => {
			let n = createTestTree<{
				test1: HTMLElement;
				host: HTMLElement;
				s1: HTMLSlotElement;
				f1: HTMLElement;
				test2: HTMLElement;
				s2: HTMLSlotElement;
				test3: HTMLElement;
				c1: HTMLElement;
				test4: HTMLElement;
				test5: HTMLElement;
				host1: HTMLElement;
				host2: HTMLElement;
				s4: HTMLSlotElement;
				s3: HTMLSlotElement;
				f3: HTMLElement;
				f4: HTMLElement;
				f2: HTMLElement;
			}>(document, document.getElementById('test2')!);

			{
				const actual = n.s1.assignedElements();
				const expected: never[] = [];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
			{
				const actual = n.s2.assignedElements();
				const expected: never[] = [];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}

			{
				const actual = n.s1.assignedElements({ flatten: true });
				const expected = [n.f1];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
			{
				const actual = n.s2.assignedElements({ flatten: true });
				const expected = [n.f1];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'Slots fallback: Fallback contents should not be used if a node is assigned.',
		({ document, Node }) => {
			let n = createTestTree<{
				test1: HTMLElement;
				host: HTMLElement;
				s1: HTMLSlotElement;
				f1: HTMLElement;
				test2: HTMLElement;
				s2: HTMLSlotElement;
				test3: HTMLElement;
				c1: HTMLElement;
				test4: HTMLElement;
				test5: HTMLElement;
				host1: HTMLElement;
				host2: HTMLElement;
				s4: HTMLSlotElement;
				s3: HTMLSlotElement;
				f3: HTMLElement;
				f4: HTMLElement;
				f2: HTMLElement;
			}>(document, document.getElementById('test3')!);
			removeWhiteSpaceOnlyTextNodes(n.test3, Node);

			expect(n.c1.assignedSlot).toBe(n.s1);
			expect(n.f1.assignedSlot).toBe(null);

			{
				const actual = n.s1.assignedNodes();
				const expected = [n.c1];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
			{
				const actual = n.s2.assignedNodes();
				const expected: never[] = [];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}

			{
				const actual = n.s1.assignedNodes({ flatten: true });
				const expected = [n.c1];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
			{
				const actual = n.s2.assignedNodes({ flatten: true });
				const expected = [n.f1];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'Slots fallback: Slots in Slots: Assigned nodes should be used as fallback contents of another slot',
		({ document, Node }) => {
			let n = createTestTree<{
				test1: HTMLElement;
				host: HTMLElement;
				s1: HTMLSlotElement;
				f1: HTMLElement;
				test2: HTMLElement;
				s2: HTMLSlotElement;
				test3: HTMLElement;
				c1: HTMLElement;
				test4: HTMLElement;
				test5: HTMLElement;
				host1: HTMLElement;
				host2: HTMLElement;
				s4: HTMLSlotElement;
				s3: HTMLSlotElement;
				f3: HTMLElement;
				f4: HTMLElement;
				f2: HTMLElement;
			}>(document, document.getElementById('test4')!);
			removeWhiteSpaceOnlyTextNodes(n.test4, Node);

			expect(n.c1.assignedSlot).toBe(n.s2);
			expect(n.f1.assignedSlot).toBe(null);

			{
				const actual = n.s1.assignedNodes();
				const expected: never[] = [];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
			{
				const actual = n.s2.assignedNodes();
				const expected = [n.c1];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}

			{
				const actual = n.s1.assignedNodes({ flatten: true });
				const expected = [n.c1];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
			{
				const actual = n.s2.assignedNodes({ flatten: true });
				const expected = [n.c1];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'Slots fallback: Complex case.',
		({ document, Node }) => {
			let n = createTestTree<{
				test1: HTMLElement;
				host: HTMLElement;
				s1: HTMLSlotElement;
				f1: HTMLElement;
				test2: HTMLElement;
				s2: HTMLSlotElement;
				test3: HTMLElement;
				c1: HTMLElement;
				test4: HTMLElement;
				test5: HTMLElement;
				host1: HTMLElement;
				host2: HTMLElement;
				s4: HTMLSlotElement;
				s3: HTMLSlotElement;
				f3: HTMLElement;
				f4: HTMLElement;
				f2: HTMLElement;
			}>(document, document.getElementById('test5')!);
			removeWhiteSpaceOnlyTextNodes(n.test5, Node);

			{
				const actual = n.s1.assignedNodes();
				const expected = [n.c1];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
			{
				const actual = n.s2.assignedNodes();
				const expected: never[] = [];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
			{
				const actual = n.s3.assignedNodes();
				const expected = [n.s2];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
			{
				const actual = n.s4.assignedNodes();
				const expected: never[] = [];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}

			{
				const actual = n.s1.assignedNodes({ flatten: true });
				const expected = [n.c1];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
			{
				const actual = n.s2.assignedNodes({ flatten: true });
				const expected = [n.c1, n.f2];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
			{
				const actual = n.s3.assignedNodes({ flatten: true });
				const expected = [n.c1, n.f2];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
			{
				const actual = n.s4.assignedNodes({ flatten: true });
				const expected = [n.c1, n.f2, n.f4];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'Slots fallback: Complex case, elements only.',
		({ document }) => {
			let n = createTestTree<{
				test1: HTMLElement;
				host: HTMLElement;
				s1: HTMLSlotElement;
				f1: HTMLElement;
				test2: HTMLElement;
				s2: HTMLSlotElement;
				test3: HTMLElement;
				c1: HTMLElement;
				test4: HTMLElement;
				test5: HTMLElement;
				host1: HTMLElement;
				host2: HTMLElement;
				s4: HTMLSlotElement;
				s3: HTMLSlotElement;
				f3: HTMLElement;
				f4: HTMLElement;
				f2: HTMLElement;
			}>(document, document.getElementById('test5')!);

			{
				const actual = n.s1.assignedElements();
				const expected = [n.c1];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
			{
				const actual = n.s2.assignedElements();
				const expected: never[] = [];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
			{
				const actual = n.s3.assignedElements();
				const expected = [n.s2];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
			{
				const actual = n.s4.assignedElements();
				const expected: never[] = [];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}

			{
				const actual = n.s1.assignedElements({ flatten: true });
				const expected = [n.c1];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
			{
				const actual = n.s2.assignedElements({ flatten: true });
				const expected = [n.c1, n.f2];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
			{
				const actual = n.s3.assignedElements({ flatten: true });
				const expected = [n.c1, n.f2];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
			{
				const actual = n.s4.assignedElements({ flatten: true });
				const expected = [n.c1, n.f2, n.f4];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'Slots fallback: Mutation. Append fallback contents.',
		({ document, Node }) => {
			let n = createTestTree<{
				test1: HTMLElement;
				host: HTMLElement;
				s1: HTMLSlotElement;
				f1: HTMLElement;
				test2: HTMLElement;
				s2: HTMLSlotElement;
				test3: HTMLElement;
				c1: HTMLElement;
				test4: HTMLElement;
				test5: HTMLElement;
				host1: HTMLElement;
				host2: HTMLElement;
				s4: HTMLSlotElement;
				s3: HTMLSlotElement;
				f3: HTMLElement;
				f4: HTMLElement;
				f2: HTMLElement;
			}>(document, document.getElementById('test5')!);
			removeWhiteSpaceOnlyTextNodes(n.test5, Node);

			let d1 = document.createElement('div');
			n.s2.appendChild(d1);

			{
				const actual = n.s1.assignedNodes({ flatten: true });
				const expected = [n.c1];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
			{
				const actual = n.s2.assignedNodes({ flatten: true });
				const expected = [n.c1, n.f2, d1];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
			{
				const actual = n.s3.assignedNodes({ flatten: true });
				const expected = [n.c1, n.f2, d1];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
			{
				const actual = n.s4.assignedNodes({ flatten: true });
				const expected = [n.c1, n.f2, d1, n.f4];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'Slots fallback: Mutation. Remove fallback contents.',
		({ document, Node }) => {
			let n = createTestTree<{
				test1: HTMLElement;
				host: HTMLElement;
				s1: HTMLSlotElement;
				f1: HTMLElement;
				test2: HTMLElement;
				s2: HTMLSlotElement;
				test3: HTMLElement;
				c1: HTMLElement;
				test4: HTMLElement;
				test5: HTMLElement;
				host1: HTMLElement;
				host2: HTMLElement;
				s4: HTMLSlotElement;
				s3: HTMLSlotElement;
				f3: HTMLElement;
				f4: HTMLElement;
				f2: HTMLElement;
			}>(document, document.getElementById('test5')!);
			removeWhiteSpaceOnlyTextNodes(n.test5, Node);

			n.f2.remove();

			{
				const actual = n.s1.assignedNodes({ flatten: true });
				const expected = [n.c1];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
			{
				const actual = n.s2.assignedNodes({ flatten: true });
				const expected = [n.c1];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
			{
				const actual = n.s3.assignedNodes({ flatten: true });
				const expected = [n.c1];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
			{
				const actual = n.s4.assignedNodes({ flatten: true });
				const expected = [n.c1, n.f4];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'Slots fallback: Mutation. Assign a node to a slot so that fallback contens are no longer used.',
		({ document, Node }) => {
			let n = createTestTree<{
				test1: HTMLElement;
				host: HTMLElement;
				s1: HTMLSlotElement;
				f1: HTMLElement;
				test2: HTMLElement;
				s2: HTMLSlotElement;
				test3: HTMLElement;
				c1: HTMLElement;
				test4: HTMLElement;
				test5: HTMLElement;
				host1: HTMLElement;
				host2: HTMLElement;
				s4: HTMLSlotElement;
				s3: HTMLSlotElement;
				f3: HTMLElement;
				f4: HTMLElement;
				f2: HTMLElement;
			}>(document, document.getElementById('test5')!);
			removeWhiteSpaceOnlyTextNodes(n.test5, Node);

			let d2 = document.createElement('div');
			d2.setAttribute('slot', 'slot2');
			n.host1.appendChild(d2);

			{
				const actual = n.s2.assignedNodes();
				const expected = [d2];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
			{
				const actual = n.s2.assignedNodes({ flatten: true });
				const expected = [d2];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
			{
				const actual = n.s3.assignedNodes({ flatten: true });
				const expected = [d2];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
			{
				const actual = n.s4.assignedNodes({ flatten: true });
				const expected = [d2, n.f4];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'Slots fallback: Mutation. Remove an assigned node from a slot so that fallback contens will be used.',
		({ document, Node }) => {
			let n = createTestTree<{
				test1: HTMLElement;
				host: HTMLElement;
				s1: HTMLSlotElement;
				f1: HTMLElement;
				test2: HTMLElement;
				s2: HTMLSlotElement;
				test3: HTMLElement;
				c1: HTMLElement;
				test4: HTMLElement;
				test5: HTMLElement;
				host1: HTMLElement;
				host2: HTMLElement;
				s4: HTMLSlotElement;
				s3: HTMLSlotElement;
				f3: HTMLElement;
				f4: HTMLElement;
				f2: HTMLElement;
			}>(document, document.getElementById('test5')!);
			removeWhiteSpaceOnlyTextNodes(n.test5, Node);

			n.c1.remove();

			{
				const actual = n.s1.assignedNodes();
				const expected: never[] = [];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}

			{
				const actual = n.s1.assignedNodes({ flatten: true });
				const expected = [n.f1];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
			{
				const actual = n.s2.assignedNodes({ flatten: true });
				const expected = [n.f1, n.f2];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
			{
				const actual = n.s3.assignedNodes({ flatten: true });
				const expected = [n.f1, n.f2];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
			{
				const actual = n.s4.assignedNodes({ flatten: true });
				const expected = [n.f1, n.f2, n.f4];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'Slots fallback: Mutation.  Remove a slot which is a fallback content of another slot.',
		({ document, Node }) => {
			let n = createTestTree<{
				test1: HTMLElement;
				host: HTMLElement;
				s1: HTMLSlotElement;
				f1: HTMLElement;
				test2: HTMLElement;
				s2: HTMLSlotElement;
				test3: HTMLElement;
				c1: HTMLElement;
				test4: HTMLElement;
				test5: HTMLElement;
				host1: HTMLElement;
				host2: HTMLElement;
				s4: HTMLSlotElement;
				s3: HTMLSlotElement;
				f3: HTMLElement;
				f4: HTMLElement;
				f2: HTMLElement;
			}>(document, document.getElementById('test5')!);
			removeWhiteSpaceOnlyTextNodes(n.test5, Node);

			n.s1.remove();

			{
				const actual = n.s1.assignedNodes();
				const expected: never[] = [];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}

			{
				const actual = n.s1.assignedNodes({ flatten: true });
				const expected: never[] = [];
				expect(
					actual.length,
					'fall back contents should be empty because s1 is not in a shadow tree.',
				).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(
						actual[index],
						'fall back contents should be empty because s1 is not in a shadow tree.',
					).toBe(expected[index]);
			}
			{
				const actual = n.s2.assignedNodes({ flatten: true });
				const expected = [n.f2];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
			{
				const actual = n.s3.assignedNodes({ flatten: true });
				const expected = [n.f2];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
			{
				const actual = n.s4.assignedNodes({ flatten: true });
				const expected = [n.f2, n.f4];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
}
