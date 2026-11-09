import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test('normalizes descendant text in detached fragments', ({ document }) => {
		let df = document.createDocumentFragment(),
			t1 = document.createTextNode('1'),
			t2 = document.createTextNode('2'),
			t3 = document.createTextNode('3'),
			t4 = document.createTextNode('4');
		df.appendChild(t1);
		df.appendChild(t2);
		expect(df.childNodes.length).toBe(2);
		expect(df.textContent).toBe('12');
		let el = document.createElement('x');
		df.appendChild(el);
		el.appendChild(t3);
		el.appendChild(t4);
		document.normalize();
		expect(el.childNodes.length).toBe(2);
		expect(el.textContent).toBe('34');
		expect(df.childNodes.length).toBe(3);
		expect(t1.data).toBe('1');
		df.normalize();
		expect(df.childNodes.length).toBe(2);
		expect(df.firstChild).toBe(t1);
		expect(t1.data).toBe('12');
		expect(t2.data).toBe('2');
		expect(el.firstChild).toBe(t3);
		expect(t3.data).toBe('34');
		expect(t4.data).toBe('4');
	});
	context.test('Empty text nodes separated by a non-empty text node', ({ document }) => {
		let div = document.createElement('div');
		let t1 = div.appendChild(document.createTextNode(''));
		let t2 = div.appendChild(document.createTextNode('a'));
		let t3 = div.appendChild(document.createTextNode(''));
		expect(div.childNodes).toHaveLength(3);
		expect(div.childNodes[0]).toBe(t1);
		expect(div.childNodes[1]).toBe(t2);
		expect(div.childNodes[2]).toBe(t3);
		div.normalize();
		expect(div.childNodes).toHaveLength(1);
		expect(div.childNodes[0]).toBe(t2);
	});
	context.test('Empty text nodes', ({ document }) => {
		let div = document.createElement('div');
		let t1 = div.appendChild(document.createTextNode(''));
		let t2 = div.appendChild(document.createTextNode(''));
		expect(div.childNodes).toHaveLength(2);
		expect(div.childNodes[0]).toBe(t1);
		expect(div.childNodes[1]).toBe(t2);
		div.normalize();
		expect(div.childNodes).toHaveLength(0);
	});
	context.test('Non-text nodes with empty textContent values.', ({ DOMParser }) => {
		// We create an XML document so that we can create CDATASection.
		// Except for the CDATASection the result should be the same for
		// an HTML document. (No non-Text node should be touched.)
		let doc = new DOMParser().parseFromString('<div/>', 'text/xml');
		let div = doc.documentElement;
		let t1 = div.appendChild(doc.createTextNode('a'));
		// The first parameter is the "target" of the processing
		// instruction, and the 2nd is the text content.
		let t2 = div.appendChild(doc.createProcessingInstruction('pi', ''));
		let t3 = div.appendChild(doc.createTextNode('b'));
		let t4 = div.appendChild(doc.createCDATASection(''));
		let t5 = div.appendChild(doc.createTextNode('c'));
		let t6 = div.appendChild(doc.createComment(''));
		let t7 = div.appendChild(doc.createTextNode('d'));
		let t8 = div.appendChild(doc.createElement('el'));
		let t9 = div.appendChild(doc.createTextNode('e'));
		expect(div.childNodes).toHaveLength(9);
		expect(div.childNodes[0]).toBe(t1);
		expect(div.childNodes[1]).toBe(t2);
		expect(div.childNodes[2]).toBe(t3);
		expect(div.childNodes[3]).toBe(t4);
		expect(div.childNodes[4]).toBe(t5);
		expect(div.childNodes[5]).toBe(t6);
		expect(div.childNodes[6]).toBe(t7);
		expect(div.childNodes[7]).toBe(t8);
		expect(div.childNodes[8]).toBe(t9);
		div.normalize();
		expect(div.childNodes).toHaveLength(9);
		expect(div.childNodes[0]).toBe(t1);
		expect(div.childNodes[1]).toBe(t2);
		expect(div.childNodes[2]).toBe(t3);
		expect(div.childNodes[3]).toBe(t4);
		expect(div.childNodes[4]).toBe(t5);
		expect(div.childNodes[5]).toBe(t6);
		expect(div.childNodes[6]).toBe(t7);
		expect(div.childNodes[7]).toBe(t8);
		expect(div.childNodes[8]).toBe(t9);
	});
}
