import type { CompatibilityContext } from '../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	function assertNode(
		actual: Element,
		expected: {
			type: typeof HTMLHtmlElement | typeof HTMLParagraphElement;
			id?: string;
			idMessage?: string;
		},
	) {
		expect(
			actual instanceof expected.type,
			'Node type mismatch: actual = ' +
				actual.constructor.name +
				', expected = ' +
				expected.type.name,
		).toBe(true);
		if (typeof expected.id !== 'undefined') expect(actual.id, expected.idMessage).toBe(expected.id);
	}

	context.test('Parsing of id attribute', ({ DOMParser, HTMLHtmlElement }) => {
		let doc = new DOMParser().parseFromString(
			'<html id="root"><head></head><body></body></html>',
			'text/html',
		);

		let root = doc.documentElement;
		assertNode(root, {
			type: HTMLHtmlElement,
			id: 'root',
			idMessage: 'documentElement id attribute should be root.',
		});
	});
	context.test('contentType', ({ DOMParser }) => {
		let doc = new DOMParser().parseFromString(
			'<html id="root"><head></head><body></body></html>',
			'text/html',
		);

		expect(doc.contentType).toBe('text/html');
	});
	context.test('compatMode', ({ DOMParser }) => {
		let doc = new DOMParser().parseFromString(
			'<html id="root"><head></head><body></body></html>',
			'text/html',
		);

		expect(doc.compatMode).toBe('BackCompat');
	});
	context.test('compatMode for a proper DOCTYPE', ({ DOMParser }) => {
		let doc = new DOMParser().parseFromString(
			'<html id="root"><head></head><body></body></html>',
			'text/html',
		);

		let parser = new DOMParser();
		let input = '<!DOCTYPE html><html id="root"><head></head><body></body></html>';
		doc = parser.parseFromString(input, 'text/html');
		expect(doc.compatMode).toBe('CSS1Compat');
	});
	context.test('Location value', ({ DOMParser }) => {
		let doc = new DOMParser().parseFromString(
			'<html id="root"><head></head><body></body></html>',
			'text/html',
		);

		expect(doc.location, 'The document must have a location value of null.').toBe(null);
	});
	context.test('DOMParser parses HTML tag soup with no problems', ({ DOMParser }) => {
		let doc = new DOMParser().parseFromString(
			'<html id="root"><head></head><body></body></html>',
			'text/html',
		);

		let soup = '<!DOCTYPE foo></><foo></multiple></>';
		let htmldoc = new DOMParser().parseFromString(soup, 'text/html');
		expect(htmldoc.documentElement.localName).toBe('html');
		expect(htmldoc.documentElement.namespaceURI).toBe('http://www.w3.org/1999/xhtml');
	});
	context.test('DOMParser should handle the content of <noembed> as raw text', ({ DOMParser }) => {
		const doc = new DOMParser().parseFromString('<noembed>&lt;a&gt;</noembed>', 'text/html');
		expect(doc.querySelector('noembed')!.textContent).toBe('&lt;a&gt;');
	});
	context.test('DOMParser throws on an invalid enum value', ({ DOMParser, TypeError }) => {
		let doc = new DOMParser().parseFromString(
			'<html id="root"><head></head><body></body></html>',
			'text/html',
		);

		expect(function () {
			new DOMParser().parseFromString('', 'text/foo-this-is-invalid' as DOMParserSupportedType);
		}).toThrow(expect.objectContaining({ constructor: TypeError }));
	});
	context.test(
		'script is found synchronously even when there is a css import',
		({ document, DOMParser }) => {
			const doc = new DOMParser().parseFromString(
				`
<html><body>
<style>
  @import url(/dummy.css)
</style>
<script>document.x = 8<\/script>
</body></html>`,
				'text/html',
			);

			expect(doc.querySelector('script'), 'script must be found').not.toBe(null);
			expect(
				(doc as Document & { x?: number }).x,
				'script must not be executed on the inner document',
			).toBe(undefined);
			expect(
				(document as Document & { x?: number }).x,
				'script must not be executed on the outer document',
			).toBe(undefined);
		},
	);
	context.test(
		'must be parsed with scripting disabled, so noscript works',
		({ DOMParser, HTMLParagraphElement }) => {
			const doc = new DOMParser().parseFromString(
				`<body><noscript><p id="test1">test1<p id="test2">test2</noscript>`,
				'text/html',
			);
			assertNode(doc.body.firstChild!.childNodes[0] as Element, {
				type: HTMLParagraphElement,
				id: 'test1',
			});
			assertNode(doc.body.firstChild!.childNodes[1] as Element, {
				type: HTMLParagraphElement,
				id: 'test2',
			});
		},
	);
}
