import type { CompatibilityContext } from '../../../shared/context.ts';
type ExpectedRecord = {
	[Key in keyof MutationRecord]?: MutationRecord[Key] | Node[] | (() => unknown);
};
// Compares a mutation record to a predefined one
// mutationToCheck is a mutation record from the user agent
// expectedRecord is a mutation record minted by the test
//    for expectedRecord, if properties are omitted, they get default ones
export function checkRecords(
	expect: CompatibilityContext['runner']['expect'],
	target: Node,
	mutationToCheck: MutationRecord[],
	expectedRecord: ExpectedRecord[],
) {
	let mr1: MutationRecord;
	let mr2: ExpectedRecord;

	function checkField(property: keyof MutationRecord, isArray = false) {
		let field: unknown = mr2[property];
		if (isArray === undefined) {
			isArray = false;
		}
		if (field instanceof Function) {
			field = field();
		} else if (field === undefined) {
			if (isArray) {
				field = new Array();
			} else {
				field = null;
			}
		}
		if (isArray) {
			{
				const actual = mr1[property] as NodeList;
				const expected = field as Node[];
				expect(actual.length, property + " didn't match").toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index], property + " didn't match").toBe(expected[index]);
			}
		} else {
			expect(mr1[property], property + " didn't match").toBe(field);
		}
	}

	expect(mutationToCheck.length, 'mutation records must match').toBe(expectedRecord.length);
	for (let item = 0; item < mutationToCheck.length; item++) {
		mr1 = mutationToCheck[item]!;
		mr2 = expectedRecord[item]!;

		if (mr2.target instanceof Function) {
			expect(mr1.target, 'target node must match').toBe(mr2.target());
		} else if (mr2.target !== undefined) {
			expect(mr1.target, 'target node must match').toBe(mr2.target);
		} else {
			expect(mr1.target, 'target node must match').toBe(target);
		}

		checkField('type');
		checkField('addedNodes', true);
		checkField('removedNodes', true);
		checkField('previousSibling');
		checkField('nextSibling');
		checkField('attributeName');
		checkField('attributeNamespace');
		checkField('oldValue');
	}
}
