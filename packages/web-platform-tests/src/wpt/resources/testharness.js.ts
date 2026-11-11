import type { CompatibilityExpect } from '../../shared/context.ts';

// Adapted assert_readonly from the upstream test harness.
export function assert_readonly(
	expect: CompatibilityExpect,
	object: object | null,
	property_name: string,
) {
	expect(property_name in object!).toBe(true);
	let desc;
	while (object && (desc = Object.getOwnPropertyDescriptor(object, property_name)) === undefined) {
		object = Object.getPrototypeOf(object);
	}
	expect(desc).not.toBe(undefined);
	if (Object.prototype.hasOwnProperty.call(desc, 'value')) {
		expect(desc!.writable).toBe(false);
	} else if (
		Object.prototype.hasOwnProperty.call(desc, 'get') ||
		Object.prototype.hasOwnProperty.call(desc, 'set')
	) {
		expect(desc!.set).toBe(undefined);
	} else {
		expect.unreachable(
			'Object.getOwnPropertyDescriptor must return a fully populated property descriptor',
		);
	}
}
