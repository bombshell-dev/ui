// Adapted from the WPT files listed in sourceFiles at b719612f963a05ece9c89a7dd7598c1c59618874.
// Copyright © web-platform-tests contributors. BSD-3-Clause; see ../../../../test/wpt/LICENSE.txt.
// No individual authors are declared in these source files.
import type { CompatibilityContext, DOMFixture } from '../../context.ts';
import type { DOMElement as DOMElementContract } from '../../contracts/nodes.ts';

export const sourceFiles = [
	'dom/nodes/DocumentFragment-querySelectorAll-after-modification.html',
	'dom/nodes/Element-querySelectorAll-context-element.html',
	'dom/nodes/ParentNode-querySelector-All-comma-selector.html',
	'dom/nodes/ParentNode-querySelector-All-scope.html',
	'dom/nodes/ParentNode-querySelector-argument-stringification.html',
	'dom/nodes/ParentNode-querySelector-attribute-change.html',
	'dom/nodes/ParentNode-querySelector-class-change.html',
	'dom/nodes/ParentNode-querySelector-dupe-id.html',
	'dom/nodes/ParentNode-querySelector-innerHTML.html',
	'dom/nodes/ParentNode-querySelector-orphan-scope.html',
	'dom/nodes/ParentNode-querySelector-parent-context.html',
	'dom/nodes/ParentNode-querySelector-scope-in-not.html',
	'dom/nodes/ParentNode-querySelector-scope.html',
	'dom/nodes/ParentNode-querySelector-host-pseudo-class.html',
	'dom/nodes/ParentNode-querySelector-shadowroot-nth-child.html',
	'dom/nodes/ParentNode-querySelectorAll-removed-elements.html',
	'dom/nodes/ParentNode-querySelectorAll-scope-change.html',
	'dom/nodes/ParentNode-querySelectorAll-scope-colon-id-class.html',
	'dom/nodes/ParentNode-querySelectors-exclusive.html',
] as const;

function title(source: string, name: string): string {
	return `WPT ${source}: ${name}`;
}

function mount(fixture: DOMFixture, markup: string): HTMLElement {
	const document = fixture.document as unknown as Document;
	const container = document.createElement('main');
	container.innerHTML = markup;
	fixture.connect(container as unknown as DOMElementContract);
	return container;
}

