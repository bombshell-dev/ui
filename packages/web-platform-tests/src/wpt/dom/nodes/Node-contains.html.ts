import type { CompatibilityContext } from '../../../shared/context.ts';
import { createNodes, nodeNames } from '../common.js.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	for (const referenceName of nodeNames) {
		context.test(referenceName + '.contains(null)', (fixture) => {
			const reference = createNodes(fixture)[referenceName];

			expect(reference.contains(null)).toBe(false);
		});
		for (const otherName of nodeNames) {
			context.test(referenceName + '.contains(' + otherName + ')', (fixture) => {
				const nodes = createNodes(fixture);
				const reference = nodes[referenceName];
				const other = nodes[otherName];

				let ancestor: Node | null = other;
				while (ancestor && ancestor !== reference) {
					ancestor = ancestor.parentNode;
				}
				if (ancestor === reference) {
					expect(reference.contains(other)).toBe(true);
				} else {
					expect(reference.contains(other)).toBe(false);
				}
			});
		}
	}
}
