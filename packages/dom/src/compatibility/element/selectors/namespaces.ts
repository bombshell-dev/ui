// Adapted from the WPT files listed below at b719612f963a05ece9c89a7dd7598c1c59618874.
// Copyright © web-platform-tests contributors. BSD-3-Clause; see ../../../../test/wpt/LICENSE.txt.
import type { CompatibilityContext, DOMFixture } from '../../context.ts';
import type { DOMElement as DOMElementContract } from '../../contracts/nodes.ts';

export const sourceFiles = [
	'dom/nodes/Element-matches-namespaced-elements.html',
	'dom/nodes/ParentNode-querySelector-case-insensitive.html',
	'dom/nodes/ParentNode-querySelector-multiple-attributes-xml.xhtml',
	'dom/nodes/ParentNode-querySelector-namespace-tagname-attribute.html',
	'dom/nodes/ParentNode-querySelector-scope-numeric-id.xhtml',
	'dom/nodes/ParentNode-querySelector-svg-not-root.html',
	'dom/nodes/ParentNode-querySelector-tag-case.html',
	'dom/nodes/ParentNode-querySelector-underscore-local-name.xhtml',
	'dom/nodes/ParentNode-querySelector-xml-capitalization.window.js',
	'dom/nodes/ParentNode-querySelectorAll-namespace.html',
	'dom/nodes/ParentNode-querySelectorAll-svg-append.html',
	'dom/nodes/ParentNode-querySelectorAll-svg-class.html',
	'dom/nodes/ParentNode-querySelectors-namespaces.html',
	'dom/nodes/svg-template-querySelector.html',
] as const;

const xmlRequirements = ['document.xml', 'document.parsing'] as const;

function html(fixture: DOMFixture, markup: string): Document {
	const document = fixture.document as unknown as Document;
	const container = document.createElement('div');
	container.innerHTML = markup;
	for (const child of Array.from(container.children))
		fixture.connect(child as unknown as DOMElementContract);
	return document;
}

function xml(
	fixture: DOMFixture,
	options: { markup: string; type?: DOMParserSupportedType },
): Document {
	const DOMParser = fixture.globals('DOMParser') as typeof globalThis.DOMParser;
	return new DOMParser().parseFromString(options.markup, options.type ?? 'application/xml');
}

function xhtml(fixture: DOMFixture, markup: string): Document {
	return xml(fixture, {
		markup: `<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>${markup}</body></html>`,
		type: 'application/xhtml+xml',
	});
}

const propertiesMarkup = `<?xml version="1.0"?>
<cp:coreProperties
  xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xml:lang="en"
  id="target">
  <dc:title></dc:title>
</cp:coreProperties>`;

const tagCaseMarkup = `
<div id="container">
  <div class="box">
    <p id="p1">Paragraph 1</p>
    <p id="p2">Paragraph 2</p>
  </div>
</div>
<div id="container-for-3750"></div>`;

const soapMarkup = `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Header>
          <ns2:ResponseHeader xmlns:ns2="https://adwords.google.com/api/adwords/mcm/v201509" xmlns="https://adwords.google.com/api/adwords/cm/v201509">
              <requestId>1234554321</requestId>
              <serviceName>ManagedCustomerService</serviceName>
              <methodName>get</methodName>
              <operations>1</operations>
              <responseTime>115</responseTime>
          </ns2:ResponseHeader>
      </soap:Header>
      <soap:Body>
          <ns2:getResponse xmlns="https://adwords.google.com/api/adwords/cm/v201509" xmlns:ns2="https://adwords.google.com/api/adwords/mcm/v201509">
              <ns2:rval>
                  <totalNumEntries>2</totalNumEntries>
                  <Page.Type>ManagedCustomerPage</Page.Type>
                  <ns2:entries>
                      <ns2:name>Test1</ns2:name>
                      <ns2:customerId>1234566789</ns2:customerId>
                  </ns2:entries>
                  <ns2:entries>
                      <ns2:name>Test2</ns2:name>
                      <ns2:customerId>987654321</ns2:customerId>
                  </ns2:entries>
              </ns2:rval>
          </ns2:getResponse>
      </soap:Body>
  </soap:Envelope>`;

