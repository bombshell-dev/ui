import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	const titles = [
		['', '', ''],
		[null, 'null', 'null'],
		[undefined, undefined, ''],
		['foo  bar baz', 'foo  bar baz', 'foo bar baz'],
		['foo\t\tbar baz', 'foo\t\tbar baz', 'foo bar baz'],
		['foo\n\nbar baz', 'foo\n\nbar baz', 'foo bar baz'],
		['foo\f\fbar baz', 'foo\f\fbar baz', 'foo bar baz'],
		['foo\r\rbar baz', 'foo\r\rbar baz', 'foo bar baz'],
	] as const;

	for (const [title, expectedtitle, normalizedtitle] of titles) {
		context.test(
			'createHTMLDocument(' + String(title) + ')',
			({
				document,
				Document,
				Node,
				DocumentType,
				HTMLHtmlElement,
				HTMLHeadElement,
				HTMLTitleElement,
				HTMLBodyElement,
			}) => {
				function checkDoc(
					doc: Document,
					expectedtitle: string | undefined,
					normalizedtitle: string,
				) {
					expect(doc instanceof Document, 'Should be a Document').toBe(true);
					expect(doc instanceof Node, 'Should be a Node').toBe(true);
					expect(doc.childNodes.length, 'Document should have two child nodes').toBe(2);

					let doctype = doc.doctype!;
					expect(doctype instanceof DocumentType, 'Doctype should be a DocumentType').toBe(true);
					expect(doctype instanceof Node, 'Doctype should be a Node').toBe(true);
					expect(doctype.name).toBe('html');
					expect(doctype.publicId).toBe('');
					expect(doctype.systemId).toBe('');

					let documentElement = doc.documentElement;
					expect(
						documentElement instanceof HTMLHtmlElement,
						'Document element should be a HTMLHtmlElement',
					).toBe(true);
					expect(
						documentElement.childNodes.length,
						'Document element should have two child nodes',
					).toBe(2);
					expect(documentElement.localName).toBe('html');
					expect(documentElement.tagName).toBe('HTML');

					let head = documentElement.firstChild as HTMLHeadElement;
					expect(head instanceof HTMLHeadElement, 'Head should be a HTMLHeadElement').toBe(true);
					expect(head.localName).toBe('head');
					expect(head.tagName).toBe('HEAD');

					if (expectedtitle !== undefined) {
						expect(head.childNodes.length).toBe(1);

						let title = head.firstChild as HTMLTitleElement;
						expect(title instanceof HTMLTitleElement, 'Title should be a HTMLTitleElement').toBe(
							true,
						);
						expect(title.localName).toBe('title');
						expect(title.tagName).toBe('TITLE');
						expect(title.childNodes.length).toBe(1);
						expect((title.firstChild as Text).data).toBe(expectedtitle);
					} else {
						expect(head.childNodes.length).toBe(0);
					}

					let body = documentElement.lastChild as HTMLBodyElement;
					expect(body instanceof HTMLBodyElement, 'Body should be a HTMLBodyElement').toBe(true);
					expect(body.localName).toBe('body');
					expect(body.tagName).toBe('BODY');
					expect(body.childNodes.length).toBe(0);
				}
				const doc = document.implementation.createHTMLDocument(title as string | undefined);
				checkDoc(doc, expectedtitle, normalizedtitle);
			},
			{
				document: {
					contentType: 'text/html',
					content:
						'<!doctype html><meta charset=windows-1252><title>DOMImplementation.createHTMLDocument</title><div id="log"></div>',
				},
			},
		);
	}
	context.test(
		'Missing title argument',
		({
			document,
			Document,
			Node,
			DocumentType,
			HTMLHtmlElement,
			HTMLHeadElement,
			HTMLTitleElement,
			HTMLBodyElement,
		}) => {
			function checkDoc(doc: Document, expectedtitle: string | undefined, normalizedtitle: string) {
				expect(doc instanceof Document, 'Should be a Document').toBe(true);
				expect(doc instanceof Node, 'Should be a Node').toBe(true);
				expect(doc.childNodes.length, 'Document should have two child nodes').toBe(2);

				let doctype = doc.doctype!;
				expect(doctype instanceof DocumentType, 'Doctype should be a DocumentType').toBe(true);
				expect(doctype instanceof Node, 'Doctype should be a Node').toBe(true);
				expect(doctype.name).toBe('html');
				expect(doctype.publicId).toBe('');
				expect(doctype.systemId).toBe('');

				let documentElement = doc.documentElement;
				expect(
					documentElement instanceof HTMLHtmlElement,
					'Document element should be a HTMLHtmlElement',
				).toBe(true);
				expect(
					documentElement.childNodes.length,
					'Document element should have two child nodes',
				).toBe(2);
				expect(documentElement.localName).toBe('html');
				expect(documentElement.tagName).toBe('HTML');

				let head = documentElement.firstChild as HTMLHeadElement;
				expect(head instanceof HTMLHeadElement, 'Head should be a HTMLHeadElement').toBe(true);
				expect(head.localName).toBe('head');
				expect(head.tagName).toBe('HEAD');

				if (expectedtitle !== undefined) {
					expect(head.childNodes.length).toBe(1);

					let title = head.firstChild as HTMLTitleElement;
					expect(title instanceof HTMLTitleElement, 'Title should be a HTMLTitleElement').toBe(
						true,
					);
					expect(title.localName).toBe('title');
					expect(title.tagName).toBe('TITLE');
					expect(title.childNodes.length).toBe(1);
					expect((title.firstChild as Text).data).toBe(expectedtitle);
				} else {
					expect(head.childNodes.length).toBe(0);
				}

				let body = documentElement.lastChild as HTMLBodyElement;
				expect(body instanceof HTMLBodyElement, 'Body should be a HTMLBodyElement').toBe(true);
				expect(body.localName).toBe('body');
				expect(body.tagName).toBe('BODY');
				expect(body.childNodes.length).toBe(0);
			}
			const doc = document.implementation.createHTMLDocument();
			checkDoc(doc, undefined, '');
		},
		{
			document: {
				contentType: 'text/html',
				content:
					'<!doctype html><meta charset=windows-1252><title>DOMImplementation.createHTMLDocument</title><div id="log"></div>',
			},
		},
	);
	context.test(
		'createHTMLDocument(): metadata',
		({ document }) => {
			let doc = document.implementation.createHTMLDocument('test');
			expect(doc.URL).toBe('about:blank');
			expect(doc.documentURI).toBe('about:blank');
			expect(doc.compatMode).toBe('CSS1Compat');
			expect(doc.characterSet).toBe('UTF-8');
			expect(doc.contentType).toBe('text/html');
			expect(doc.createElement('DIV').localName).toBe('div');
		},
		{
			document: {
				contentType: 'text/html',
				content:
					'<!doctype html><meta charset=windows-1252><title>DOMImplementation.createHTMLDocument</title><div id="log"></div>',
			},
		},
	);
	context.test(
		'createHTMLDocument(): characterSet aliases',
		({ document }) => {
			let doc = document.implementation.createHTMLDocument('test');
			expect(doc.characterSet, 'characterSet').toBe('UTF-8');
			expect(doc.charset, 'charset').toBe('UTF-8');
			expect(doc.inputEncoding, 'inputEncoding').toBe('UTF-8');
		},
		{
			document: {
				contentType: 'text/html',
				content:
					'<!doctype html><meta charset=windows-1252><title>DOMImplementation.createHTMLDocument</title><div id="log"></div>',
			},
		},
	);
	context.test(
		'createHTMLDocument(): URL parsing',
		({ document }) => {
			let doc = document.implementation.createHTMLDocument('test');
			let a = doc.createElement('a');
			// In UTF-8: 0xC3 0xA4
			a.href = 'http://example.org/?\u00E4';
			expect(a.href).toBe('http://example.org/?%C3%A4');
		},
		{
			document: {
				contentType: 'text/html',
				content:
					'<!doctype html><meta charset=windows-1252><title>DOMImplementation.createHTMLDocument</title><div id="log"></div>',
			},
		},
	);
	context.test(
		'createHTMLDocument(): document location getter is null',
		({ document }) => {
			let doc = document.implementation.createHTMLDocument();
			expect(doc.location).toBe(null);
		},
		{
			document: {
				contentType: 'text/html',
				content:
					'<!doctype html><meta charset=windows-1252><title>DOMImplementation.createHTMLDocument</title><div id="log"></div>',
			},
		},
	);
}
