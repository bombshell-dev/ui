import type { CompatibilityContext, CompatibilityTestOptions } from '../../../shared/context.ts';

// Each compatibility case recreates the upstream context and element in its own document.
export function testGetElementsByTagName(
	context: CompatibilityContext,
	{
		setup,
		...options
	}: CompatibilityTestOptions & {
		setup(document: Document): { root: Document | Element; element: Element };
	},
): void {
	const { expect } = context.runner;

	// Preserve resources/testharness.js assert_array_equals, including index ownership.
	function arrayEquals(
		actual: unknown,
		{ expected, message }: { expected: readonly unknown[]; message?: string },
	): void {
		expect(typeof actual === 'object' && actual !== null && 'length' in actual, message).toBe(true);
		const array = actual as ArrayLike<unknown>;
		expect(array.length, message).toBe(expected.length);
		for (let i = 0; i < array.length; i++) {
			expect(array.hasOwnProperty(i), message).toBe(expected.hasOwnProperty(i));
			expect(array[i], message).toBe(expected[i]);
		}
	}

	context.test(
		'Interfaces',
		({ document, NodeList, HTMLCollection }) => {
			const { root } = setup(document);
			expect(
				root.getElementsByTagName('html') instanceof NodeList,
				'Should not return a NodeList',
			).toBe(false);
			expect(
				root.getElementsByTagName('html') instanceof HTMLCollection,
				'Should return an HTMLCollection',
			).toBe(true);
		},
		options,
	);

	context.test(
		'Caching is allowed',
		({ document }) => {
			const { root } = setup(document);
			const firstCollection = root.getElementsByTagName('html');
			const secondCollection = root.getElementsByTagName('html');
			// oxlint-disable-next-line oxc/const-comparisons -- Upstream explicitly allows either caching result.
			expect(firstCollection !== secondCollection || firstCollection === secondCollection).toBe(
				true,
			);
		},
		options,
	);

	context.test(
		"Shouldn't be able to set unsigned properties on a HTMLCollection (non-strict mode)",
		({ document }) => {
			const { root } = setup(document);
			const l = root.getElementsByTagName('nosuchtag');
			// ES modules are strict; Function preserves the upstream non-strict assignment.
			Function('l', 'l[5] = "foopy";')(l);
			expect(l[5]).toBe(undefined);
			expect(l.item(5)).toBe(null);
		},
		options,
	);

	context.test(
		"Shouldn't be able to set unsigned properties on a HTMLCollection (strict mode)",
		({ document }) => {
			const { root } = setup(document);
			const l = root.getElementsByTagName('nosuchtag');
			// Strict assignment creates the TypeError in this module's realm, not the fixture's.
			let exception: unknown;
			try {
				(l as unknown as { [index: number]: string })[5] = 'foopy';
			} catch (error) {
				exception = error;
			}
			// Upstream assert_throws_js requires an object with this exact constructor and name.
			expect(typeof exception).toBe('object');
			expect(exception).not.toBe(null);
			expect((exception as Error).constructor).toBe(globalThis.TypeError);
			expect((exception as Error).name).toBe(globalThis.TypeError.name);
			expect(l[5]).toBe(undefined);
			expect(l.item(5)).toBe(null);
		},
		options,
	);

	context.test(
		'Should be able to set expando shadowing a proto prop (item)',
		({ document, HTMLCollection }) => {
			const { root } = setup(document);
			const l = root.getElementsByTagName('nosuchtag');
			const fn = l.item;
			expect(fn).toBe(HTMLCollection.prototype.item);
			(l as unknown as { item: string }).item = 'pass';
			expect(l.item).toBe('pass');
			expect(HTMLCollection.prototype.item).toBe(fn);
		},
		options,
	);

	context.test(
		'Should be able to set expando shadowing a proto prop (namedItem)',
		({ document, HTMLCollection }) => {
			const { root } = setup(document);
			const l = root.getElementsByTagName('nosuchtag');
			const fn = l.namedItem;
			expect(fn).toBe(HTMLCollection.prototype.namedItem);
			(l as unknown as { namedItem: string }).namedItem = 'pass';
			expect(l.namedItem).toBe('pass');
			expect(HTMLCollection.prototype.namedItem).toBe(fn);
		},
		options,
	);

	context.test(
		'hasOwnProperty, getOwnPropertyDescriptor, getOwnPropertyNames',
		({ document, cleanup }) => {
			const { root, element } = setup(document);
			const t1 = element.appendChild(document.createElement('pre'));
			t1.id = 'x';
			const t2 = element.appendChild(document.createElement('pre'));
			t2.setAttribute('name', 'y');
			const t3 = element.appendChild(document.createElementNS('', 'pre'));
			t3.setAttribute('id', 'z');
			const t4 = element.appendChild(document.createElementNS('', 'pre'));
			t4.setAttribute('name', 'w');
			cleanup(() => {
				element.removeChild(t1);
				element.removeChild(t2);
				element.removeChild(t3);
				element.removeChild(t4);
			});

			const list = root.getElementsByTagName('pre') as unknown as HTMLCollectionOf<Element> &
				Record<string, unknown>;
			const pre = list[0]!;
			expect(pre.id).toBe('x');

			const exposedNames: Record<string, number> = { x: 0, y: 1, z: 2 };
			for (const exposedName in exposedNames) {
				expect(list[exposedName]).toBe(list[exposedNames[exposedName]!]);
				expect(list[exposedName]).toBe(list.namedItem(exposedName));
				expect(exposedName in list, "'" + exposedName + "' in list").toBe(true);
				expect(list.hasOwnProperty(exposedName), "list.hasOwnProperty('" + exposedName + "')").toBe(
					true,
				);
			}

			const unexposedNames = ['w'];
			for (const unexposedName of unexposedNames) {
				expect(unexposedName in list).toBe(false);
				expect(list.hasOwnProperty(unexposedName)).toBe(false);
				expect(list[unexposedName]).toBe(undefined);
				expect(list.namedItem(unexposedName)).toBe(null);
			}

			// oxlint-disable-next-line unicorn/no-array-sort -- Preserve upstream's sort of its fresh property-name snapshot.
			arrayEquals(Object.getOwnPropertyNames(list).sort(), {
				expected: ['0', '1', '2', '3', 'x', 'y', 'z'],
			});

			let desc = Object.getOwnPropertyDescriptor(list, '0');
			expect(typeof desc, 'descriptor should be an object').toBe('object');
			expect(desc!.enumerable, 'desc.enumerable').toBe(true);
			expect(desc!.configurable, 'desc.configurable').toBe(true);

			desc = Object.getOwnPropertyDescriptor(list, 'x');
			expect(typeof desc, 'descriptor should be an object').toBe('object');
			expect(desc!.enumerable, 'desc.enumerable').toBe(false);
			expect(desc!.configurable, 'desc.configurable').toBe(true);
		},
		options,
	);

	context.test(
		'HTML element with uppercase tagName never matches in HTML Documents',
		({ document, cleanup }) => {
			const { root, element } = setup(document);
			expect(document.createElementNS('http://www.w3.org/1999/xhtml', 'i').localName).toBe('i'); // Sanity
			const t = element.appendChild(document.createElementNS('http://www.w3.org/1999/xhtml', 'I'));
			cleanup(() => {
				element.removeChild(t);
			});
			expect(t.localName).toBe('I');
			expect(t.tagName).toBe('I');
			expect(root.getElementsByTagName('I').length).toBe(0);
			expect(root.getElementsByTagName('i').length).toBe(0);
		},
		options,
	);

	context.test(
		'Element in non-HTML namespace, no prefix, lowercase name',
		({ document, cleanup }) => {
			const { root, element } = setup(document);
			const t = element.appendChild(document.createElementNS('test', 'st'));
			cleanup(() => {
				element.removeChild(t);
			});
			arrayEquals(root.getElementsByTagName('st'), { expected: [t] });
			arrayEquals(root.getElementsByTagName('ST'), { expected: [] });
		},
		options,
	);

	context.test(
		'Element in non-HTML namespace, no prefix, uppercase name',
		({ document, cleanup }) => {
			const { root, element } = setup(document);
			const t = element.appendChild(document.createElementNS('test', 'ST'));
			cleanup(() => {
				element.removeChild(t);
			});
			arrayEquals(root.getElementsByTagName('ST'), { expected: [t] });
			arrayEquals(root.getElementsByTagName('st'), { expected: [] });
		},
		options,
	);

	context.test(
		'Element in non-HTML namespace, prefix, lowercase name',
		({ document, cleanup }) => {
			const { root, element } = setup(document);
			const t = element.appendChild(document.createElementNS('test', 'te:st'));
			cleanup(() => {
				element.removeChild(t);
			});
			arrayEquals(root.getElementsByTagName('st'), { expected: [] });
			arrayEquals(root.getElementsByTagName('ST'), { expected: [] });
			arrayEquals(root.getElementsByTagName('te:st'), { expected: [t] });
			arrayEquals(root.getElementsByTagName('te:ST'), { expected: [] });
		},
		options,
	);

	context.test(
		'Element in non-HTML namespace, prefix, uppercase name',
		({ document, cleanup }) => {
			const { root, element } = setup(document);
			const t = element.appendChild(document.createElementNS('test', 'te:ST'));
			cleanup(() => {
				element.removeChild(t);
			});
			arrayEquals(root.getElementsByTagName('st'), { expected: [] });
			arrayEquals(root.getElementsByTagName('ST'), { expected: [] });
			arrayEquals(root.getElementsByTagName('te:st'), { expected: [] });
			arrayEquals(root.getElementsByTagName('te:ST'), { expected: [t] });
		},
		options,
	);

	context.test(
		'Element in HTML namespace, no prefix, non-ascii characters in name',
		({ document, cleanup }) => {
			const { root, element } = setup(document);
			const t = element.appendChild(document.createElement('aÇ'));
			cleanup(() => {
				element.removeChild(t);
			});
			expect(t.localName).toBe('aÇ');
			arrayEquals(root.getElementsByTagName('AÇ'), {
				expected: [t],
				message: 'All uppercase input',
			});
			arrayEquals(root.getElementsByTagName('aÇ'), {
				expected: [t],
				message: 'Ascii lowercase input',
			});
			arrayEquals(root.getElementsByTagName('aç'), {
				expected: [],
				message: 'All lowercase input',
			});
		},
		options,
	);

	context.test(
		'Element in non-HTML namespace, non-ascii characters in name',
		({ document, cleanup }) => {
			const { root, element } = setup(document);
			const t = element.appendChild(document.createElementNS('test', 'AÇ'));
			cleanup(() => {
				element.removeChild(t);
			});
			arrayEquals(root.getElementsByTagName('AÇ'), { expected: [t] });
			arrayEquals(root.getElementsByTagName('aÇ'), { expected: [] });
			arrayEquals(root.getElementsByTagName('aç'), { expected: [] });
		},
		options,
	);

	context.test(
		'Element in HTML namespace, prefix, non-ascii characters in name',
		({ document, cleanup }) => {
			const { root, element } = setup(document);
			const t = element.appendChild(
				document.createElementNS('http://www.w3.org/1999/xhtml', 'test:aÇ'),
			);
			cleanup(() => {
				element.removeChild(t);
			});
			arrayEquals(root.getElementsByTagName('TEST:AÇ'), {
				expected: [t],
				message: 'All uppercase input',
			});
			arrayEquals(root.getElementsByTagName('test:aÇ'), {
				expected: [t],
				message: 'Ascii lowercase input',
			});
			arrayEquals(root.getElementsByTagName('test:aç'), {
				expected: [],
				message: 'All lowercase input',
			});
		},
		options,
	);

	context.test(
		'Element in non-HTML namespace, prefix, non-ascii characters in name',
		({ document, cleanup }) => {
			const { root, element } = setup(document);
			const t = element.appendChild(document.createElementNS('test', 'TEST:AÇ'));
			cleanup(() => {
				element.removeChild(t);
			});
			arrayEquals(root.getElementsByTagName('TEST:AÇ'), {
				expected: [t],
				message: 'All uppercase input',
			});
			arrayEquals(root.getElementsByTagName('test:aÇ'), {
				expected: [],
				message: 'Ascii lowercase input',
			});
			arrayEquals(root.getElementsByTagName('test:aç'), {
				expected: [],
				message: 'All lowercase input',
			});
		},
		options,
	);

	context.test(
		"getElementsByTagName('*')",
		({ document }) => {
			const { root } = setup(document);
			const actual = root.getElementsByTagName('*');
			const expected: Node[] = [];
			const getElements = function (node: Node): void {
				for (let i = 0; i < node.childNodes.length; i++) {
					const child = node.childNodes[i]!;
					if (child.nodeType === child.ELEMENT_NODE) {
						expected.push(child);
						getElements(child);
					}
				}
			};
			getElements(root);
			arrayEquals(actual, { expected });
		},
		options,
	);

	context.test(
		'getElementsByTagName() should be a live collection',
		({ document, HTMLCollection, cleanup }) => {
			const { root, element } = setup(document);
			const t1 = element.appendChild(document.createElement('abc'));
			cleanup(() => {
				element.removeChild(t1);
			});

			const l = root.getElementsByTagName('abc');
			expect(l instanceof HTMLCollection).toBe(true);
			expect(l.length).toBe(1);

			const t2 = element.appendChild(document.createElement('abc'));
			expect(l.length).toBe(2);

			element.removeChild(t2);
			expect(l.length).toBe(1);
		},
		options,
	);
}
