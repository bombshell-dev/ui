// Adapted from the WPT files in sourceFiles at b719612f963a05ece9c89a7dd7598c1c59618874.
// Copyright © web-platform-tests contributors. BSD-3-Clause; see ../../../../test/wpt/LICENSE.
import type { CompatibilityContext, DOMFixture } from '../../context.ts';
import type { DOMFeaturePath } from '../../features.ts';
import {
	invalidSelectors,
	validSelectors,
	scopedSelectors,
	TEST_QSA,
	TEST_MATCH,
	type Selector,
} from './data.ts';
import * as content from './fixtures.ts';

export const sourceFiles = [
	'dom/nodes/selectors.js',
	'dom/nodes/ParentNode-querySelector-All.js',
	'dom/nodes/ParentNode-querySelector-All.html',
	'dom/nodes/ParentNode-querySelector-All-xht.xht',
	'dom/nodes/ParentNode-querySelector-All-content.html',
	'dom/nodes/ParentNode-querySelector-All-content.xht',
	'dom/nodes/Element-matches.js',
	'dom/nodes/Element-matches-init.js',
	'dom/nodes/Element-matches.html',
] as const;

type Root = Document | Element | DocumentFragment;
type Kind = 'document' | 'detached' | 'fragment' | 'element' | 'empty';
const roots = {
	document: 'Document',
	detached: 'Detached Element',
	fragment: 'Fragment',
	element: 'In-document Element',
} as const;
const htmlNamespace = 'http://www.w3.org/1999/xhtml';
const exampleNamespace = 'http://www.example.org/ns';

/** Walk without selector queries so expected tree order is independent of the tested API. */
function elements(root: Node): Element[] {
	const result: Element[] = [];
	function visit(node: Node): void {
		if (node.nodeType === 1) result.push(node as Element);
		for (let child = node.firstChild; child; child = child.nextSibling) visit(child);
	}
	visit(root);
	return result;
}

