import type { CompatibilityContext } from '../../shared/context.ts';
import { createTestTree } from './resources/shadow-dom.js.ts';

const markup = `<!DOCTYPE html>
<title>Shadow DOM: Imperative Slot API</title>
<meta name="author" title="Yu Han" href="mailto:yuzhehan@chromium.org">




<div id="test_basic">
  <div id="host1"></div>
  <div id="host2"></div>
  <div id="host3"></div>
</div>


<div id="test_assign">
  <div id="host">
    <template id="shadow_root" data-mode="open" data-slot-assignment="manual">
      <slot id="s1"></slot>
      <slot id="s2"></slot>
      <slot id="s3"></slot>
    </template>
    <div id="c1"></div>
    <div id="c2"></div>
    <div id="c3"></div>
    <div id="nested">
       <div id="ns1"></div>
    </div>
  </div>
  <div id="c4"></div>
  <div id="host4">
    <template id="shadow_root4" data-mode="open" data-slot-assignment="manual">
      <slot id="s4" name="s4"></slot>
    </template>
  </div>
</div>

`;

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'attachShadow can take slotAssignment parameter.',
		({ document, TypeError }) => {
			const c1 = document.getElementById('c1')!,
				c2 = document.getElementById('c2')!;

			let tTree = createTestTree<{
				test_basic: HTMLElement;
				host1: HTMLElement;
				host2: HTMLElement;
				host3: HTMLElement;
				test_assign: HTMLElement;
				host: HTMLElement;
				shadow_root: ShadowRoot;
				s1: HTMLSlotElement;
				s2: HTMLSlotElement;
				s3: HTMLSlotElement;
				c1: HTMLElement;
				c2: HTMLElement;
				c3: HTMLElement;
				nested: HTMLElement;
				ns1: HTMLElement;
				c4: HTMLElement;
				host4: HTMLElement;
				shadow_root4: ShadowRoot;
				s4: HTMLSlotElement;
			}>(document, document.getElementById('test_basic')!);
			const shadow1 = tTree.host1.attachShadow({ mode: 'open', slotAssignment: 'manual' });
			expect(shadow1, 'slot assignment manual should work').not.toBe(null);
			expect(shadow1.slotAssignment, 'slotAssignment should return "manual"').toBe('manual');
			const shadow2 = tTree.host2.attachShadow({ mode: 'open', slotAssignment: 'named' });
			expect(shadow2, 'slot assignment named should work').not.toBe(null);
			expect(shadow2.slotAssignment, 'slotAssignment should return "named"').toBe('named');
			expect(() => {
				tTree.host3.attachShadow({
					mode: 'open',
					slotAssignment: 'exceptional' as SlotAssignmentMode,
				});
			}, 'others should throw exception').toThrow(
				expect.objectContaining({ constructor: TypeError }),
			);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'slot.attach() should take variadic not sequence.',
		({ document, TypeError }) => {
			const c1 = document.getElementById('c1')!,
				c2 = document.getElementById('c2')!;

			let tTree = createTestTree<{
				test_basic: HTMLElement;
				host1: HTMLElement;
				host2: HTMLElement;
				host3: HTMLElement;
				test_assign: HTMLElement;
				host: HTMLElement;
				shadow_root: ShadowRoot;
				s1: HTMLSlotElement;
				s2: HTMLSlotElement;
				s3: HTMLSlotElement;
				c1: HTMLElement;
				c2: HTMLElement;
				c3: HTMLElement;
				nested: HTMLElement;
				ns1: HTMLElement;
				c4: HTMLElement;
				host4: HTMLElement;
				shadow_root4: ShadowRoot;
				s4: HTMLSlotElement;
			}>(document, document.getElementById('test_assign')!);
			tTree.s1.assign(c1, c2); // Should work
			expect(() => {
				tTree.s1.assign([c1, c2] as unknown as Element);
			}, 'sequence not allowed').toThrow(expect.objectContaining({ constructor: TypeError }));
			expect(() => {
				tTree.s1.assign([] as unknown as Element);
			}, 'including empty sequences').toThrow(expect.objectContaining({ constructor: TypeError }));
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'Imperative slot API can assign nodes in manual slot assignment.',
		({ document }) => {
			const c1 = document.getElementById('c1')!,
				c2 = document.getElementById('c2')!;

			let tTree = createTestTree<{
				test_basic: HTMLElement;
				host1: HTMLElement;
				host2: HTMLElement;
				host3: HTMLElement;
				test_assign: HTMLElement;
				host: HTMLElement;
				shadow_root: ShadowRoot;
				s1: HTMLSlotElement;
				s2: HTMLSlotElement;
				s3: HTMLSlotElement;
				c1: HTMLElement;
				c2: HTMLElement;
				c3: HTMLElement;
				nested: HTMLElement;
				ns1: HTMLElement;
				c4: HTMLElement;
				host4: HTMLElement;
				shadow_root4: ShadowRoot;
				s4: HTMLSlotElement;
			}>(document, document.getElementById('test_assign')!);
			{
				const actual = tTree.s2.assignedElements();
				const expected: never[] = [];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
			expect(tTree.c1.assignedSlot).toBe(null);

			tTree.s1.assign(tTree.c1);
			{
				const actual = tTree.s1.assignedNodes();
				const expected = [tTree.c1];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
			expect(tTree.c1.assignedSlot).toBe(tTree.s1);

			tTree.s2.assign(tTree.c2, tTree.c3);
			{
				const actual = tTree.s1.assignedNodes();
				const expected = [tTree.c1];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
			{
				const actual = tTree.s2.assignedNodes();
				const expected = [tTree.c2, tTree.c3];
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
		'Order of slottables is preserved in manual slot assignment.',
		({ document }) => {
			const c1 = document.getElementById('c1')!,
				c2 = document.getElementById('c2')!;

			let tTree = createTestTree<{
				test_basic: HTMLElement;
				host1: HTMLElement;
				host2: HTMLElement;
				host3: HTMLElement;
				test_assign: HTMLElement;
				host: HTMLElement;
				shadow_root: ShadowRoot;
				s1: HTMLSlotElement;
				s2: HTMLSlotElement;
				s3: HTMLSlotElement;
				c1: HTMLElement;
				c2: HTMLElement;
				c3: HTMLElement;
				nested: HTMLElement;
				ns1: HTMLElement;
				c4: HTMLElement;
				host4: HTMLElement;
				shadow_root4: ShadowRoot;
				s4: HTMLSlotElement;
			}>(document, document.getElementById('test_assign')!);

			tTree.s1.assign(tTree.c2, tTree.c3, tTree.c1);
			{
				const actual = tTree.s1.assignedNodes();
				const expected = [tTree.c2, tTree.c3, tTree.c1];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
			expect(tTree.c1.assignedSlot).toBe(tTree.s1);
			expect(tTree.c2.assignedSlot).toBe(tTree.s1);
			expect(tTree.c3.assignedSlot).toBe(tTree.s1);

			tTree.s1.assign(tTree.c1, tTree.c2);
			{
				const actual = tTree.s1.assignedNodes();
				const expected = [tTree.c1, tTree.c2];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
			expect(tTree.c1.assignedSlot).toBe(tTree.s1);
			expect(tTree.c2.assignedSlot).toBe(tTree.s1);
			expect(tTree.c3.assignedSlot).toBe(null);

			tTree.s1.assign(tTree.c3, tTree.c2, tTree.c1);
			{
				const actual = tTree.s1.assignedNodes();
				const expected = [tTree.c3, tTree.c2, tTree.c1];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
			expect(tTree.c1.assignedSlot).toBe(tTree.s1);
			expect(tTree.c2.assignedSlot).toBe(tTree.s1);
			expect(tTree.c3.assignedSlot).toBe(tTree.s1);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		"Previously assigned slottable is moved to new slot when it's reassigned.",
		({ document }) => {
			const c1 = document.getElementById('c1')!,
				c2 = document.getElementById('c2')!;

			let tTree = createTestTree<{
				test_basic: HTMLElement;
				host1: HTMLElement;
				host2: HTMLElement;
				host3: HTMLElement;
				test_assign: HTMLElement;
				host: HTMLElement;
				shadow_root: ShadowRoot;
				s1: HTMLSlotElement;
				s2: HTMLSlotElement;
				s3: HTMLSlotElement;
				c1: HTMLElement;
				c2: HTMLElement;
				c3: HTMLElement;
				nested: HTMLElement;
				ns1: HTMLElement;
				c4: HTMLElement;
				host4: HTMLElement;
				shadow_root4: ShadowRoot;
				s4: HTMLSlotElement;
			}>(document, document.getElementById('test_assign')!);

			tTree.s1.assign(tTree.c2, tTree.c3, tTree.c1);
			{
				const actual = tTree.s1.assignedNodes();
				const expected = [tTree.c2, tTree.c3, tTree.c1];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}

			tTree.s2.assign(tTree.c2);
			{
				const actual = tTree.s1.assignedNodes();
				const expected = [tTree.c3, tTree.c1];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
			{
				const actual = tTree.s2.assignedNodes();
				const expected = [tTree.c2];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
			expect(tTree.c1.assignedSlot).toBe(tTree.s1);
			expect(tTree.c2.assignedSlot).toBe(tTree.s2);
			expect(tTree.c3.assignedSlot).toBe(tTree.s1);

			tTree.s3.assign(tTree.c3);
			{
				const actual = tTree.s1.assignedNodes();
				const expected = [tTree.c1];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
			{
				const actual = tTree.s2.assignedNodes();
				const expected = [tTree.c2];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
			{
				const actual = tTree.s3.assignedNodes();
				const expected = [tTree.c3];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
			expect(tTree.c1.assignedSlot).toBe(tTree.s1);
			expect(tTree.c2.assignedSlot).toBe(tTree.s2);
			expect(tTree.c3.assignedSlot).toBe(tTree.s3);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'Order and assignment of nodes are preserved during multiple assignment in a row.',
		({ document }) => {
			const c1 = document.getElementById('c1')!,
				c2 = document.getElementById('c2')!;

			let tTree = createTestTree<{
				test_basic: HTMLElement;
				host1: HTMLElement;
				host2: HTMLElement;
				host3: HTMLElement;
				test_assign: HTMLElement;
				host: HTMLElement;
				shadow_root: ShadowRoot;
				s1: HTMLSlotElement;
				s2: HTMLSlotElement;
				s3: HTMLSlotElement;
				c1: HTMLElement;
				c2: HTMLElement;
				c3: HTMLElement;
				nested: HTMLElement;
				ns1: HTMLElement;
				c4: HTMLElement;
				host4: HTMLElement;
				shadow_root4: ShadowRoot;
				s4: HTMLSlotElement;
			}>(document, document.getElementById('test_assign')!);

			tTree.s1.assign(tTree.c1);
			tTree.s2.assign(tTree.c2, tTree.c1);
			tTree.s3.assign(tTree.c1, tTree.c3);

			{
				const actual = tTree.s1.assignedNodes();
				const expected: never[] = [];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
			{
				const actual = tTree.s2.assignedNodes();
				const expected = [tTree.c2];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
			{
				const actual = tTree.s3.assignedNodes();
				const expected = [tTree.c1, tTree.c3];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
			expect(tTree.c1.assignedSlot).toBe(tTree.s3);
			expect(tTree.c2.assignedSlot).toBe(tTree.s2);
			expect(tTree.c3.assignedSlot).toBe(tTree.s3);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'Assigning invalid nodes should be allowed.',
		({ document }) => {
			const c1 = document.getElementById('c1')!,
				c2 = document.getElementById('c2')!;

			let tTree = createTestTree<{
				test_basic: HTMLElement;
				host1: HTMLElement;
				host2: HTMLElement;
				host3: HTMLElement;
				test_assign: HTMLElement;
				host: HTMLElement;
				shadow_root: ShadowRoot;
				s1: HTMLSlotElement;
				s2: HTMLSlotElement;
				s3: HTMLSlotElement;
				c1: HTMLElement;
				c2: HTMLElement;
				c3: HTMLElement;
				nested: HTMLElement;
				ns1: HTMLElement;
				c4: HTMLElement;
				host4: HTMLElement;
				shadow_root4: ShadowRoot;
				s4: HTMLSlotElement;
			}>(document, document.getElementById('test_assign')!);

			// tTree.c4 is invalid for tTree.host slot assignment.
			// No exception should be thrown here.
			tTree.s1.assign(tTree.c1, tTree.c4, tTree.c2);

			// All observable assignments should skip c4.
			{
				const actual = tTree.s1.assignedNodes();
				const expected = [tTree.c1, tTree.c2];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
			expect(tTree.c1.assignedSlot).toBe(tTree.s1);
			expect(tTree.c2.assignedSlot).toBe(tTree.s1);
			expect(tTree.c4.assignedSlot).toBe(null);

			// Moving c4 into place should reveal the assignment.
			tTree.host.append(tTree.c4);
			{
				const actual = tTree.s1.assignedNodes();
				const expected = [tTree.c1, tTree.c4, tTree.c2];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
			expect(tTree.c1.assignedSlot).toBe(tTree.s1);
			expect(tTree.c2.assignedSlot).toBe(tTree.s1);
			expect(tTree.c4.assignedSlot).toBe(tTree.s1);

			// Moving c4 into a different shadow host and back should
			// also not break the assignment.
			tTree.host4.append(tTree.c4);
			{
				const actual = tTree.s1.assignedNodes();
				const expected = [tTree.c1, tTree.c2];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
			expect(tTree.c4.assignedSlot).toBe(null);
			tTree.host.append(tTree.c4);
			{
				const actual = tTree.s1.assignedNodes();
				const expected = [tTree.c1, tTree.c4, tTree.c2];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
			expect(tTree.c4.assignedSlot).toBe(tTree.s1);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'Moving a slot to a new host, the slot loses its previously assigned slottables.',
		({ document }) => {
			const c1 = document.getElementById('c1')!,
				c2 = document.getElementById('c2')!;

			let tTree = createTestTree<{
				test_basic: HTMLElement;
				host1: HTMLElement;
				host2: HTMLElement;
				host3: HTMLElement;
				test_assign: HTMLElement;
				host: HTMLElement;
				shadow_root: ShadowRoot;
				s1: HTMLSlotElement;
				s2: HTMLSlotElement;
				s3: HTMLSlotElement;
				c1: HTMLElement;
				c2: HTMLElement;
				c3: HTMLElement;
				nested: HTMLElement;
				ns1: HTMLElement;
				c4: HTMLElement;
				host4: HTMLElement;
				shadow_root4: ShadowRoot;
				s4: HTMLSlotElement;
			}>(document, document.getElementById('test_assign')!);

			tTree.s1.assign(tTree.c1, tTree.c2, tTree.c3);
			{
				const actual = tTree.s1.assignedNodes();
				const expected = [tTree.c1, tTree.c2, tTree.c3];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}

			tTree.host4.append(tTree.s1);
			{
				const actual = tTree.s1.assignedNodes();
				const expected: never[] = [];
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
		"Moving a slot's tree order position within a shadow host has no impact on its assigned slottables.",
		({ document }) => {
			const c1 = document.getElementById('c1')!,
				c2 = document.getElementById('c2')!;

			let tTree = createTestTree<{
				test_basic: HTMLElement;
				host1: HTMLElement;
				host2: HTMLElement;
				host3: HTMLElement;
				test_assign: HTMLElement;
				host: HTMLElement;
				shadow_root: ShadowRoot;
				s1: HTMLSlotElement;
				s2: HTMLSlotElement;
				s3: HTMLSlotElement;
				c1: HTMLElement;
				c2: HTMLElement;
				c3: HTMLElement;
				nested: HTMLElement;
				ns1: HTMLElement;
				c4: HTMLElement;
				host4: HTMLElement;
				shadow_root4: ShadowRoot;
				s4: HTMLSlotElement;
			}>(document, document.getElementById('test_assign')!);

			tTree.s1.assign(tTree.c1, tTree.c2, tTree.c3);
			{
				const actual = tTree.s1.assignedNodes();
				const expected = [tTree.c1, tTree.c2, tTree.c3];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}

			tTree.shadow_root.insertBefore(tTree.s2, tTree.s1);
			{
				const actual = tTree.s1.assignedNodes();
				const expected = [tTree.c1, tTree.c2, tTree.c3];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
			{
				const actual = tTree.s2.assignedNodes();
				const expected: never[] = [];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}

			tTree.shadow_root.insertBefore(tTree.s4, tTree.s1);
			{
				const actual = tTree.s1.assignedNodes();
				const expected = [tTree.c1, tTree.c2, tTree.c3];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
			{
				const actual = tTree.s4.assignedNodes();
				const expected: never[] = [];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}

			tTree.ns1.append(tTree.s1);
			{
				const actual = tTree.s1.assignedNodes();
				const expected: never[] = [];
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
		'Appending slottable to different host, it loses slot assignment. It can be re-assigned within a new host.',
		({ document }) => {
			const c1 = document.getElementById('c1')!,
				c2 = document.getElementById('c2')!;

			let tTree = createTestTree<{
				test_basic: HTMLElement;
				host1: HTMLElement;
				host2: HTMLElement;
				host3: HTMLElement;
				test_assign: HTMLElement;
				host: HTMLElement;
				shadow_root: ShadowRoot;
				s1: HTMLSlotElement;
				s2: HTMLSlotElement;
				s3: HTMLSlotElement;
				c1: HTMLElement;
				c2: HTMLElement;
				c3: HTMLElement;
				nested: HTMLElement;
				ns1: HTMLElement;
				c4: HTMLElement;
				host4: HTMLElement;
				shadow_root4: ShadowRoot;
				s4: HTMLSlotElement;
			}>(document, document.getElementById('test_assign')!);

			tTree.s1.assign(tTree.c1, tTree.c2, tTree.c3);
			{
				const actual = tTree.s1.assignedNodes();
				const expected = [tTree.c1, tTree.c2, tTree.c3];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}

			tTree.host4.append(tTree.c1);
			{
				const actual = tTree.s1.assignedNodes();
				const expected = [tTree.c2, tTree.c3];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
			{
				const actual = tTree.s4.assignedNodes();
				const expected: never[] = [];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
			expect(tTree.c1.assignedSlot).toBe(null);

			tTree.s4.assign(tTree.c1);
			{
				const actual = tTree.s4.assignedNodes();
				const expected = [tTree.c1];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
			expect(tTree.c1.assignedSlot).toBe(tTree.s4);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'Previously assigned node should not be assigned if slot moved to a new shadow root. The node is re-assigned when moved back.',
		({ document }) => {
			const c1 = document.getElementById('c1')!,
				c2 = document.getElementById('c2')!;

			let tTree = createTestTree<{
				test_basic: HTMLElement;
				host1: HTMLElement;
				host2: HTMLElement;
				host3: HTMLElement;
				test_assign: HTMLElement;
				host: HTMLElement;
				shadow_root: ShadowRoot;
				s1: HTMLSlotElement;
				s2: HTMLSlotElement;
				s3: HTMLSlotElement;
				c1: HTMLElement;
				c2: HTMLElement;
				c3: HTMLElement;
				nested: HTMLElement;
				ns1: HTMLElement;
				c4: HTMLElement;
				host4: HTMLElement;
				shadow_root4: ShadowRoot;
				s4: HTMLSlotElement;
			}>(document, document.getElementById('test_assign')!);

			tTree.s1.assign(tTree.c1);
			{
				const actual = tTree.s1.assignedNodes();
				const expected = [tTree.c1];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}

			tTree.shadow_root4.insertBefore(tTree.s1, tTree.s4);
			{
				const actual = tTree.s1.assignedNodes();
				const expected: never[] = [];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
			// Trigger slot assignment on previous shadow root.
			{
				const actual = tTree.s2.assignedNodes();
				const expected: never[] = [];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}

			tTree.shadow_root.insertBefore(tTree.s1, tTree.s2);
			{
				const actual = tTree.s1.assignedNodes();
				const expected = [tTree.c1];
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
		'Assignment with the same node in parameters should be ignored, first one wins.',
		({ document }) => {
			const c1 = document.getElementById('c1')!,
				c2 = document.getElementById('c2')!;

			let tTree = createTestTree<{
				test_basic: HTMLElement;
				host1: HTMLElement;
				host2: HTMLElement;
				host3: HTMLElement;
				test_assign: HTMLElement;
				host: HTMLElement;
				shadow_root: ShadowRoot;
				s1: HTMLSlotElement;
				s2: HTMLSlotElement;
				s3: HTMLSlotElement;
				c1: HTMLElement;
				c2: HTMLElement;
				c3: HTMLElement;
				nested: HTMLElement;
				ns1: HTMLElement;
				c4: HTMLElement;
				host4: HTMLElement;
				shadow_root4: ShadowRoot;
				s4: HTMLSlotElement;
			}>(document, document.getElementById('test_assign')!);

			tTree.s1.assign(tTree.c1, tTree.c1, tTree.c1);
			{
				const actual = tTree.s1.assignedNodes();
				const expected = [tTree.c1];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}

			tTree.s1.assign(tTree.c1, tTree.c1, tTree.c2, tTree.c2, tTree.c1);
			{
				const actual = tTree.s1.assignedNodes();
				const expected = [tTree.c1, tTree.c2];
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
		"Removing a slot from DOM resets its slottable's slot assignment.",
		({ document }) => {
			const c1 = document.getElementById('c1')!,
				c2 = document.getElementById('c2')!;

			let tTree = createTestTree<{
				test_basic: HTMLElement;
				host1: HTMLElement;
				host2: HTMLElement;
				host3: HTMLElement;
				test_assign: HTMLElement;
				host: HTMLElement;
				shadow_root: ShadowRoot;
				s1: HTMLSlotElement;
				s2: HTMLSlotElement;
				s3: HTMLSlotElement;
				c1: HTMLElement;
				c2: HTMLElement;
				c3: HTMLElement;
				nested: HTMLElement;
				ns1: HTMLElement;
				c4: HTMLElement;
				host4: HTMLElement;
				shadow_root4: ShadowRoot;
				s4: HTMLSlotElement;
			}>(document, document.getElementById('test_assign')!);

			tTree.s1.assign(tTree.c1, tTree.c2, tTree.c3);
			tTree.s1.remove();

			expect(tTree.c1.assignedSlot).toBe(null);
			expect(tTree.c2.assignedSlot).toBe(null);
			expect(tTree.c3.assignedSlot).toBe(null);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		"Nodes can be assigned even if slots or nodes aren't in the same tree.",
		({ document }) => {
			const c1 = document.getElementById('c1')!,
				c2 = document.getElementById('c2')!;

			let tTree = createTestTree<{
				test_basic: HTMLElement;
				host1: HTMLElement;
				host2: HTMLElement;
				host3: HTMLElement;
				test_assign: HTMLElement;
				host: HTMLElement;
				shadow_root: ShadowRoot;
				s1: HTMLSlotElement;
				s2: HTMLSlotElement;
				s3: HTMLSlotElement;
				c1: HTMLElement;
				c2: HTMLElement;
				c3: HTMLElement;
				nested: HTMLElement;
				ns1: HTMLElement;
				c4: HTMLElement;
				host4: HTMLElement;
				shadow_root4: ShadowRoot;
				s4: HTMLSlotElement;
			}>(document, document.getElementById('test_assign')!);

			const isolatedDocNode = document.implementation.createHTMLDocument('').body;
			isolatedDocNode.appendChild(tTree.c1);
			const isolatedDocNode2 = document.implementation.createHTMLDocument('').body;
			isolatedDocNode2.appendChild(tTree.s1);

			tTree.s1.assign(tTree.c1, tTree.c2);
			{
				const actual = tTree.s1.assignedNodes();
				const expected: never[] = [];
				expect(actual.length, 's1 not inside shadow root').toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index], 's1 not inside shadow root').toBe(expected[index]);
			}
			expect(tTree.c1.assignedSlot).toBe(null);
			expect(tTree.c2.assignedSlot).toBe(null);

			tTree.shadow_root.appendChild(tTree.s1);
			tTree.host.appendChild(tTree.c1);
			{
				const actual = tTree.s1.assignedNodes();
				const expected = [tTree.c1, tTree.c2];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
			expect(tTree.c1.assignedSlot).toBe(tTree.s1);
			expect(tTree.c2.assignedSlot).toBe(tTree.s1);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'Removing a node from the document does not break manually assigned slot linkage.',
		({ document }) => {
			const c1 = document.getElementById('c1')!,
				c2 = document.getElementById('c2')!;

			let tTree = createTestTree<{
				test_basic: HTMLElement;
				host1: HTMLElement;
				host2: HTMLElement;
				host3: HTMLElement;
				test_assign: HTMLElement;
				host: HTMLElement;
				shadow_root: ShadowRoot;
				s1: HTMLSlotElement;
				s2: HTMLSlotElement;
				s3: HTMLSlotElement;
				c1: HTMLElement;
				c2: HTMLElement;
				c3: HTMLElement;
				nested: HTMLElement;
				ns1: HTMLElement;
				c4: HTMLElement;
				host4: HTMLElement;
				shadow_root4: ShadowRoot;
				s4: HTMLSlotElement;
			}>(document, document.getElementById('test_assign')!);

			tTree.s1.assign(tTree.c1, tTree.c2);
			{
				const actual = tTree.s1.assignedNodes();
				const expected = [tTree.c1, tTree.c2];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
			expect(tTree.c1.assignedSlot).toBe(tTree.s1);
			expect(tTree.c2.assignedSlot).toBe(tTree.s1);

			const isolatedDocNode = document.implementation.createHTMLDocument('').body;
			isolatedDocNode.appendChild(tTree.c1);
			const isolatedDocNode2 = document.implementation.createHTMLDocument('').body;
			isolatedDocNode2.appendChild(tTree.s1);

			{
				const actual = tTree.s1.assignedNodes();
				const expected: never[] = [];
				expect(actual.length, 's1 not inside shadow root').toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index], 's1 not inside shadow root').toBe(expected[index]);
			}
			expect(tTree.c1.assignedSlot).toBe(null);
			expect(tTree.c2.assignedSlot).toBe(null);

			tTree.shadow_root.appendChild(tTree.s1);
			tTree.host.appendChild(tTree.c1);
			{
				const actual = tTree.s1.assignedNodes();
				const expected = [tTree.c1, tTree.c2];
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
			expect(tTree.c1.assignedSlot).toBe(tTree.s1);
			expect(tTree.c2.assignedSlot).toBe(tTree.s1);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'throw TypeError if the passed values are neither Element nor Text',
		({ document, TypeError }) => {
			const c1 = document.getElementById('c1')!,
				c2 = document.getElementById('c2')!;

			const inputValues = [
				['Attr', document.createAttribute('bar')],
				['Comment', document.createComment('bar')],
				['DocumentFragment', document.createDocumentFragment()],
				['DocumentType', document.implementation.createDocumentType('html', '', '')],
			] as const;
			for (const [label, input] of inputValues) {
				expect(() => {
					const slot = document.createElement('slot');
					slot.assign(input as unknown as Element);
				}, label).toThrow(expect.objectContaining({ constructor: TypeError }));
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
