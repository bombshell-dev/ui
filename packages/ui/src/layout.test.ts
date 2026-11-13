import { close, open, text } from '@bomb.sh/tty';
import { describe, expect, it } from 'vitest';
import { Document } from './dom.ts';
import { Layout } from './layout.ts';

describe('Layout', () => {
	it('groups adjacent text around nested and empty elements and keeps IDs stable', () => {
		const document = new Document(() => {});
		const root = document.body;
		const child = document.createElement('document');
		const empty = document.createElement('document');
		root.appendChild(document.createTextNode('before'));
		root.appendChild(document.createTextNode(' child'));
		root.appendChild(child);
		child.appendChild(document.createTextNode('inside'));
		root.appendChild(document.createTextNode('after'));
		root.appendChild(empty);
		const layout = new Layout(root);
		const expected = [
			open('BODY: 0'),
			text('before child'),
			open('DOCUMENT: 1'),
			text('inside'),
			close(),
			text('after'),
			open('DOCUMENT: 2'),
			close(),
			close(),
		];

		expect([...layout.layout()]).toEqual(expected);
		expect([...layout.layout()]).toEqual(expected);
		expect([...layout.layout(child)]).toEqual([open('DOCUMENT: 1'), text('inside'), close()]);
	});

	it('lays out a deeply nested tree without recursive generator delegation', () => {
		const document = new Document(() => {});
		const root = document.body;
		const depth = 20_000;
		let current = root;
		for (let i = 1; i < depth; i++) {
			const child = document.createElement('document');
			current.appendChild(child);
			current = child;
		}
		current.appendChild(document.createTextNode('leaf'));
		const iterator = new Layout(root).layout();
		for (let i = 0; i < depth; i++) {
			expect(iterator.next().value).toEqual(open(`${i === 0 ? 'BODY' : 'DOCUMENT'}: ${i}`));
		}
		expect(iterator.next().value).toEqual(text('leaf'));
		for (let i = 0; i < depth; i++) {
			expect(iterator.next().value).toEqual(close());
		}
		expect(iterator.next().done).toBe(true);
	});

	it('closes active elements when iteration is returned early', () => {
		const document = new Document(() => {});
		const root = document.body;
		const child = document.createElement('document');
		root.appendChild(child);
		child.appendChild(document.createTextNode('inside'));
		const iterator = new Layout(root).layout();
		iterator.next();
		iterator.next();
		iterator.next();

		expect(iterator.return!()).toEqual({ value: close(), done: false });
		expect(iterator.next()).toEqual({ value: close(), done: false });
		expect(iterator.next().done).toBe(true);
	});
});
