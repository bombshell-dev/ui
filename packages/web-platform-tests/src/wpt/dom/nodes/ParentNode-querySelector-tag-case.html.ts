import type { CompatibilityContext, DOMFixture } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	function html({ document, connect }: DOMFixture, markup: string): Document {
		const container = document.createElement('div');
		container.innerHTML = markup;
		for (const child of Array.from(container.children)) connect(child);
		return document;
	}
	const tagCaseMarkup = `
<div id="container">
  <div class="box">
    <p id="p1">Paragraph 1</p>
    <p id="p2">Paragraph 2</p>
  </div>
</div>
<div id="container-for-3750"></div>`;

	const { expect } = context.runner;

	context.test(
		'WPT ParentNode-querySelector-tag-case.html: The same element should be found with both lowercase and uppercase div selectors',
		(fixture) => {
			const document = html(fixture, tagCaseMarkup);
			const box = document.getElementById('container')!.firstElementChild;
			const lower = document.querySelector('div.box'),
				upper = document.querySelector('DIV.box');
			expect(lower).not.toBeNull();
			expect(upper).not.toBeNull();
			expect(lower).toBe(upper);
			expect(lower).toBe(box);
		},
	);
	context.test(
		'WPT ParentNode-querySelector-tag-case.html: The same paragraph should be found with both lowercase and uppercase p selectors',
		(fixture) => {
			const document = html(fixture, tagCaseMarkup);
			const lower = document.querySelector('#container p#p1'),
				upper = document.querySelector('#container P#p1');
			expect(lower).not.toBeNull();
			expect(upper).not.toBeNull();
			expect(lower).toBe(upper);
			expect(lower).toBe(document.getElementById('p1'));
		},
	);
	context.test(
		'WPT ParentNode-querySelector-tag-case.html: The same NodeList should be returned for querySelectorAll with lowercase and uppercase p selectors',
		(fixture) => {
			const document = html(fixture, tagCaseMarkup);
			const lower = Array.from(document.querySelectorAll('div.box p')),
				upper = Array.from(document.querySelectorAll('div.box P'));
			expect(lower).toEqual(upper);
			expect(lower).toEqual([document.getElementById('p1'), document.getElementById('p2')]);
		},
	);
	context.test(
		'WPT ParentNode-querySelector-tag-case.html: Mixed case selectors should work correctly',
		(fixture) => {
			const document = html(fixture, tagCaseMarkup);
			expect(document.querySelectorAll('DIV.box p').length).toBe(2);
			const mixed = document.querySelector('div#container DIV.box P#p2');
			expect(mixed).not.toBeNull();
			expect(mixed!.id).toBe('p2');
		},
	);
	context.test(
		'WPT ParentNode-querySelector-tag-case.html: Tag name case-insensitivity with child combinator (>) dynamically created',
		({ document }) => {
			const div = document.createElement('div'),
				ul = document.createElement('ul'),
				li = document.createElement('li');
			ul.appendChild(li);
			div.appendChild(ul);
			expect(Array.from(div.querySelectorAll('ul'))).toEqual([ul]);
			expect(Array.from(div.querySelectorAll('UL'))).toEqual([ul]);
			expect(Array.from(div.querySelectorAll('ul > li'))).toEqual([li]);
			expect(Array.from(div.querySelectorAll('UL > LI'))).toEqual([li]);
		},
	);
	context.test(
		'WPT ParentNode-querySelector-tag-case.html: Case-insensitivity with non-standard tag names',
		(fixture) => {
			const document = html(fixture, tagCaseMarkup);
			const container = document.getElementById('container-for-3750')!;
			const custom = document.createElement('myElement');
			custom.textContent = 'Hello world';
			container.appendChild(custom);
			expect(container.querySelector('myelement')).toBe(custom);
			expect(container.querySelector('myElement')).toBe(custom);
		},
	);
}