/** Registers every case in the listed pinned WPT selector files. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		title(
			'DocumentFragment-querySelectorAll-after-modification.html',
			'querySelectorAll should still work on DocumentFragments after they are modified',
		),
		(fixture) => {
			const document = fixture.document as unknown as Document;
			const frag = document.createDocumentFragment();
			frag.appendChild(document.createElement('div'));
			expect(Array.from(frag.querySelectorAll('img')), 'before modification').toEqual([]);
			frag.appendChild(document.createElement('div'));
			expect(Array.from(frag.querySelectorAll('img')), 'after modification').toEqual([]);
		},
		['node.fragments'],
	);

	for (const [name, selector, fromDocument] of [
		['Query from document', '.root table tbody tr', true],
		['Query without root class', 'table tbody tr', false],
		['Query with root class', '.root table tbody tr', false],
	] as const) {
		context.test(title('Element-querySelectorAll-context-element.html', name), (fixture) => {
			const document = fixture.document as unknown as Document;
			const container = mount(
				fixture,
				'<div id="test-container"><div class="root" id="root"><table><tbody><tr id="row"></tr></tbody></table></div></div>',
			);
			const root = container.firstElementChild!.firstElementChild!;
			const target = root.firstElementChild!.firstElementChild!.firstElementChild!;
			expect(Array.from((fromDocument ? document : root).querySelectorAll(selector))).toEqual([
				target,
			]);
		});
	}

	context.test(
		title('ParentNode-querySelector-All-comma-selector.html', 'Basic comma-separated selector'),
		(fixture) => {
			const document = fixture.document as unknown as Document;
			mount(fixture, '<h1>Hello world</h1><h2>Goodbye, world</h2>');
			expect(document.querySelectorAll('h1,h2').length).toBe(2);
		},
	);
	context.test(
		title(
			'ParentNode-querySelector-All-comma-selector.html',
			'Repeated identical querySelectorAll calls with repeated selectors should work on empty elements',
		),
		(fixture) => {
			const document = fixture.document as unknown as Document;
			const el = document.createElement('div');
			const selector = '.foo, .foo, .bar';
			const results1 = el.querySelectorAll(selector);
			expect(results1.length).toBe(0);
			const results2 = el.querySelectorAll(selector);
			expect(results2.length).toBe(0);
		},
	);

	const scopeMarkup =
		'<div><p><span>hello</span></p><p id="p2">hey</p><div id="d2">div</div></div>' +
		'<div id="structure1"><div><span id="descendant-span"></span></div></div>' +
		'<ul id="structure2"><li id="alpha">Alpha</li><li id="beta">Beta<ul><li id="gamma">Gamma</li><li id="delta">Delta</li></ul></li></ul>';
	for (const name of [
		'querySelector',
		'querySelectorAll',
		'querySelector comma separated',
		'querySelectorAll comma separated',
	]) {
		context.test(title('ParentNode-querySelector-All-scope.html', name), (fixture) => {
			const container = mount(fixture, scopeMarkup);
			const div = container.firstElementChild!;
			const [p, p2, div2] = Array.from(div.children);
			if (name === 'querySelector') {
				expect(div.querySelector(':scope > p')).toBe(p);
				expect(div.querySelector(':scope > span')).toBeNull();
			} else if (name === 'querySelectorAll') {
				expect(Array.from(div.querySelectorAll(':scope > p'))).toEqual([p, p2]);
				expect(Array.from(div.querySelectorAll(':scope > span'))).toEqual([]);
			} else if (name === 'querySelector comma separated') {
				expect(div.querySelector(':scope > p, :scope > div')).toBe(p);
			} else {
				expect(Array.from(div.querySelectorAll(':scope > p, :scope > div'))).toEqual([p, p2, div2]);
			}
		});
	}
	context.test(
		title(
			'ParentNode-querySelector-All-scope.html',
			'querySelector with :scope > child should not match descendants',
		),
		(fixture) => {
			const scopeDiv = mount(fixture, scopeMarkup).children[1]!;
			const result = scopeDiv.querySelector(':scope > span');
			expect(result, ':scope > span should not match descendant span').toBeNull();
		},
	);
	context.test(
		title(
			'ParentNode-querySelector-All-scope.html',
			'querySelectorAll with :scope > child should only match direct children',
		),
		(fixture) => {
			const ul = mount(fixture, scopeMarkup).children[2]!;
			const result = ul.querySelectorAll(':scope > li');
			const resultIDs = Array.from(result, (el) => el.id);
			expect(resultIDs, ':scope > li should only match direct children').toEqual(['alpha', 'beta']);
		},
	);
	context.test(
		title(
			'ParentNode-querySelector-All-scope.html',
			'querySelectorAll with :scope in unattached svg document',
		),
		(fixture) => {
			const DOMParser = fixture.globals('DOMParser') as typeof globalThis.DOMParser;
			const doc = new DOMParser().parseFromString(
				'<svg><defs></defs><g id="g"></g></svg>',
				'image/svg+xml',
			);
			const svg = doc.documentElement;
			const g = svg.children[1]!;
			const result = svg.querySelectorAll('g');
			expect(Array.from(result), ':scope descend match descendants').toEqual([g]);
		},
		['document.parsing', 'document.xml'],
	);
	context.test(
		title(
			'ParentNode-querySelector-All-scope.html',
			'querySelectorAll with :scope in document where element moved',
		),
		(fixture) => {
			const DOMParser = fixture.globals('DOMParser') as typeof globalThis.DOMParser;
			const xml = '<bar><bar id="theBar"><child-bars/></bar><child-bars id="theChildBar"/></bar>';
			const doc = new DOMParser().parseFromString(xml, 'text/xml');
			const theBar = doc.documentElement.children[0]!;
			const childBar = doc.documentElement.children[1]!;
			const bars = Array.from(doc.querySelectorAll('bar'));
			for (const bar of bars) {
				if (!bar.parentElement) continue;
				bar.parentElement.querySelector(':scope > child-bars')!.appendChild(bar);
			}
			expect(theBar.parentNode === childBar).toBe(true);
		},
		['document.parsing', 'document.xml', 'node.append'],
	);

	for (const name of [
		'querySelector stringifies Array argument via toString()',
		'querySelectorAll stringifies Array argument via toString()',
		'querySelector stringifies object with custom toString()',
	]) {
		context.test(
			title('ParentNode-querySelector-argument-stringification.html', name),
			(fixture) => {
				const container = mount(
					fixture,
					'<div id="container"><strong>bold</strong><em>italic 1</em><em>italic 2</em><p>paragraph</p></div>',
				).firstElementChild!;
				if (name.startsWith('querySelectorAll')) {
					const results = container.querySelectorAll(['strong', 'em'] as unknown as string);
					expect(
						results.length,
						"Array.toString() produces 'strong,em' matching both element types",
					).toBe(3);
				} else if (name.includes('Array')) {
					const result = container.querySelector(['strong'] as unknown as string);
					expect(result!.textContent).toBe('bold');
				} else {
					const result = container.querySelector({
						toString() {
							return 'p';
						},
					} as unknown as string);
					expect(result!.textContent).toBe('paragraph');
				}
			},
		);
	}

	const attributeMarkup =
		'<div id="id"><span id="id-span-1"></span><span></span></div>' +
		'<div id="class"><span id="class-span-1" class="foo"></span><span id="class-span-2"></span></div>' +
		'<div id="hidden"><span id="hidden-span-1" hidden></span><span id="hidden-span-2"></span></div>' +
		'<div id="style"><span id="style-span-1" style="display:inline-block;"></span><span id="style-span-2"></span></div>' +
		'<div id="readonly"><input id="readonly-input-1" readonly><input id="readonly-input-2"></div>' +
		'<div id="width"><img id="width-img-1" width="200"><img id="width-img-2"></div>' +
		'<div id="height"><img id="height-img-1" height="200"><img id="height-img-2"></div>';
	for (const [index, attribute] of [
		'id',
		'class',
		'hidden',
		'style',
		'readonly',
		'width',
		'height',
	].entries()) {
		context.test(
			title('ParentNode-querySelector-attribute-change.html', `${attribute} attribute`),
			(fixture) => {
				const div = mount(fixture, attributeMarkup).children[index]!;
				const node1 = div.firstElementChild!,
					node2 = div.lastElementChild!;
				expect(div.querySelector(`[${attribute}]`), 'initial').toBe(node1);
				expect(div.querySelector(`:not([${attribute}])`), 'initial not').toBe(node2);
				node1.removeAttribute(attribute);
				expect(div.querySelector(`[${attribute}]`), 'change attribute').toBeNull();
				expect(div.querySelector(`:not([${attribute}])`), 'change attribute not').toBe(node1);
			},
		);
	}

	for (const [name, selector, isSVG, nextClass] of [
		['svg simple class', '.a', true, 'b'],
		['svg compound class', 'g.a', true, 'b'],
		['svg complex class', 'svg g.a', true, 'b'],
		['html simple class', '.one', false, 'b'],
		['html compound class', 'span.one', false, 'two'],
		['html complex class', 'div span.one', false, 'two'],
	] as const) {
		context.test(
			title('ParentNode-querySelector-class-change.html', name),
			(fixture) => {
				const document = fixture.document as unknown as Document;
				const container = mount(
					fixture,
					'<svg id="svg"><g id="g" class="a" /></svg><div id="div"><span id="span" class="one"></span></div>',
				);
				const node = container.children[isSVG ? 0 : 1]!.firstElementChild!;
				fixture.cleanup(() => {
					if (isSVG) node.setAttributeNS(null, 'class', 'a');
					else node.setAttribute('class', 'one');
				});
				expect(document.querySelector(selector), 'initial').toBe(node);
				if (isSVG) node.setAttributeNS(null, 'class', nextClass);
				else node.setAttribute('class', nextClass);
				expect(
					document.querySelector(selector),
					name === 'html simple class' ? 'querySelectorchange class' : 'change class',
				).toBeNull();
			},
			isSVG ? ['parsing.namespaces', 'element.namespaces'] : [],
		);
	}

	for (const connected of [false, true]) {
		context.test(
			title(
				'ParentNode-querySelector-dupe-id.html',
				connected
					? 'Returns a non-null value for connected cloned node with duplicated ID'
					: 'Sanity: returns a non-null value',
			),
			(fixture) => {
				const DOMParser = fixture.globals('DOMParser') as typeof globalThis.DOMParser;
				const html = '<html><div id="test1"><div id="test2"></div></div></html>';
				const doc = new DOMParser().parseFromString(html, 'text/html');
				const root = doc.documentElement;
				const test1 = doc.body.firstElementChild!;
				const test1Clone = test1.cloneNode(true) as Element;
				const expected = test1Clone.firstElementChild!;
				if (connected) root.appendChild(test1Clone);
				const test2 = test1Clone.querySelector('#test2');
				expect(test2).not.toBeNull();
				expect(test2).toBe(expected);
				expect(
					test1Clone.querySelector('[id=test2]'),
					'ID selector and attribute selector points to the same node',
				).toBe(expected);
				if (!connected)
					expect(
						test1Clone.querySelectorAll('#test2')[0],
						'querySelector and querySelectorAll[0] points to the same node',
					).toBe(expected);
			},
			['document.parsing', 'node.cloning'],
		);
	}

	context.test(
		title(
			'ParentNode-querySelector-innerHTML.html',
			'querySelector matches nodes inserted by innerHTML',
		),
		(fixture) => {
			const document = fixture.document as unknown as Document;
			const div = document.createElement('div');
			expect(div.innerHTML, 'initial').toBe('');
			div.innerHTML = '<div id="inner-div"><span id="inner-span"></span></div>';
			const expectedDiv = div.firstElementChild!,
				expectedSpan = expectedDiv.firstElementChild!;
			expect(div.querySelector('div'), 'inner div').toBe(expectedDiv);
			expect(div.querySelector('span'), 'inner span').toBe(expectedSpan);
		},
	);

	for (const self of [true, false]) {
		context.test(
			title(
				'ParentNode-querySelector-orphan-scope.html',
				self
					? 'querySelectorAll on orphaned element does not return the element itself'
					: 'querySelectorAll descendant selector works on orphaned elements',
			),
			(fixture) => {
				const document = fixture.document as unknown as Document;
				const parent = document.createElement('div');
				parent.id = 'fuz';
				const child = document.createElement('span');
				child.id = 'buz';
				parent.appendChild(child);
				if (self)
					expect(
						parent.querySelectorAll('#fuz').length,
						'should not return the base element itself',
					).toBe(0);
				else {
					const results = parent.querySelectorAll('#fuz #buz');
					expect(results.length).toBe(1);
					expect(results[0]).toBe(child);
				}
			},
		);
	}

	context.test(
		title(
			'ParentNode-querySelector-parent-context.html',
			'querySelector with ancestor context in selector',
		),
		(fixture) => {
			const container = mount(fixture, '<div id="container"></div>').firstElementChild!;
			container.innerHTML = '<div><section><span></span></section></div>';
			const section = container.firstElementChild!.firstElementChild!;
			const expectedSpan = section.firstElementChild!;
			expect(section.querySelector('div section span')).toBe(expectedSpan);
		},
	);

	context.test(
		title(
			'ParentNode-querySelector-scope-in-not.html',
			':scope nested in :not should select one element per [data-main] scope',
		),
		(fixture) => {
			const document = fixture.document as unknown as Document;
			mount(
				fixture,
				'<div id="fixture"><div data-main><div data-item><div data-side><div data-main><div data-item><div data-side></div></div></div></div></div></div></div>',
			);
			const mainAttribute = 'data-main',
				itemAttribute = 'data-item',
				sideAttribute = 'data-side';
			const result = [];
			const foundElements = document.querySelectorAll(`[${mainAttribute}]`);
			for (const element of foundElements) result.push(element);
			for (const element of result) {
				const selector = `:scope [${sideAttribute}]:not(:scope [${itemAttribute}] [${itemAttribute}] [${sideAttribute}])`;
				const results = element.querySelectorAll(selector);
				expect(results.length).toBe(1);
			}
		},
	);

	for (const name of [
		'querySelector with :scope',
		'querySelector with id and sibling',
		'querySelectorAll with :scope',
		'querySelectorAll with id and sibling',
	]) {
		context.test(title('ParentNode-querySelector-scope.html', name), (fixture) => {
			const div = mount(
				fixture,
				'<div><h1 id="test"></h1><p><span>hello</span></p></div>',
			).firstElementChild!;
			const p = div.children[1]!;
			if (name === 'querySelector with :scope') {
				expect(div.querySelector(':scope > p')).toBe(p);
				expect(div.querySelector(':scope > span')).toBeNull();
			} else if (name === 'querySelector with id and sibling') {
				expect(div.querySelector('#test + p')).toBe(p);
				expect(p.querySelector('#test + p')).toBeNull();
			} else if (name === 'querySelectorAll with :scope') {
				expect(Array.from(div.querySelectorAll(':scope > p'))).toEqual([p]);
				expect(Array.from(div.querySelectorAll(':scope > span'))).toEqual([]);
			} else {
				expect(Array.from(div.querySelectorAll('#test + p'))).toEqual([p]);
				expect(Array.from(p.querySelectorAll('#test + p'))).toEqual([]);
			}
		});
	}

	context.test(
		title(
			'ParentNode-querySelector-host-pseudo-class.html',
			'Using :host pseudo-class selector in shadow DOM',
		),
		(fixture) => {
			const document = fixture.document as unknown as Document;
			const section = document.createElement('section');
			section.id = 'test-container';
			fixture.connect(section as unknown as DOMElementContract);
			const article = document.createElement('article');
			const shadowSection = section.attachShadow({ mode: 'open' });
			shadowSection.appendChild(article);
			const normalQuery = shadowSection.querySelector('article');
			expect(normalQuery, 'Simple querySelector for article should find the element').toBe(article);
			const hostQuery = shadowSection.querySelector(':host > article');
			expect(hostQuery, 'querySelector with :host pseudo-class should find the element').toBe(
				article,
			);
		},
		['shadow.roots.attachment'],
	);

	context.test(
		title(
			'ParentNode-querySelector-shadowroot-nth-child.html',
			'div:nth-child(2) should select #first when preceded by a style inside shadow root',
		),
		(fixture) => {
			const container = mount(
				fixture,
				'<style id="zero"></style><div id="shadowRootContainer"></div><div id="first"><button>hello</button></div>',
			);
			const hostElement = container.children[1]!;
			const shadowRoot = hostElement.attachShadow({ mode: 'open' });
			shadowRoot.innerHTML =
				'<style id="zero"></style><div id="first"><button>hello</button></div><div id="second"></div><nav id="third"></nav>';
			const el = shadowRoot.querySelector('div:nth-child(2)');
			expect(el!.id).toBe('first');
		},
		['shadow.roots.attachment'],
	);

	context.test(
		title(
			'ParentNode-querySelectorAll-removed-elements.html',
			'querySelectorAll must not return removed elements',
		),
		(fixture) => {
			const container = mount(fixture, '<div id="container"></div>').firstElementChild!;
			const getIDs = (): string[] => [...container.querySelectorAll('a.test')].map((el) => el.id);
			container.innerHTML = '<a id="link-a" class="test">a link</a>';
			expect(getIDs(), 'Sanity check: initial setup').toEqual(['link-a']);
			container.innerHTML = '<a id="link-b" class="test"><img src="foo.jpg"></a>';
			expect(getIDs(), 'After replacement').toEqual(['link-b']);
			container.innerHTML = '<a id="link-a" class="test">a link</a>';
			expect(getIDs(), 'After changing back to the original HTML').toEqual(['link-a']);
		},
	);

	context.test(
		title('ParentNode-querySelectorAll-scope-change.html', 'Change the scope of querySelectorAll'),
		(fixture) => {
			const DOMParser = fixture.globals('DOMParser') as typeof globalThis.DOMParser;
			const data =
				'<plist><dict><key id="target1">PayloadType</key><string>Configuration</string><key>PayloadContent</key><array><dict><key id="target2">FullScreen</key><true/></dict></array></dict></plist>';
			const xmlDocument = new DOMParser().parseFromString(data, 'application/xml');
			const expectedRoot = xmlDocument.documentElement.firstElementChild!;
			const expectedTarget1 = expectedRoot.children[0]!;
			const expectedTarget2 = expectedRoot.children[3]!.children[0]!.children[0]!;
			const rootCollection = xmlDocument.querySelector(':root > dict')!;
			const keysInRootCollection = rootCollection.querySelectorAll(':scope > key');
			expect(keysInRootCollection.item(0), 'first item').toBe(expectedTarget1);
			const subCollection = rootCollection.children[3]!.children[0]!;
			const keysInSubCollection = subCollection.querySelectorAll(':scope > key');
			const clonedSubCollection = subCollection.cloneNode(true) as Element;
			const keysInClonedSubCollection = clonedSubCollection.querySelectorAll(':scope > key');
			expect(subCollection.outerHTML, 'outerHTML').toBe(clonedSubCollection.outerHTML);
			expect(keysInSubCollection.length, 'length').toBe(keysInClonedSubCollection.length);
			expect(keysInSubCollection.item(0), 'second item').toBe(expectedTarget2);
		},
		['document.parsing', 'document.xml', 'node.cloning', 'parsing.serialization'],
	);

	context.test(
		title(
			'ParentNode-querySelectorAll-scope-colon-id-class.html',
			':scope child selector on element with colon-prefixed class',
		),
		(fixture) => {
			const container = mount(
				fixture,
				'<div class="sm:block" id="parentDiv"><span id="targetSpan"></span></div><div id=":r3:"></div>',
			);
			const div = container.firstElementChild!;
			const expectedSpan = div.firstElementChild!;
			const result = div.querySelectorAll(':scope > span');
			expect(Array.from(result)).toEqual([expectedSpan]);
		},
	);
	context.test(
		title(
			'ParentNode-querySelectorAll-scope-colon-id-class.html',
			':scope selector on element with colon-prefixed ID',
		),
		(fixture) => {
			const container = mount(
				fixture,
				'<div class="sm:block" id="parentDiv"><span id="targetSpan"></span></div><div id=":r3:"></div>',
			);
			const div = container.children[1]!;
			const result = div.querySelector(':scope');
			expect(result).toBeNull();
		},
	);

	context.test(
		title(
			'ParentNode-querySelectors-exclusive.html',
			'querySelector/querySelectorAll should not include their thisArg',
		),
		(fixture) => {
			const document = fixture.document as unknown as Document;
			const button = document.createElement('button');
			for (const stage of ['before modification', 'after modification']) {
				if (stage === 'after modification') button.innerHTML = 'text';
				for (const selector of ['*', 'button', 'button, span']) {
					expect(
						button.querySelector(selector),
						`querySelector, '${selector}', ${stage}`,
					).toBeNull();
				}
				for (const selector of ['*', 'button', 'button, span']) {
					expect(
						Array.from(button.querySelectorAll(selector)),
						`querySelectorAll, '${selector}', ${stage}`,
					).toEqual([]);
				}
			}
		},
	);
}
