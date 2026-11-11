import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	const pairs = [
		{ attr: 'classList', sup: ['anyElement'] },
		{ attr: 'relList', sup: ['a', 'area', 'link'] },
		{ attr: 'htmlFor', sup: ['output'] },
		{ attr: 'sandbox', sup: ['iframe'] },
		{ attr: 'sizes', sup: ['link'] },
	];
	const namespaces = [
		'http://www.w3.org/1999/xhtml',
		'http://www.w3.org/2000/svg',
		'http://www.w3.org/1998/Math/MathML',
		'http://example.com/',
		'',
	];
	const elements = ['a', 'area', 'link', 'iframe', 'output', 'td', 'th'];
	for (const pair of pairs) {
		const supported = (localName: string, namespaceURI: string | null) =>
			pair.attr === 'classList' ||
			(pair.attr === 'relList' &&
				localName === 'a' &&
				(namespaceURI === 'http://www.w3.org/2000/svg' ||
					namespaceURI === 'http://www.w3.org/1998/Math/MathML')) ||
			(namespaceURI === 'http://www.w3.org/1999/xhtml' && pair.sup.includes(localName));
		for (const ns of namespaces) {
			for (const el of elements) {
				context.test(
					`${el}.${pair.attr} in ${ns || null} namespace should be ${supported(el, ns) ? 'DOMTokenList' : 'undefined'}.`,
					({ document }) => {
						const new_el = document.createElementNS(ns, el) as Element & Record<string, unknown>;
						if (supported(new_el.localName, new_el.namespaceURI)) {
							expect(Object.prototype.toString.call(new_el[pair.attr])).toBe(
								'[object DOMTokenList]',
							);
						} else {
							expect(new_el[pair.attr]).toBe(undefined);
						}
					},
				);
			}
		}
	}
}