/** Registers standard-API assertions from the pinned namespace, XML, and case regressions. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	for (const method of ['matches'] as const) {
		for (const { namespace, name, selector, title } of [
			{
				namespace: '',
				name: 'element',
				selector: 'element',
				title: `empty string namespace, ${method}`,
			},
			{ namespace: 'urn:ns', name: 'h', selector: 'h', title: `has a namespace, ${method}` },
			{ namespace: 'urn:ns', name: 'h', selector: '*|h', title: `has a namespace, *|, ${method}` },
		]) {
			context.test(
				`WPT Element-matches-namespaced-elements.html: ${title}`,
				(fixture) => {
					const document = fixture.document as unknown as Document;
					const element = document.createElementNS(namespace, name);
					expect(element[method](selector)).toBe(true);
				},
				['element.namespaces'],
			);
		}
	}
	for (const method of ['querySelector', 'querySelectorAll'] as const) {
		context.test(`WPT ParentNode-querySelector-case-insensitive.html: ${method}`, (fixture) => {
			const document = html(fixture, '<input name="User" id="testInput">');
			const input = document.getElementById('testInput');
			if (method === 'querySelector')
				expect(document.querySelector('input[name*=user i]')).toBe(input);
			else expect(Array.from(document.querySelectorAll('input[name*=user i]'))).toEqual([input]);
		});
	}
	context.test(
		'WPT ParentNode-querySelector-multiple-attributes-xml.xhtml: querySelector with multiple attribute selectors in XML',
		(fixture) => {
			const document = xhtml(
				fixture,
				`<mlt>
    <tractor id="tractor0">
      <filter mlt_service="greyscale" track="0" id="targetFilter"/>
      <filter mlt_service="greyscale" track="1"/>
      <filter mlt_service="other" track="0"/>
    </tractor>
    <tractor id="tractor1">
      <filter mlt_service="greyscale" track="0"/>
    </tractor>
  </mlt>`,
			);
			const target = document.getElementById('targetFilter');
			expect(
				document.querySelector(
					'mlt > tractor[id="tractor0"] > filter[mlt_service="greyscale"][track="0"]',
				),
			).toBe(target);
		},
		xmlRequirements,
	);
	for (const { selector, title, expected } of [
		{ selector: 'coreProperties', title: 'match selector without prefix', expected: 'target' },
		{
			selector: '*|coreProperties',
			title: 'match namespace selector with universal prefix',
			expected: 'target',
		},
		{
			selector: 'cp|coreProperties',
			title: 'throws on specified namespace selector',
			expected: 'throw',
		},
		{
			selector: ':is(cp|coreProperties)',
			title: 'does not throw on specified namespace selector if forgiven',
			expected: 'null',
		},
		{
			selector: '[lang]',
			title: 'does not match attriubte selector without prefix',
			expected: 'null',
		},
		{
			selector: '[*|lang]',
			title: 'match namespace attriubte selector with universal prefix',
			expected: 'target',
		},
		{
			selector: '[xml|lang]',
			title: 'throws on specified namespace attriubte selector',
			expected: 'throw',
		},
		{
			selector: ':is([xml|lang])',
			title: 'does not throw on specified namespace attriubte selector if forgiven',
			expected: 'null',
		},
	]) {
		context.test(
			`WPT ParentNode-querySelector-namespace-tagname-attribute.html: ${title}`,
			(fixture) => {
				const document = xml(fixture, { markup: propertiesMarkup });
				if (expected === 'throw')
					expect(() => document.querySelector(selector)).toThrow(
						expect.objectContaining({ name: 'SyntaxError' }),
					);
				else
					expect(document.querySelector(selector)).toBe(
						expected === 'null' ? null : document.getElementById('target'),
					);
			},
			xmlRequirements,
		);
	}
	context.test(
		'WPT ParentNode-querySelector-scope-numeric-id.xhtml: querySelector with :scope on element with numeric ID',
		(fixture) => {
			const document = xhtml(fixture, '<div id="9a"><b id="target_b"/></div>');
			const scope = document.getElementById('9a');
			expect(scope).not.toBeNull();
			const result = scope!.querySelector(':scope > b');
			expect(result).not.toBeNull();
			expect(result!.id).toBe('target_b');
		},
		xmlRequirements,
	);
	context.test(
		'WPT ParentNode-querySelector-svg-not-root.html: svg:not(:root) in a HTML document',
		(fixture) => {
			const document = html(
				fixture,
				`<svg xmlns="http://www.w3.org/2000/svg" width="150" height="100" viewBox="0 0 3 2" id="the-svg">
  <rect width="1" height="2" x="0" fill="#008d46" />
  <rect width="1" height="2" x="1" fill="#ffffff" />
  <rect width="1" height="2" x="2" fill="#d2232c" />
</svg>`,
			);
			const svg = document.getElementById('the-svg');
			expect(svg).not.toBeNull();
			expect(document.querySelector('svg:not(:root)')).toBe(svg);
		},
		['parsing.namespaces'],
	);
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
		(fixture) => {
			const document = fixture.document as unknown as Document;
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
	context.test(
		'WPT ParentNode-querySelector-underscore-local-name.xhtml: Element local name with an underscore in querySelector',
		(fixture) => {
			const document = xhtml(fixture, '<data><_g><b>hey</b></_g></data>');
			expect(document.querySelector('data > _g > b')!.textContent).toBe('hey');
		},
		xmlRequirements,
	);
	context.test(
		'WPT ParentNode-querySelector-xml-capitalization.window.js: Descendant combinator',
		(fixture) => {
			const document = xml(fixture, { markup: '<Foo><bar>baz</bar></Foo>' });
			expect(document.querySelector('Foo')).toBe(document.documentElement);
			expect(document.querySelector('bar')).toBe(document.documentElement.firstChild);
			expect(document.querySelector('Foo bar')).toBe(document.documentElement.firstChild);
		},
		xmlRequirements,
	);
	context.test(
		'WPT ParentNode-querySelector-xml-capitalization.window.js: Descendant combinator with *',
		(fixture) => {
			const document = xml(fixture, {
				markup: `
<root>
  <aB>
    <c></c>
  </aB>
  <cd>
    <e></e>
  </cd>
</root>
`,
			});
			const c = document.documentElement.children[0]!.firstElementChild,
				e = document.documentElement.children[1]!.firstElementChild;
			expect(document.querySelector('c')).not.toBeNull();
			expect(document.querySelector('aB *')).toBe(c);
			expect(document.querySelector('e')).not.toBeNull();
			expect(document.querySelector('cd *')).toBe(e);
		},
		xmlRequirements,
	);
	context.test(
		'WPT ParentNode-querySelector-xml-capitalization.window.js: Child combinator',
		(fixture) => {
			const document = xml(fixture, {
				markup: `<elem>
    <Test>
        content
        <my-tag>abc</my-tag>
    </Test>
</elem>`,
				type: 'text/xml',
			});
			expect(document.querySelector('Test')).not.toBeNull();
			expect(document.querySelector('test')).toBeNull();
			expect(document.querySelector('my-tag')).not.toBeNull();
			expect(document.querySelector('Test>my-tag')).not.toBeNull();
		},
		xmlRequirements,
	);
	context.test(
		'WPT ParentNode-querySelectorAll-namespace.html: querySelectorAll with namespaced XML elements',
		(fixture) => {
			const document = xml(fixture, { markup: soapMarkup, type: 'text/xml' });
			expect(document.querySelectorAll('rval > entries').length).toBe(2);
		},
		xmlRequirements,
	);
	context.test(
		'WPT ParentNode-querySelectorAll-svg-append.html: Sanity check with div',
		(fixture) => {
			const document = html(fixture, '<svg></svg><div>\n  <p>foo</p>\n</div>');
			const div = document.getElementsByTagName('div')[0]!;
			expect(div.querySelectorAll('div p').length).toBe(1);
		},
		['parsing.namespaces'],
	);
	context.test(
		'WPT ParentNode-querySelectorAll-svg-append.html: Append child nodes to svg',
		(fixture) => {
			const document = html(fixture, '<svg></svg><div>\n  <p>foo</p>\n</div>');
			const svg = document.getElementsByTagName('svg')[0]!;
			const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
			svg.append(g);
			const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
			g.append(circle);
			expect(g.querySelectorAll('g circle').length).toBe(1);
			expect(g.querySelectorAll('g>circle').length).toBe(1);
			expect(g.querySelectorAll('circle').length).toBe(1);
		},
		['parsing.namespaces', 'element.namespaces'],
	);
	context.test(
		'WPT ParentNode-querySelectorAll-svg-class.html: Selecting a svg element with a class selector',
		(fixture) => {
			const document = html(fixture, '<div class="test">\n</div>\n<svg class="test">\n</svg>');
			expect(document.querySelectorAll('svg.test').length).toBe(1);
		},
		['parsing.namespaces'],
	);
	context.test(
		'WPT ParentNode-querySelectors-namespaces.html: querySelectorAll must work with namespace attribute selectors on SVG',
		(fixture) => {
			const document = html(fixture, '<svg id="thesvg" xlink:href="foo"></svg>');
			const element = document.getElementById('thesvg');
			expect(document.querySelector('[*|href]')).toBe(element);
			expect(Array.from(document.querySelectorAll('[*|href]'))).toEqual([element]);
		},
		['parsing.namespaces'],
	);
	for (const { id, selector, nested, title } of [
		{
			id: 'template1',
			selector: 'div',
			nested: false,
			title: 'querySelector works on template contents fragments with HTML elements (sanity check)',
		},
		{
			id: 'template2',
			selector: 'svg',
			nested: false,
			title: 'querySelector works on template contents fragments with SVG elements',
		},
		{
			id: 'template3',
			selector: 'svg',
			nested: true,
			title: 'querySelector works on template contents fragments with nested SVG elements',
		},
	]) {
		context.test(
			`WPT svg-template-querySelector.html: ${title}`,
			(fixture) => {
				const document = html(
					fixture,
					'<template id="template1"><div></div></template>\n<template id="template2"><svg></svg></template>\n<template id="template3"><div><svg></svg></div></template>',
				);
				const fragment = (document.getElementById(id) as HTMLTemplateElement).content;
				const scope = nested ? (fragment.firstChild as Element) : fragment;
				expect(scope.querySelector(selector)).not.toBeNull();
			},
			['templates.parsing', 'parsing.namespaces'],
		);
	}
}
