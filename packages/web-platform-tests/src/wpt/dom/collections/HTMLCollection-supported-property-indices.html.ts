import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	const options = {
		document: {
			contentType: 'text/html' as const,
			content: `<!doctype html>
<meta charset=utf-8>
<title></title>
<!-- We want to use a tag name that will not interact with our test harness,
     so just make one up.  "foo" is a good one -->

<!-- Ids that look like negative indices.  These should come first, so we can
     assert that lookups for nonnegative indices find these by index -->
<foo id="-2"></foo>
<foo id="-1"></foo>

<!-- Ids that look like nonnegative indices -->
<foo id="0"></foo>
<foo id="1"></foo>

<!-- Ids that look like nonnegative indices near 2^31 = 2147483648 -->
<foo id="2147483645"></foo> <!-- 2^31 - 3 -->
<foo id="2147483646"></foo> <!-- 2^31 - 2 -->
<foo id="2147483647"></foo> <!-- 2^31 - 1 -->
<foo id="2147483648"></foo> <!-- 2^31 -->
<foo id="2147483649"></foo> <!-- 2^31 + 1 -->

<!-- Ids that look like nonnegative indices near 2^32 = 4294967296 -->
<foo id="4294967293"></foo> <!-- 2^32 - 3 -->
<foo id="4294967294"></foo> <!-- 2^32 - 2 -->
<foo id="4294967295"></foo> <!-- 2^32 - 1 -->
<foo id="4294967296"></foo> <!-- 2^32 -->
<foo id="4294967297"></foo> <!-- 2^32 + 1 -->`,
		},
	};

	function throwsTypeError(action: () => void): void {
		let exception: unknown;
		try {
			action();
		} catch (error) {
			exception = error;
		}
		// Preserve assert_throws_js's object, constructor, and name checks. These
		// assignments, deletes, and Object.defineProperty calls run in this module's realm.
		expect(typeof exception).toBe('object');
		expect(exception).not.toBe(null);
		expect((exception as Error).constructor).toBe(globalThis.TypeError);
		expect((exception as Error).name).toBe(globalThis.TypeError.name);
	}

	context.test(
		'Handling of property names that look like negative integers',
		({ document }) => {
			const collection = document.getElementsByTagName('foo');
			expect(collection.item(-2)).toBe(null);
			expect(collection.item(-1)).toBe(null);
			expect(collection.namedItem(-2 as unknown as string)).toBe(document.getElementById('-2'));
			expect(collection.namedItem(-1 as unknown as string)).toBe(document.getElementById('-1'));
			expect(collection[-2]).toBe(document.getElementById('-2'));
			expect(collection[-1]).toBe(document.getElementById('-1'));
		},
		options,
	);

	context.test(
		'Handling of property names that look like small nonnegative integers',
		({ document }) => {
			const collection = document.getElementsByTagName('foo');
			expect(collection.item(0)).toBe(document.getElementById('-2'));
			expect(collection.item(1)).toBe(document.getElementById('-1'));
			expect(collection.namedItem(0 as unknown as string)).toBe(document.getElementById('0'));
			expect(collection.namedItem(1 as unknown as string)).toBe(document.getElementById('1'));
			expect(collection[0]).toBe(document.getElementById('-2'));
			expect(collection[1]).toBe(document.getElementById('-1'));
		},
		options,
	);

	context.test(
		'Handling of property names that look like integers around 2^31',
		({ document }) => {
			const collection = document.getElementsByTagName('foo');
			expect(collection.item(2147483645)).toBe(null);
			expect(collection.item(2147483646)).toBe(null);
			expect(collection.item(2147483647)).toBe(null);
			expect(collection.item(2147483648)).toBe(null);
			expect(collection.item(2147483649)).toBe(null);
			expect(collection.namedItem(2147483645 as unknown as string)).toBe(
				document.getElementById('2147483645'),
			);
			expect(collection.namedItem(2147483646 as unknown as string)).toBe(
				document.getElementById('2147483646'),
			);
			expect(collection.namedItem(2147483647 as unknown as string)).toBe(
				document.getElementById('2147483647'),
			);
			expect(collection.namedItem(2147483648 as unknown as string)).toBe(
				document.getElementById('2147483648'),
			);
			expect(collection.namedItem(2147483649 as unknown as string)).toBe(
				document.getElementById('2147483649'),
			);
			expect(collection[2147483645]).toBe(undefined);
			expect(collection[2147483646]).toBe(undefined);
			expect(collection[2147483647]).toBe(undefined);
			expect(collection[2147483648]).toBe(undefined);
			expect(collection[2147483649]).toBe(undefined);
		},
		options,
	);

	context.test(
		'Handling of property names that look like integers around 2^32',
		({ document }) => {
			const collection = document.getElementsByTagName('foo');
			expect(collection.item(4294967293)).toBe(null);
			expect(collection.item(4294967294)).toBe(null);
			expect(collection.item(4294967295)).toBe(null);
			expect(collection.item(4294967296)).toBe(document.getElementById('-2'));
			expect(collection.item(4294967297)).toBe(document.getElementById('-1'));
			expect(collection.namedItem(4294967293 as unknown as string)).toBe(
				document.getElementById('4294967293'),
			);
			expect(collection.namedItem(4294967294 as unknown as string)).toBe(
				document.getElementById('4294967294'),
			);
			expect(collection.namedItem(4294967295 as unknown as string)).toBe(
				document.getElementById('4294967295'),
			);
			expect(collection.namedItem(4294967296 as unknown as string)).toBe(
				document.getElementById('4294967296'),
			);
			expect(collection.namedItem(4294967297 as unknown as string)).toBe(
				document.getElementById('4294967297'),
			);
			expect(collection[4294967293]).toBe(undefined);
			expect(collection[4294967294]).toBe(undefined);
			expect(collection[4294967295]).toBe(document.getElementById('4294967295'));
			expect(collection[4294967296]).toBe(document.getElementById('4294967296'));
			expect(collection[4294967297]).toBe(document.getElementById('4294967297'));
		},
		options,
	);

	context.test(
		'Trying to set an expando that would shadow an already-existing indexed property',
		({ document }) => {
			const elements = document.getElementsByTagName('foo');
			const oldItem = elements[0];
			const oldDesc = Object.getOwnPropertyDescriptor(elements, 0)!;
			expect(oldDesc.value).toBe(oldItem);
			expect(oldDesc.enumerable).toBe(true);
			expect(oldDesc.configurable).toBe(true);
			expect(oldDesc.writable).toBe(false);

			// Function preserves upstream's sloppy assignments and deletes inside this strict module.
			Function('elements', 'elements[0] = 5;')(elements);
			expect(elements[0]).toBe(oldItem);
			throwsTypeError(() => {
				(elements as unknown as Record<number, number>)[0] = 5;
			});
			throwsTypeError(() => {
				Object.defineProperty(elements, 0, { value: 5 });
			});

			Function('elements', 'delete elements[0];')(elements);
			expect(elements[0]).toBe(oldItem);

			throwsTypeError(() => {
				delete elements[0];
			});
			expect(elements[0]).toBe(oldItem);
		},
		options,
	);

	context.test(
		'Trying to set an expando with an indexed property name past the end of the list',
		({ document }) => {
			const elements = document.getElementsByTagName('foo');
			const idx = elements.length;
			const oldItem = elements[idx];
			const oldDesc = Object.getOwnPropertyDescriptor(elements, idx);
			expect(oldItem).toBe(undefined);
			expect(oldDesc).toBe(undefined);

			// [[DefineOwnProperty]] will disallow defining an indexed expando.
			Function('elements', 'idx', 'elements[idx] = 5;')(elements, idx);
			expect(elements[idx]).toBe(undefined);
			throwsTypeError(() => {
				(elements as unknown as Record<number, number>)[idx] = 5;
			});
			throwsTypeError(() => {
				Object.defineProperty(elements, idx, { value: 5 });
			});

			// Check that deletions out of range do not throw.
			Function('elements', 'idx', 'delete elements[idx];')(elements, idx);
			(function () {
				delete elements[idx];
			})();
		},
		options,
	);

	context.test(
		'Trying to delete an indexed property name should never work',
		({ document, HTMLCollection, cleanup }) => {
			const elements = document.getElementsByTagName('foo');
			const oldItem = elements[0];
			const oldDesc = Object.getOwnPropertyDescriptor(elements, 0)!;
			expect(oldDesc.value).toBe(oldItem);
			expect(oldDesc.enumerable).toBe(true);
			expect(oldDesc.configurable).toBe(true);
			expect(oldDesc.writable).toBe(false);

			// Use Object.prototype from the collection's realm, including browser iframe fixtures.
			const prototype = Object.getPrototypeOf(HTMLCollection.prototype) as Record<number, unknown>;
			prototype[0] = 5;
			cleanup(() => {
				delete prototype[0];
			});
			expect(elements[0]).toBe(oldItem);

			Function('elements', 'delete elements[0];')(elements);
			expect(elements[0]).toBe(oldItem);

			throwsTypeError(() => {
				delete elements[0];
			});
			expect(elements[0]).toBe(oldItem);
		},
		options,
	);
}
