import type { CompatibilityContext } from '../../../shared/context.ts';
import { createNodes, nodeNames, furthestAncestor, previousNode } from '../common.js.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	for (const referenceName of nodeNames) {
		for (const otherName of nodeNames) {
			context.test(referenceName + '.compareDocumentPosition(' + otherName + ')', (fixture) => {
				const nodes = createNodes(fixture);
				const reference = nodes[referenceName];
				const other = nodes[otherName];
				const Node = fixture.Node;

				let result = reference.compareDocumentPosition(other);

				// "If other and reference are the same object, return zero and
				// terminate these steps."
				if (other === reference) {
					expect(result).toBe(0);
					return;
				}

				// "If other and reference are not in the same tree, return the result of
				// adding DOCUMENT_POSITION_DISCONNECTED,
				// DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC, and either
				// DOCUMENT_POSITION_PRECEDING or DOCUMENT_POSITION_FOLLOWING, with the
				// constraint that this is to be consistent, together and terminate these
				// steps."
				if (furthestAncestor(reference) !== furthestAncestor(other)) {
					let expected1 =
						Node.DOCUMENT_POSITION_DISCONNECTED +
						Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC +
						Node.DOCUMENT_POSITION_PRECEDING;
					let expected2 =
						Node.DOCUMENT_POSITION_DISCONNECTED +
						Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC +
						Node.DOCUMENT_POSITION_FOLLOWING;
					expect([expected1, expected2]).toContain(result);

					// TODO: What does "consistent" mean exactly? Is it transitive? A total order?
					// Here we test that the relation is anticommutative: a < b => b > a; a > b => b < a
					let anticommutativeResult = other.compareDocumentPosition(reference);
					if (result === expected1) {
						expect(anticommutativeResult).toBe(expected2);
					} else {
						expect(anticommutativeResult).toBe(expected1);
					}
					return;
				}

				// "If other is an ancestor of reference, return the result of
				// adding DOCUMENT_POSITION_CONTAINS to DOCUMENT_POSITION_PRECEDING
				// and terminate these steps."
				let ancestor: Node | null = reference.parentNode;
				while (ancestor && ancestor !== other) {
					ancestor = ancestor.parentNode;
				}
				if (ancestor === other) {
					expect(result).toBe(Node.DOCUMENT_POSITION_CONTAINS + Node.DOCUMENT_POSITION_PRECEDING);
					return;
				}

				// "If other is a descendant of reference, return the result of adding
				// DOCUMENT_POSITION_CONTAINED_BY to DOCUMENT_POSITION_FOLLOWING and
				// terminate these steps."
				ancestor = other.parentNode;
				while (ancestor && ancestor !== reference) {
					ancestor = ancestor.parentNode;
				}
				if (ancestor === reference) {
					expect(result).toBe(
						Node.DOCUMENT_POSITION_CONTAINED_BY + Node.DOCUMENT_POSITION_FOLLOWING,
					);
					return;
				}

				// "If other is preceding reference return DOCUMENT_POSITION_PRECEDING
				// and terminate these steps."
				let prev = previousNode(reference);
				while (prev && prev !== other) {
					prev = previousNode(prev);
				}
				if (prev === other) {
					expect(result).toBe(Node.DOCUMENT_POSITION_PRECEDING);
					return;
				}

				// "Return DOCUMENT_POSITION_FOLLOWING."
				expect(result).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
			});
		}
	}
}
