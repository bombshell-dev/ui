import type { CompatibilityContext, DOMFixture } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	function title(source: string, name: string): string {
		return `WPT ${source}: ${name}`;
	}
	function mount({ document, connect }: DOMFixture, markup: string): HTMLElement {
		const container = document.createElement('main');
		container.innerHTML = markup;
		connect(container);
		return container;
	}

	const { expect } = context.runner;

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
		({ DOMParser }) => {
			const doc = new DOMParser().parseFromString(
				'<svg><defs></defs><g id="g"></g></svg>',
				'image/svg+xml',
			);
			const svg = doc.documentElement;
			const g = svg.children[1]!;
			const result = svg.querySelectorAll('g');
			expect(Array.from(result), ':scope descend match descendants').toEqual([g]);
		},
	);
	context.test(
		title(
			'ParentNode-querySelector-All-scope.html',
			'querySelectorAll with :scope in document where element moved',
		),
		({ DOMParser }) => {
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
	);
}