/** The original programmatic additions to both HTML and XHTML content documents. */
function specialElements(document: Document, parent: Element): void {
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

function prepare(fixture: DOMFixture, kind: Kind): Root {
	const document = fixture.document as unknown as Document;
	const element = document.getElementById('root')!;
	specialElements(document, element);
	if (kind === 'document') return document;
	if (kind === 'empty') return document.createElement('div');
	if (kind === 'detached') return element.cloneNode(true) as Element;
	if (kind === 'fragment') {
		const fragment = document.createDocumentFragment();
		fragment.appendChild(element.cloneNode(true));
		return fragment;
	}
	// The upstream connected-element queries must exclude this indistinguishable sibling tree.
	const clone = element.cloneNode(true);
	for (const descendant of elements(clone)) descendant.setAttribute('data-clone', '');
	document.body.appendChild(clone);
	return element;
}

function insertionParent(root: Root): Node {
	return root.nodeType === 9 ? (root as Document).body : root;
}

function prepareQueryMutations(fixture: DOMFixture, root: Root): void {
	const document = fixture.document as unknown as Document;
	const connected = document.getElementById('root')!;
	// Both connected mutations precede valid queries in the upstream wrapper.
	document.body.appendChild(document.createElement('div'));
	connected.appendChild(document.createElement('div'));
	if (root !== document && root !== connected) root.appendChild(document.createElement('div'));
}

function prerequisites(kind: Kind, xml: boolean): DOMFeaturePath[] {
	return [
		'element.namespaces',
		'document.lookup',
		...(kind === 'detached' || kind === 'element' || kind === 'fragment'
			? ['node.cloning' as const]
			: []),
		...(kind === 'fragment' ? ['node.fragments' as const] : []),
		...(xml ? ['document.xml' as const] : []),
	];
}

function permitted(row: Selector, context: { kind: Kind; xml: boolean; mask: number }): boolean {
	return (
		Boolean(row.testType & context.mask) &&
		!row.exclude?.includes(context.kind) &&
		!row.exclude?.includes(context.xml ? 'xhtml' : 'html')
	);
}

/** Retains the original matrix, including API masks and HTML/XML/root exclusions. */
export function register(context: CompatibilityContext): void {
	for (const xml of [false, true]) registerQueries(context, xml);
	registerMatches(context);
}

function registerQueries(context: CompatibilityContext, xml: boolean): void {
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
				requires: prerequisites(options.kind, xml),
				document: {
					contentType: xml ? 'application/xhtml+xml' : 'text/html',
					content: xml ? content.xhtml : content.html,
					fragment: 'target',
				},
			},
		);
	}
	function syntaxError(fixture: DOMFixture, operation: () => unknown): void {
		try {
			operation();
			expect.fail('Expected SyntaxError');
		} catch (error) {
			expect(error).toBeInstanceOf(fixture.globals('DOMException'));
			expect(error).toMatchObject({ name: 'SyntaxError', code: 12 });
		}
	}
	for (const [kind, label] of Object.entries(roots) as [Exclude<Kind, 'empty'>, string][]) {
		for (const method of ['querySelector', 'querySelectorAll'] as const) {
			test({ kind, name: `${label} supports ${method}` }, (_fixture, root) =>
				expect(typeof root[method]).toBe('function'),
			);
		}
		test({ kind, name: `${label}.querySelectorAll returns NodeList instance` }, (fixture, root) => {
			expect(root.querySelectorAll('div')).toBeInstanceOf(fixture.globals('NodeList'));
		});
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
			test({ kind, name: `${label}.${method} no parameter` }, (fixture, root) => {
				expect(() => Reflect.apply(root[method], root, [])).toThrow(fixture.globals('TypeError'));
			});
		}
		test({ kind, name: `${label}.querySelectorAll tree order` }, (_fixture, root) => {
			const result = root.querySelectorAll('*');
			elements(root)
				.filter((element) => element !== root)
				.forEach((element, index) => expect(result[index]).toBe(element));
		});
		for (const variant of ['static NodeList', 'new NodeList']) {
			test({ kind, name: `${label}: ${variant}` }, (fixture, root) => {
				const before = root.querySelectorAll('div');
				const beforeLength = before.length;
				insertionParent(root).appendChild(
					(fixture.document as unknown as Document).createElement('div'),
				);
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

function registerMatches(context: CompatibilityContext): void {
	const { expect } = context.runner;
	function test(
		options: { kind: Kind; name: string },
		run: (fixture: DOMFixture, root: Root) => void,
	): void {
		context.test(
			`WPT Element-matches.html: ${options.name}`,
			(fixture) => run(fixture, prepare(fixture, options.kind)),
			{
				requires: prerequisites(options.kind, false),
				document: { contentType: 'text/html', content: content.html, fragment: 'target' },
			},
		);
	}
	for (const [kind, label] of Object.entries(roots) as [Exclude<Kind, 'empty'>, string][]) {
		const isElement = kind === 'element' || kind === 'detached';
		test(
			{ kind, name: `${label} ${isElement ? 'supports' : 'should not support'} matches` },
			(_fixture, root) => {
				expect('matches' in root).toBe(isElement);
				if (isElement) expect(Object.hasOwn(root, 'matches')).toBe(false);
			},
		);
		if (isElement)
			for (const row of invalidSelectors) {
				test({ kind, name: `${label}.matches: ${row.name}: ${row.selector}` }, (fixture, root) => {
					try {
						(root as Element).matches(row.selector);
						expect.fail('Expected SyntaxError');
					} catch (error) {
						expect(error).toBeInstanceOf(fixture.globals('DOMException'));
						expect(error).toMatchObject({ name: 'SyntaxError', code: 12 });
					}
				});
			}
	}
	for (const tag of ['div', 'null', 'undefined']) {
		for (const value of [null, undefined, 'missing'] as const) {
			const suffix = value === 'missing' ? ' no parameter' : `(${String(value)})`;
			test(
				{ kind: 'document', name: `${tag.toUpperCase()} Element.matches${suffix}` },
				(fixture, root) => {
					const element =
						tag === 'div'
							? (root as Document).getElementById('root')!
							: (root as Document).createElement(tag);
					if (value === 'missing')
						expect(() => Reflect.apply(element.matches, element, [])).toThrow(
							fixture.globals('TypeError'),
						);
					else expect(Reflect.apply(element.matches, element, [value])).toBe(tag === String(value));
				},
			);
		}
	}
	for (const [kind, label] of [
		['document', 'In-document'],
		['detached', 'Detached'],
		['fragment', 'Fragment'],
	] as const) {
		const rows = kind === 'document' ? [...validSelectors, ...scopedSelectors] : validSelectors;
		for (const row of rows) {
			if (!permitted(row, { kind, xml: false, mask: TEST_MATCH })) continue;
			const reference = row.ctx ? 'refNode Element' : 'no refNodes';
			test(
				{
					kind,
					name: `${label} Element.matches: ${row.name} (with ${reference}): ${row.selector}`,
				},
				(_fixture, root) => {
					for (const [ids, expected] of [
						[row.expect, true],
						[row.unexpected ?? [], false],
					] as const) {
						for (const id of ids) {
							const element = root.querySelector(`#${id}`)!;
							const args = row.ctx ? [row.selector, root.querySelector(row.ctx)] : [row.selector];
							expect(Reflect.apply(element.matches, element, args), `#${id}: ${row.selector}`).toBe(
								expected,
							);
						}
					}
				},
			);
		}
	}
}
