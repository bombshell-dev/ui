import type { CompatibilityContext } from '../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	const xhtml_prologue =
			'<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"' +
			' "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">\n' +
			'<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">\n' +
			'<body>\n',
		xhtml_epilogue = '</body>\n</html>\n';

	for (const fragment of [
		'<span x:test="testing">1</span>', // undeclared 'x' namespace prefix
		'< span>2</span>', // bad start tag
		'<span :test="testing">3</span>', // empty namespace prefix
		'<span><em>4</span></em>', // staggered tags
		'<span>5', // missing end </span> tag
		'6</span>', // missing start <span> tag
		'<span>7< /span>', // bad end tag
		'<span>8</ span>', // bad end tag
		'<span novalue>9</span>', // missing attribute value
		'<span ="noattr">10</span>', // missing attribute name
		'<span ::="test">11</span>', // bad namespace prefix
		'<span xmlns:="urn:x-test:test">12</span>', // missing namespace prefix
		'<span xmlns:xmlns="">13</span>', // invalid namespace prefix
		'<span data-test=testing>14</span>', // unquoted attribute value
		'15<span', // bad start tag
		'<8:test xmlns:8="urn:x-test:test">16</8:test>', // invalid namespace prefix
		'<span xmlns:p1 xmlns:p2="urn:x-test:test"/>17', // missing namespace URI
	] as const) {
		context.test(
			'DOMParser: <parsererror> element added on error' + ', ' + fragment,
			({ DOMParser }) => {
				let document_string = xhtml_prologue + fragment + xhtml_epilogue;
				let doc = new DOMParser().parseFromString(document_string, 'application/xhtml+xml');
				let parsererrors = doc.getElementsByTagName('parsererror');
				expect(parsererrors.length, 'expecting one parsererror').toBe(1);
			},
		);
	}
	for (const mimeType of [
		'text/xml',
		'application/xml',
		'application/xhtml+xml',
		'image/svg+xml',
	] as const) {
		context.test(`${mimeType} is preserved in the error document`, ({ DOMParser }) => {
			const doc = new DOMParser().parseFromString('<span x:test="testing">1</span>', mimeType);
			expect(doc.contentType).toBe(mimeType);
		});
	}
	context.test('A lone surrogate is replaced with U+FFFD', ({ DOMParser }) => {
		const parse = (text: string) =>
			new DOMParser().parseFromString(
				'<rss><title><![CDATA[' + text + ']]></title></rss>',
				'text/xml',
			);

		const doc = parse('broken ' + String.fromCharCode(0xd83c));
		expect(doc.documentElement.localName).toBe('rss');
		expect(doc.querySelector('title')!.textContent).toBe('broken \uFFFD');
	});
	context.test('A valid surrogate pair is preserved', ({ DOMParser }) => {
		const parse = (text: string) =>
			new DOMParser().parseFromString(
				'<rss><title><![CDATA[' + text + ']]></title></rss>',
				'text/xml',
			);

		const fire = String.fromCharCode(0xd83d, 0xdd25);
		const doc = parse('works ' + fire);
		expect(doc.documentElement.localName).toBe('rss');
		expect(doc.querySelector('title')!.textContent).toBe('works ' + fire);
	});
}
