import type { CompatibilityContext, DOMFixture } from '../../../shared/context.ts';
import {
	prepare,
	prepareQueryMutations,
	permitted,
	roots,
	type Root,
	type Kind,
} from '../../../shared/selectors.ts';
import { invalidSelectors, validSelectors, TEST_QSA } from './selectors.js.ts';
import { html } from './ParentNode-querySelector-All-content.html.ts';
import { xhtml } from './ParentNode-querySelector-All-content.xht.ts';

const htmlNamespace = 'http://www.w3.org/1999/xhtml';
const exampleNamespace = 'http://www.example.org/ns';

/** Walk without selector queries so expected tree order is independent of the tested API. */
export function elements(root: Node): Element[] {
	const result: Element[] = [];
	function visit(node: Node): void {
		if (node.nodeType === 1) result.push(node as Element);
		for (let child = node.firstChild; child; child = child.nextSibling) visit(child);
	}
	visit(root);
	return result;
}

/** The original programmatic additions to both HTML and XHTML content documents. */
export function specialElements(document: Document, parent: Element): void {
	parent.appendChild(document.createElement('null'));
	parent.appendChild(document.createElement('undefined'));
	for (const prefix of ['any-namespace', 'no-namespace']) {
		const container = document.createElement('div');
		container.id = prefix;
		const children = [
			document.createElement('div'),
			document.createElementNS(htmlNamespace, 'div'),
			document.createElementNS('', 'div'),
			document.createElementNS(exampleNamespace, 'div'),
		];
		children.forEach((child, index) => {
			child.setAttribute('id', `${prefix}-div${index + 1}`);
			container.appendChild(child);
		});
		parent.appendChild(container);
	}
	document.getElementById('attr-presence-i1')!.setAttributeNS(exampleNamespace, 'title', '');
}

function insertionParent(root: Root): Node {
	return root.nodeType === 9 ? (root as Document).body : root;
}

/** Retains the original matrix, including API masks and HTML/XML/root exclusions. */

export function registerQueries(context: CompatibilityContext, xml: boolean): void {
	const { expect } = context.runner;
	const source = xml ? 'ParentNode-querySelector-All-xht.xht' : 'ParentNode-querySelector-All.html';
	function test(
		options: { kind: Kind; name: string },
		run: (fixture: DOMFixture, root: Root) => void,
	): void {
		context.test(
			`WPT ${source}: ${options.name}`,
			(fixture) => run(fixture, prepare(fixture, options.kind)),
			{
				document: {
					contentType: xml ? 'application/xhtml+xml' : 'text/html',
					content: xml ? xhtml : html,
					fragment: 'target',
				},
			},
		);
	}
	function syntaxError({ DOMException }: DOMFixture, operation: () => unknown): void {
		try {
			operation();
			expect.fail('Expected SyntaxError');
		} catch (error) {
			expect(error).toBeInstanceOf(DOMException);
			expect(error).toMatchObject({ name: 'SyntaxError', code: 12 });
		}
	}
	for (const [kind, label] of Object.entries(roots) as [Exclude<Kind, 'empty'>, string][]) {
		for (const method of ['querySelector', 'querySelectorAll'] as const) {
			test({ kind, name: `${label} supports ${method}` }, (_fixture, root) =>
				expect(typeof root[method]).toBe('function'),
			);
		}
		test(
			{ kind, name: `${label}.querySelectorAll returns NodeList instance` },
			({ NodeList }, root) => {
				expect(root.querySelectorAll('div')).toBeInstanceOf(NodeList);
			},
		);
		for (const method of ['querySelectorAll', 'querySelector'] as const) {
			for (const value of [null, undefined]) {
				test({ kind, name: `${label}.${method} ${String(value)}` }, (_fixture, root) => {
					const result = Reflect.apply(root[method], root, [value]);
					if (method === 'querySelectorAll') expect(result.length).toBe(1);
					else {
						if (value === null) expect(result).not.toBeNull();
						else expect(result).not.toBeUndefined();
						expect(result.tagName.toUpperCase()).toBe(String(value).toUpperCase());
					}
				});
			}
			test({ kind, name: `${label}.${method} no parameter` }, ({ TypeError }, root) => {
				expect(() => Reflect.apply(root[method], root, [])).toThrow(TypeError);
			});
		}
		test({ kind, name: `${label}.querySelectorAll tree order` }, (_fixture, root) => {
			const result = root.querySelectorAll('*');
			elements(root)
				.filter((element) => element !== root)
				.forEach((element, index) => expect(result[index]).toBe(element));
		});
		for (const variant of ['static NodeList', 'new NodeList']) {
			test({ kind, name: `${label}: ${variant}` }, ({ document }, root) => {
				const before = root.querySelectorAll('div');
				const beforeLength = before.length;
				insertionParent(root).appendChild(document.createElement('div'));
				if (variant === 'static NodeList') expect(before.length).toBe(beforeLength);
				else expect(root.querySelectorAll('div').length).toBe(beforeLength + 1);
			});
		}
		for (const row of validSelectors) {
			if (!permitted(row, { kind, xml, mask: TEST_QSA })) continue;
			for (const method of ['querySelectorAll', 'querySelector'] as const) {
				test(
					{ kind, name: `${label}.${method}: ${row.name}: ${row.selector}` },
					(fixture, root) => {
						// verifyStaticList precedes valid queries in WPT; preserve that mutation in each fresh case.
						prepareQueryMutations(fixture, root);
						const all = root.querySelectorAll(row.selector);
						if (method === 'querySelectorAll') {
							expect(all).not.toBeNull();
							expect(all.length).toBe(row.expect.length);
							row.expect.forEach((id, index) => {
								expect(all[index]).not.toBeNull();
								expect(all[index]!.getAttribute('id')).toBe(id);
								expect(all[index]!.hasAttribute('data-clone')).toBe(false);
							});
						} else {
							const found = root.querySelector(row.selector);
							if (row.expect.length) {
								expect(found).not.toBeNull();
								expect(found!.getAttribute('id')).toBe(row.expect[0]);
								expect(found).toBe(all[0]);
								expect(found!.hasAttribute('data-clone')).toBe(false);
							} else expect(found).toBeNull();
						}
					},
				);
			}
		}
	}
	for (const [kind, label] of Object.entries({ ...roots, empty: 'Empty Element' }) as [
		Kind,
		string,
	][]) {
		for (const row of invalidSelectors) {
			for (const method of ['querySelector', 'querySelectorAll'] as const) {
				test({ kind, name: `${label}.${method}: ${row.name}: ${row.selector}` }, (fixture, root) =>
					syntaxError(fixture, () =>
						method === 'querySelector'
							? root.querySelector(row.selector)
							: root.querySelectorAll(row.selector),
					),
				);
			}
		}
	}
}
