import type { DOMElement as DOMElementContract } from '../../contracts/nodes.ts';
import type { CompatibilityContext } from '../../context.ts';
export const spec = 'https://w3c.github.io/selection-api/#dom-selection-setbaseandextent';
export const requires = ['selection.document.rangeManagement'] as const;
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'distinguishes backward anchor and focus from ordered range endpoints',
		({ document, connect, cleanup }) => {
			const root = document.createElement('div');
			const text = document.createTextNode('abcdef');
			root.append(text);
			connect(root);
			const selection = document.getSelection();
			if (!selection) return expect.fail('Document selection expected');
			cleanup(() => selection.removeAllRanges());
			selection.setBaseAndExtent(text, 5, text, 1);
			expect(selection.direction).toBe('backward');
			expect(selection.anchorOffset).toBe(5);
			expect(selection.focusOffset).toBe(1);
			const range = selection.getRangeAt(0);
			expect(range.startOffset).toBe(1);
			selection.extend(text, 6);
			expect(selection.direction).toBe('forward');
			expect(selection.toString()).toBe('f');
		},
	);

	context.test(
		'setBaseAndExtent preserves backward anchor and focus while ordering the range',
		(fixture) => {
			const document = fixture.document as unknown as Document;
			const p = document.createElement('div'),
				t = document.createTextNode('abcd');
			p.append(t);
			fixture.connect(p as unknown as DOMElementContract);
			const s = document.getSelection()!;
			s.setBaseAndExtent(t, 3, t, 1);
			expect(s.anchorNode).toBe(t);
			expect(s.anchorOffset).toBe(3);
			expect(s.focusOffset).toBe(1);
			expect(s.getRangeAt(0).startOffset).toBe(1);
			expect(s.getRangeAt(0).endOffset).toBe(3);
			expect(s.toString()).toBe('bc');
			s.collapseToStart();
			expect(s.anchorOffset).toBe(1);
			expect(s.isCollapsed).toBe(true);
		},
	);
}
