import type { CompatibilityExpect } from '../../../../shared/context.ts';

// |expected| should be an object indicating the expected type of node.
export function assert_node(
	expect: CompatibilityExpect,
	actual: Node | null,
	expected: {
		type: abstract new (...args: never[]) => Node;
		id?: string;
		nodeValue?: string | null;
		nodeType?: number;
	},
) {
	expect(
		actual instanceof expected.type,
		'Node type mismatch: actual = ' + actual!.nodeType + ', expected = ' + expected.nodeType,
	).toBe(true);
	if (typeof expected.id !== 'undefined') expect((actual as Element).id).toBe(expected.id);
	if (typeof expected.nodeValue !== 'undefined') expect(actual!.nodeValue).toBe(expected.nodeValue);
}
