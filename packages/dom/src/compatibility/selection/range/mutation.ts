import type { CompatibilityContext } from '../../context.ts';
export const spec = 'https://dom.spec.whatwg.org/#interface-range';
export const requires = ['selection.range.boundaries', 'document.xml'] as const;
// Additional matrices adapted from WPT Range-{insertNode,surroundContents}.html.
// Copyright © web-platform-tests contributors. Original author: Aryeh Gregor.
// BSD-3-Clause; see ../../../../test/wpt/LICENSE.txt and docs/wpt-ranges-parsing.md.
export const wpt =
	'https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/dom/ranges/Range-surroundContents.html';
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'inserts into a text boundary by splitting text and expands a collapsed range',
		(fixture) => {
			const document = fixture.document as unknown as Document;
			const p = document.createElement('div'),
				t = document.createTextNode('abcd'),
				e = document.createElement('i'),
				r = document.createRange();
			p.append(t);
			r.setStart(t, 2);
			r.collapse(true);
			r.insertNode(e);
			expect(Array.from(p.childNodes).map((n) => n.nodeName)).toEqual(['#text', 'I', '#text']);
			expect(t.data).toBe('ab');
			expect(p.lastChild!.nodeValue).toBe('cd');
			expect(r.startContainer).toBe(t);
			expect(r.startOffset).toBe(2);
			expect(r.endContainer).toBe(p);
			expect(r.endOffset).toBe(2);
		},
	);
	context.test('surrounds selected text and selects the new parent', (fixture) => {
		const document = fixture.document as unknown as Document;
		const p = document.createElement('div'),
			t = document.createTextNode('abcd'),
			r = document.createRange(),
			e = document.createElement('b');
		p.append(t);
		r.setStart(t, 1);
		r.setEnd(t, 3);
		r.surroundContents(e);
		expect(p.innerHTML).toBe('a<b>bc</b>d');
		expect(r.startContainer).toBe(p);
		expect(r.startOffset).toBe(1);
		expect(r.endOffset).toBe(2);
	});
	context.test('rejects surrounding a partially selected non-text node atomically', (fixture) => {
		const document = fixture.document as unknown as Document;
		const p = document.createElement('div');
		p.innerHTML = '<i>ab</i>cd';
		const r = document.createRange();
		r.setStart(p.firstChild!.firstChild!, 1);
		r.setEnd(p, 2);
		expect(() => r.surroundContents(document.createElement('b'))).toThrow(
			expect.objectContaining({ name: 'InvalidStateError' }),
		);
		expect(p.innerHTML).toBe('<i>ab</i>cd');
	});
	context.test(
		'selectNode rejects parentless nodes and selectNodeContents selects children',
		(fixture) => {
			const document = fixture.document as unknown as Document;
			const p = document.createElement('div'),
				r = document.createRange();
			expect(() => r.selectNode(p)).toThrow(
				expect.objectContaining({ name: 'InvalidNodeTypeError' }),
			);
			p.append('a', 'b');
			r.selectNodeContents(p);
			expect(r.startOffset).toBe(0);
			expect(r.endOffset).toBe(2);
			r.collapse(false);
			expect(r.startOffset).toBe(2);
			expect(r.collapsed).toBe(true);
		},
	);
	context.test(
		'rejects invalid surround wrapper kinds without extracting the selection',
		(fixture) => {
			const document = fixture.document as unknown as Document;
			const parent = document.createElement('div');
			const text = parent.appendChild(document.createTextNode('abcd'));
			const range = document.createRange();
			range.setStart(text, 1);
			range.setEnd(text, 3);
			for (const wrapper of [
				document,
				document.createDocumentFragment(),
				document.implementation.createDocumentType('html', '', ''),
			]) {
				expect(() => range.surroundContents(wrapper)).toThrow(
					expect.objectContaining({ name: 'InvalidNodeTypeError' }),
				);
				expect(parent.textContent).toBe('abcd');
				expect(parent.firstChild).toBe(text);
				expect([
					range.startContainer,
					range.startOffset,
					range.endContainer,
					range.endOffset,
				]).toEqual([text, 1, text, 3]);
			}
		},
	);
	context.test(
		'surroundContents clears existing wrapper children and moves the wrapper by identity',
		(fixture) => {
			const document = fixture.document as unknown as Document;
			const parent = document.createElement('div');
			const first = document.createElement('i'),
				last = document.createElement('b');
			parent.append(first, last);
			const oldParent = document.createElement('div');
			const wrapper = oldParent.appendChild(document.createElement('section'));
			const discarded = wrapper.appendChild(document.createTextNode('discarded'));
			const range = document.createRange();
			range.selectNodeContents(parent);
			range.surroundContents(wrapper);
			expect(parent.firstChild).toBe(wrapper);
			expect(Array.from(wrapper.childNodes)).toEqual([first, last]);
			expect(discarded.parentNode).toBeNull();
			expect(discarded.data).toBe('discarded');
			expect(oldParent.childNodes.length).toBe(0);
			expect([
				range.startContainer,
				range.startOffset,
				range.endContainer,
				range.endOffset,
			]).toEqual([parent, 0, parent, 1]);
		},
	);
	context.test(
		'insertNode empties a fragment while preserving child identities and expanding a collapsed range',
		(fixture) => {
			const document = fixture.document as unknown as Document;
			const parent = document.createElement('div'),
				tail = document.createElement('i');
			parent.append(tail);
			const fragment = document.createDocumentFragment();
			const a = document.createElement('b'),
				b = document.createTextNode('text');
			fragment.append(a, b);
			const range = document.createRange();
			range.setStart(parent, 0);
			range.insertNode(fragment);
			expect(Array.from(parent.childNodes)).toEqual([a, b, tail]);
			expect(fragment.childNodes.length).toBe(0);
			expect([range.startOffset, range.endOffset]).toEqual([0, 2]);
			expect(range.startContainer).toBe(parent);
			expect(range.endContainer).toBe(parent);
		},
	);
	context.test(
		'insertNode adopts nodes from another document and removes them from their old tree',
		(fixture) => {
			const document = fixture.document as unknown as Document;
			const other = document.implementation.createHTMLDocument('');
			const node = other.body.appendChild(other.createElement('i'));
			const child = node.appendChild(other.createTextNode('foreign'));
			const parent = document.createElement('div'),
				range = document.createRange();
			range.selectNodeContents(parent);
			range.insertNode(node);
			expect(parent.firstChild).toBe(node);
			expect(node.ownerDocument).toBe(document);
			expect(child.ownerDocument).toBe(document);
			expect(other.body.childNodes.length).toBe(0);
			expect([range.startOffset, range.endOffset]).toEqual([0, 1]);
		},
	);
	context.test('insertNode validates ancestor cycles before splitting boundary text', (fixture) => {
		const document = fixture.document as unknown as Document;
		const parent = document.createElement('div');
		const text = parent.appendChild(document.createTextNode('abcd'));
		const range = document.createRange();
		range.setStart(text, 2);
		expect(() => range.insertNode(parent)).toThrow(
			expect.objectContaining({ name: 'HierarchyRequestError' }),
		);
		expect(Array.from(parent.childNodes)).toEqual([text]);
		expect(text.data).toBe('abcd');
		expect(range.startContainer).toBe(text);
		expect(range.startOffset).toBe(2);
		expect(range.collapsed).toBe(true);
	});
	context.test('insertNode rejects comment and parentless text boundary containers', (fixture) => {
		const document = fixture.document as unknown as Document;
		const parent = document.createElement('div');
		const comment = parent.appendChild(document.createComment('abc'));
		const detached = document.createTextNode('abc');
		for (const boundary of [comment, detached]) {
			const range = document.createRange();
			range.setStart(boundary, 1);
			const node = document.createElement('i');
			expect(() => range.insertNode(node)).toThrow(
				expect.objectContaining({ name: 'HierarchyRequestError' }),
			);
			expect(node.parentNode).toBeNull();
			expect(boundary.data).toBe('abc');
			expect(range.startContainer).toBe(boundary);
			expect(range.startOffset).toBe(1);
		}
	});
}
