import type { CompatibilityContext, DOMFixture } from '../../context.ts';
import type { DOMElement as DOMElementContract } from '../../contracts/nodes.ts';

export const spec = 'https://w3c.github.io/selection-api/#selectionchange-event';
export const requires = ['selection.document.rangeManagement', 'events.dispatch.target'] as const;
// Adapted from WPT selection/onselectionchange-on-document.html.
// Copyright © web-platform-tests contributors. BSD-3-Clause.
// See ../../../../test/wpt/LICENSE and docs/wpt-ranges-parsing.md.
export const wpt =
	'https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/selection/onselectionchange-on-document.html';

function task(): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, 0));
}

async function setup(
	fixture: DOMFixture,
): Promise<{ document: Document; root: HTMLDivElement; selection: Selection }> {
	const document = fixture.document as unknown as Document;
	const root = document.createElement('div');
	root.append('abc', document.createElement('b'), 'def');
	fixture.connect(root as unknown as DOMElementContract);
	const selection = document.getSelection()!;
	selection.removeAllRanges();
	fixture.cleanup(() => selection.removeAllRanges());
	// Drain any event from resetting the fixture before installing the test listener.
	await task();
	return { document, root, selection };
}

function listen(fixture: DOMFixture, callback: (event: Event) => void): void {
	const document = fixture.document as unknown as Document;
	document.addEventListener('selectionchange', callback);
	fixture.cleanup(() => document.removeEventListener('selectionchange', callback));
}

/** Registers asynchronous selection notification and coalescing cases. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'delivers selectionchange asynchronously at the document without bubbling or cancellation',
		async (fixture) => {
			const { document, root, selection } = await setup(fixture);
			const events: Event[] = [];
			listen(fixture, (event) => events.push(event));
			selection.collapse(root, 1);
			expect(events.length).toBe(0);
			await task();
			expect(events.length).toBe(1);
			expect([events[0]!.target, events[0]!.bubbles, events[0]!.cancelable]).toEqual([
				document,
				false,
				false,
			]);
		},
	);
	context.test(
		'coalesces several synchronous selection changes into one notification',
		async (fixture) => {
			const { root, selection } = await setup(fixture);
			const offsets: number[] = [];
			listen(fixture, () => offsets.push(selection.focusOffset));
			selection.collapse(root, 0);
			selection.collapse(root, 1);
			selection.collapse(root, 2);
			expect(offsets).toEqual([]);
			await task();
			expect(offsets).toEqual([2]);
		},
	);
	context.test(
		'queues another notification when selection changes after delivery',
		async (fixture) => {
			const { root, selection } = await setup(fixture);
			const offsets: number[] = [];
			listen(fixture, () => offsets.push(selection.focusOffset));
			selection.collapse(root, 1);
			await task();
			expect(offsets).toEqual([1]);
			selection.collapse(root, 0);
			selection.collapse(root, 2);
			expect(offsets).toEqual([1]);
			await task();
			expect(offsets).toEqual([1, 2]);
		},
	);
	context.test(
		'listener mutations schedule a later event and never recursively dispatch',
		async (fixture) => {
			const { root, selection } = await setup(fixture);
			const offsets: number[] = [];
			let inside = false,
				recursive = false;
			listen(fixture, () => {
				if (inside) recursive = true;
				inside = true;
				offsets.push(selection.focusOffset);
				if (offsets.length === 1) {
					selection.collapse(root, 2);
					selection.collapse(root, 0);
				}
				inside = false;
			});
			selection.collapse(root, 1);
			await task();
			await task();
			expect(offsets).toEqual([1, 0]);
			expect(recursive).toBe(false);
		},
	);
	context.test('mutating a retained range schedules a selection notification', async (fixture) => {
		const { root, selection } = await setup(fixture);
		selection.collapse(root.firstChild!, 0);
		await task();
		const range = selection.getRangeAt(0);
		const text: string[] = [];
		listen(fixture, () => text.push(selection.toString()));
		range.setEnd(root.firstChild!, 2);
		expect(text).toEqual([]);
		await task();
		expect(text).toEqual(['ab']);
		expect(selection.getRangeAt(0)).toBe(range);
	});
}
