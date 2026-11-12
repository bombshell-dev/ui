import type { CompatibilityExpect } from '../../../shared/context.ts';

export function createAttributeAssertions(expect: CompatibilityExpect) {
	function attr_is(
		attr: Attr,
		v: string,
		ln: string,
		ns: string | null,
		p: string | null,
		n: string,
		description?: string,
	) {
		description = description ? description + ': ' : '';
		expect(attr.value, description + 'value').toBe(v);
		expect(attr.nodeValue, description + 'nodeValue').toBe(v);
		expect(attr.textContent, description + 'textContent').toBe(v);
		expect(attr.localName, description + 'localName').toBe(ln);
		expect(attr.namespaceURI, description + 'namespaceURI').toBe(ns);
		expect(attr.prefix, description + 'prefix').toBe(p);
		expect(attr.name, description + 'name').toBe(n);
		expect(attr.nodeName, description + 'nodeName').toBe(n);
		expect(attr.specified, description + 'specified').toBe(true);
	}

	function attributes_are(el: Element, l: [string, string, string?][]) {
		for (let i = 0, il = l.length; i < il; i++) {
			attr_is(
				el.attributes[i]!,
				l[i]![1],
				l[i]![0],
				l[i]!.length < 3 ? null : l[i]![2]!,
				null,
				l[i]![0],
				'attributes[' + i + ']',
			);
			expect(el.attributes[i]!.ownerElement).toBe(el);
		}
	}

	return { attr_is, attributes_are };
}
