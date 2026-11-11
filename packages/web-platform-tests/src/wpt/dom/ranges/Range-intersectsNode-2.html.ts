import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test(
		'Range.intersectsNode() simple cases',
		({ document, Range }) => {
			const range = new Range();
			const div = document.getElementById('div')!;
			const s0 = document.getElementById('s0')!;
			const s1 = document.getElementById('s1')!;
			const s2 = document.getElementById('s2')!;

			// Range encloses s0
			range.setStart(div, 0);
			range.setEnd(div, 1);
			expect(range.intersectsNode(s0), '[s0] range.intersectsNode(s0)').toBe(true);
			expect(range.intersectsNode(s1), '[s0] range.intersectsNode(s1)').toBe(false);
			expect(range.intersectsNode(s2), '[s0] range.intersectsNode(s2)').toBe(false);

			// Range encloses s1
			range.setStart(div, 1);
			range.setEnd(div, 2);
			expect(range.intersectsNode(s0), '[s1] range.intersectsNode(s0)').toBe(false);
			expect(range.intersectsNode(s1), '[s1] range.intersectsNode(s1)').toBe(true);
			expect(range.intersectsNode(s2), '[s1] range.intersectsNode(s2)').toBe(false);

			// Range encloses s2
			range.setStart(div, 2);
			range.setEnd(div, 3);
			expect(range.intersectsNode(s0), '[s2] range.intersectsNode(s0)').toBe(false);
			expect(range.intersectsNode(s1), '[s2] range.intersectsNode(s1)').toBe(false);
			expect(range.intersectsNode(s2), '[s2] range.intersectsNode(s2)').toBe(true);
		},
		{
			document: {
				contentType: 'text/html',
				content:
					'<!doctype html><div id="div"><span id="s0">s0</span><span id="s1">s1</span><span id="s2">s2</span></div>',
			},
		},
	);
}
