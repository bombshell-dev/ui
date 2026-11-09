import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	{
		const { expect } = context.runner;
		function createTree(document: Document) {
			const parent = document.createElement('div');
			parent.id = 'parent';
			const child = parent.appendChild(document.createElement('div'));
			child.id = 'child';
			const grandchild = child.appendChild(document.createElement('div'));
			grandchild.id = 'grandchild';
			return { parent, child, grandchild };
		}
		function createElement(document: Document, id: string) {
			const element = document.createElement('span');
			element.id = id;
			return element;
		}
		function summarize(records: MutationRecord[]) {
			return records.map(({ type, target, addedNodes, removedNodes, attributeName }) => {
				let summary = `${type} ${(target as Element).id}`;
				for (const node of addedNodes) {
					summary += ` +${(node as Element).id}`;
				}
				for (const node of removedNodes) {
					summary += ` -${(node as Element).id}`;
				}
				if (attributeName !== null) {
					summary += ` ${attributeName}`;
				}
				return summary;
			});
		}
		function nextTask() {
			return new Promise<void>((resolve) => setTimeout(resolve, 0));
		}
		context.test(
			'Mutations in a removed subtree are observed until mutation observers are notified',
			({ document, MutationObserver }) => {
				const { parent, child } = createTree(document);
				const observer = new MutationObserver(() => {});
				observer.observe(parent, { childList: true, subtree: true });

				child.remove();
				child.append(createElement(document, 'added'));

				{
					const actual = summarize(observer.takeRecords());
					const expected = ['childList parent -child', 'childList child +added'];
					expect(actual.length).toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(actual[index]).toBe(expected[index]);
				}
			},
		);
		context.test(
			'Attribute mutations in a removed subtree are observed until mutation observers are notified',
			({ document, MutationObserver }) => {
				const { parent, child } = createTree(document);
				const observer = new MutationObserver(() => {});
				observer.observe(parent, { attributes: true, subtree: true });

				child.remove();
				child.setAttribute('data-test', '');

				{
					const actual = summarize(observer.takeRecords());
					const expected = ['attributes child data-test'];
					expect(actual.length).toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(actual[index]).toBe(expected[index]);
				}
			},
		);
		context.test(
			'Mutations in a subtree removed by replaceChildren() are observed until mutation observers are notified',
			({ document, MutationObserver }) => {
				const { parent, child } = createTree(document);
				const observer = new MutationObserver(() => {});
				observer.observe(parent, { childList: true, subtree: true });

				parent.replaceChildren();
				child.append(createElement(document, 'added'));

				{
					const actual = summarize(observer.takeRecords());
					const expected = ['childList parent -child', 'childList child +added'];
					expect(actual.length).toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(actual[index]).toBe(expected[index]);
				}
			},
		);
		context.test(
			'takeRecords() does not stop observing a removed subtree',
			({ document, MutationObserver }) => {
				const { parent, child } = createTree(document);
				const observer = new MutationObserver(() => {});
				observer.observe(parent, { childList: true, subtree: true });

				child.remove();
				{
					const actual = summarize(observer.takeRecords());
					const expected = ['childList parent -child'];
					expect(actual.length).toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(actual[index]).toBe(expected[index]);
				}

				child.append(createElement(document, 'added'));
				{
					const actual = summarize(observer.takeRecords());
					const expected = ['childList child +added'];
					expect(actual.length).toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(actual[index]).toBe(expected[index]);
				}
			},
		);
		context.test(
			'A removed subtree is no longer observed after mutation observers are notified',
			async ({ document, MutationObserver }) => {
				const { parent, child } = createTree(document);
				const delivered: string[] = [];
				const observer = new MutationObserver((records) => delivered.push(...summarize(records)));
				observer.observe(parent, { childList: true, subtree: true });

				// This microtask is queued before the mutation observer microtask and therefore runs first.
				Promise.resolve().then(() => child.append(createElement(document, 'before')));
				child.remove();
				await nextTask();
				{
					const actual = delivered;
					const expected = ['childList parent -child', 'childList child +before'];
					expect(actual.length).toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(actual[index]).toBe(expected[index]);
				}

				child.append(createElement(document, 'after'));
				{
					const actual = summarize(observer.takeRecords());
					const expected: never[] = [];
					expect(actual.length).toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(actual[index]).toBe(expected[index]);
				}
			},
		);
		context.test(
			'A removed subtree is no longer observed after mutation observers are notified, even if no record was queued',
			async ({ document, MutationObserver, step }) => {
				const { parent, child } = createTree(document);
				const observer = new MutationObserver(step(() => expect.unreachable('callback invoked')));
				observer.observe(parent, { attributes: true, subtree: true });

				// This does not queue a record as observer does not observe childList mutations.
				child.remove();
				await nextTask();

				child.setAttribute('data-test', '');
				{
					const actual = summarize(observer.takeRecords());
					const expected: never[] = [];
					expect(actual.length).toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(actual[index]).toBe(expected[index]);
				}
			},
		);
		context.test(
			'A removed subtree is no longer observed after mutation observers are notified, even if the callback was not invoked',
			async ({ document, MutationObserver, step }) => {
				const { parent, child } = createTree(document);
				const observer = new MutationObserver(step(() => expect.unreachable('callback invoked')));
				observer.observe(parent, { childList: true, subtree: true });

				child.remove();
				{
					const actual = summarize(observer.takeRecords());
					const expected = ['childList parent -child'];
					expect(actual.length).toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(actual[index]).toBe(expected[index]);
				}
				await nextTask();

				child.append(createElement(document, 'added'));
				{
					const actual = summarize(observer.takeRecords());
					const expected: never[] = [];
					expect(actual.length).toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(actual[index]).toBe(expected[index]);
				}
			},
		);
		context.test(
			'A subtree removed from a removed subtree is no longer observed after mutation observers are notified',
			async ({ document, MutationObserver }) => {
				const { parent, child, grandchild } = createTree(document);
				const observer = new MutationObserver(() => {});
				observer.observe(parent, { childList: true, subtree: true });

				child.remove();
				// grandchild is removed from a subtree that is itself only observed because it was removed.
				grandchild.remove();
				grandchild.append(createElement(document, 'before'));
				{
					const actual = summarize(observer.takeRecords());
					const expected = [
						'childList parent -child',
						'childList child -grandchild',
						'childList grandchild +before',
					];
					expect(actual.length).toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(actual[index]).toBe(expected[index]);
				}
				await nextTask();

				grandchild.append(createElement(document, 'after'));
				{
					const actual = summarize(observer.takeRecords());
					const expected: never[] = [];
					expect(actual.length).toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(actual[index]).toBe(expected[index]);
				}
			},
		);
		context.test(
			'Removing a node from an observed subtree queues the mutation observer microtask',
			async ({ document, MutationObserver }) => {
				const { parent, child } = createTree(document);
				const order: string[] = [];
				const observer = new MutationObserver(() => order.push('observer'));
				observer.observe(parent, { attributes: true, subtree: true });

				// This queues no record, as observer does not observe childList mutations.
				child.remove();
				Promise.resolve().then(() => order.push('promise'));
				child.setAttribute('data-test', '');
				await nextTask();

				{
					const actual = order;
					const expected = ['observer', 'promise'];
					expect(actual.length).toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(actual[index]).toBe(expected[index]);
				}
			},
		);
		context.test(
			'observe() stops observing a removed subtree through the target, but not through other targets',
			({ document, MutationObserver }) => {
				const { parent, child, grandchild } = createTree(document);
				const observer = new MutationObserver(() => {});
				observer.observe(parent, { childList: true, subtree: true });
				observer.observe(child, { attributes: true, subtree: true });

				// grandchild remains observed through both parent and child.
				grandchild.remove();
				// This stops observing grandchild through child, but not through parent.
				observer.observe(child, { attributes: true, subtree: true });
				grandchild.append(createElement(document, 'added'));
				grandchild.setAttribute('data-test', '');

				{
					const actual = summarize(observer.takeRecords());
					const expected = ['childList child -grandchild', 'childList grandchild +added'];
					expect(actual.length).toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(actual[index]).toBe(expected[index]);
				}
			},
		);
		context.test(
			'observe() stops observing subtrees removed from a removed subtree',
			({ document, MutationObserver }) => {
				const { parent, child, grandchild } = createTree(document);
				const observer = new MutationObserver(() => {});
				observer.observe(parent, { childList: true, subtree: true });

				child.remove();
				// grandchild is removed from a subtree that is itself only observed because it was removed.
				grandchild.remove();
				observer.observe(parent, { childList: true, subtree: true });
				child.append(createElement(document, 'added-to-child'));
				grandchild.append(createElement(document, 'added-to-grandchild'));

				{
					const actual = summarize(observer.takeRecords());
					const expected = ['childList parent -child', 'childList child -grandchild'];
					expect(actual.length).toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(actual[index]).toBe(expected[index]);
				}
			},
		);
		context.test(
			'observe() on a node in a removed subtree keeps observing it after mutation observers are notified',
			async ({ document, MutationObserver }) => {
				const { parent, child } = createTree(document);
				const observer = new MutationObserver(() => {});
				observer.observe(parent, { childList: true, subtree: true });

				child.remove();
				observer.observe(child, { attributes: true });
				await nextTask();

				child.append(createElement(document, 'added'));
				child.setAttribute('data-test', '');
				{
					const actual = summarize(observer.takeRecords());
					const expected = ['attributes child data-test'];
					expect(actual.length).toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(actual[index]).toBe(expected[index]);
				}
			},
		);
	}
	{
		const { expect } = context.runner;
		function createTree(document: Document) {
			const parent = document.createElement('div');
			parent.id = 'parent';
			const child = parent.appendChild(document.createElement('div'));
			child.id = 'child';
			const grandchild = child.appendChild(document.createElement('div'));
			grandchild.id = 'grandchild';
			return { parent, child, grandchild };
		}
		function createElement(document: Document, id: string) {
			const element = document.createElement('span');
			element.id = id;
			return element;
		}
		function summarize(records: MutationRecord[]) {
			return records.map(({ type, target, addedNodes, removedNodes, attributeName }) => {
				let summary = `${type} ${(target as Element).id}`;
				for (const node of addedNodes) {
					summary += ` +${(node as Element).id}`;
				}
				for (const node of removedNodes) {
					summary += ` -${(node as Element).id}`;
				}
				if (attributeName !== null) {
					summary += ` ${attributeName}`;
				}
				return summary;
			});
		}
		context.test(
			'disconnect() stops observing a removed subtree',
			({ document, MutationObserver }) => {
				const { parent, child } = createTree(document);
				const observer = new MutationObserver(() => {});
				observer.observe(parent, { childList: true, subtree: true });

				child.remove();
				observer.disconnect();
				child.append(createElement(document, 'added'));

				{
					const actual = summarize(observer.takeRecords());
					const expected: never[] = [];
					expect(actual.length).toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(actual[index]).toBe(expected[index]);
				}
			},
		);
		context.test(
			'disconnect() stops observing a subtree removed from a removed subtree',
			({ document, MutationObserver }) => {
				const { parent, child, grandchild } = createTree(document);
				const observer = new MutationObserver(() => {});
				observer.observe(parent, { childList: true, subtree: true });

				child.remove();
				grandchild.remove();
				observer.disconnect();
				child.append(createElement(document, 'added-to-child'));
				grandchild.append(createElement(document, 'added-to-grandchild'));

				{
					const actual = summarize(observer.takeRecords());
					const expected: never[] = [];
					expect(actual.length).toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(actual[index]).toBe(expected[index]);
				}
			},
		);
		context.test(
			'disconnect() does not affect another observer observing a removed subtree',
			({ document, MutationObserver }) => {
				const { parent, child } = createTree(document);
				const observer = new MutationObserver(() => {});
				const otherObserver = new MutationObserver(() => {});
				observer.observe(parent, { childList: true, subtree: true });
				otherObserver.observe(parent, { childList: true, subtree: true });

				child.remove();
				observer.disconnect();
				child.append(createElement(document, 'added'));

				{
					const actual = summarize(observer.takeRecords());
					const expected: never[] = [];
					expect(actual.length).toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(actual[index]).toBe(expected[index]);
				}
				{
					const actual = summarize(otherObserver.takeRecords());
					const expected = ['childList parent -child', 'childList child +added'];
					expect(actual.length).toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(actual[index]).toBe(expected[index]);
				}
			},
		);
	}
}
