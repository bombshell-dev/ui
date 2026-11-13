import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	const options = {
		document: {
			contentType: 'text/html' as const,
			content: `<!doctype html>
<meta charset=utf-8>
<link rel=help href=https://dom.spec.whatwg.org/#interface-htmlcollection>

<div id=log></div>

<!-- with no attribute -->
<span></span>

<!-- with \`id\` attribute -->
<span id=''></span>
<span id='some-id'></span>
<span id='some-id'></span><!-- to ensure no duplicates -->

<!-- with \`name\` attribute -->
<span name=''></span>
<span name='some-name'></span>
<span name='some-name'></span><!-- to ensure no duplicates -->

<!-- with \`name\` and \`id\` attribute -->
<span id='another-id' name='another-name'></span>`,
		},
	};

	// Preserve resources/testharness.js assert_array_equals, including index ownership.
	function arrayEquals(actual: unknown, expected: readonly unknown[]): void {
		expect(typeof actual === 'object' && actual !== null && 'length' in actual).toBe(true);
		const array = actual as ArrayLike<unknown>;
		expect(array.length).toBe(expected.length);
		for (let i = 0; i < array.length; i++) {
			expect(array.hasOwnProperty(i)).toBe(expected.hasOwnProperty(i));
			expect(array[i]).toBe(expected[i]);
		}
	}

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
		'Object.getOwnPropertyNames on HTMLCollection',
		({ document }) => {
			const elements = document.getElementsByTagName('span');
			arrayEquals(Object.getOwnPropertyNames(elements), [
				'0',
				'1',
				'2',
				'3',
				'4',
				'5',
				'6',
				'7',
				'some-id',
				'some-name',
				'another-id',
				'another-name',
			]);
		},
		options,
	);

	context.test(
		'Object.getOwnPropertyNames on HTMLCollection with non-HTML namespace',
		({ document, cleanup }) => {
			const elem = document.createElementNS('some-random-namespace', 'foo');
			cleanup(() => {
				elem.remove();
			});
			elem.setAttribute('name', 'some-name');
			document.body.appendChild(elem);

			const elements = document.getElementsByTagName('foo');
			arrayEquals(Object.getOwnPropertyNames(elements), ['0']);
		},
		options,
	);

	context.test(
		'Object.getOwnPropertyNames on HTMLCollection with expando object',
		({ document, cleanup }) => {
			const elem = document.createElement('foo');
			cleanup(() => {
				elem.remove();
			});
			document.body.appendChild(elem);

			const elements = document.getElementsByTagName('foo');
			// Function preserves upstream's sloppy assignments and deletes inside this strict module.
			Function('elements', 'elements.someProperty = "some value";')(elements);

			arrayEquals(Object.getOwnPropertyNames(elements), ['0', 'someProperty']);
		},
		options,
	);

	context.test(
		'Trying to set an expando that would shadow an already-existing named property',
		({ document }) => {
			const elements = document.getElementsByTagName(
				'span',
			) as unknown as HTMLCollectionOf<Element> & Record<string, unknown>;
			const oldItem = elements['some-id'];
			const oldDesc = Object.getOwnPropertyDescriptor(elements, 'some-id')!;
			expect(oldDesc.value).toBe(oldItem);
			expect(oldDesc.enumerable).toBe(false);
			expect(oldDesc.configurable).toBe(true);
			expect(oldDesc.writable).toBe(false);

			Function('elements', 'elements["some-id"] = 5;')(elements);
			expect(elements['some-id']).toBe(oldItem);
			throwsTypeError(() => {
				elements['some-id'] = 5;
			});
			throwsTypeError(() => {
				Object.defineProperty(elements, 'some-id', { value: 5 });
			});

			Function('elements', 'delete elements["some-id"];')(elements);
			expect(elements['some-id']).toBe(oldItem);

			throwsTypeError(() => {
				delete elements['some-id'];
			});
			expect(elements['some-id']).toBe(oldItem);
		},
		options,
	);

	context.test(
		'Trying to set an expando that shadows a named property that gets added later',
		({ document, cleanup }) => {
			const elements = document.getElementsByTagName(
				'span',
			) as unknown as HTMLCollectionOf<Element> & Record<string, unknown>;
			const oldItem = elements['new-id'];
			const oldDesc = Object.getOwnPropertyDescriptor(elements, 'new-id');
			expect(oldItem).toBe(undefined);
			expect(oldDesc).toBe(undefined);

			Function('elements', 'elements["new-id"] = 5;')(elements);
			expect(elements['new-id']).toBe(5);

			const span = document.createElement('span');
			cleanup(() => {
				span.remove();
			});
			span.id = 'new-id';
			document.body.appendChild(span);

			expect(elements.namedItem('new-id')).toBe(span);
			expect(elements['new-id']).toBe(5);

			Function('elements', 'delete elements["new-id"];')(elements);
			expect(elements['new-id']).toBe(span);
		},
		options,
	);

	context.test(
		'Trying to set a non-configurable expando that shadows a named property that gets added later',
		({ document, cleanup }) => {
			const elements = document.getElementsByTagName(
				'span',
			) as unknown as HTMLCollectionOf<Element> & Record<string, unknown>;
			const oldItem = elements['new-id2'];
			const oldDesc = Object.getOwnPropertyDescriptor(elements, 'new-id2');
			expect(oldItem).toBe(undefined);
			expect(oldDesc).toBe(undefined);

			Object.defineProperty(elements, 'new-id2', {
				configurable: false,
				writable: false,
				value: 5,
			});
			expect(elements['new-id2']).toBe(5);

			const span = document.createElement('span');
			cleanup(() => {
				span.remove();
			});
			span.id = 'new-id2';
			document.body.appendChild(span);

			expect(elements.namedItem('new-id2')).toBe(span);
			expect(elements['new-id2']).toBe(5);

			Function('elements', 'delete elements["new-id2"];')(elements);
			expect(elements['new-id2']).toBe(5);

			throwsTypeError(() => {
				delete elements['new-id2'];
			});
			expect(elements['new-id2']).toBe(5);
		},
		options,
	);
}
