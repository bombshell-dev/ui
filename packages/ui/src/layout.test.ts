import { close, open, rgba, snapshot, text, type Op } from '@bomb.sh/tty';
import { assert, describe, expect, it } from 'vitest';
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

	it('lays out a deeply nested tree without recursive traversal', () => {
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

		root.style.display = 'inline';
		expect([...new Layout(root).layout()]).toEqual([text('leaf')]);
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
describe('sparse layout options', () => {
	it('omits default layout options and saves the whole packed layout block', () => {
		const document = new Document(() => {});
		const { body } = document;
		// Explicit defaults have the same packing requirements as undeclared defaults.
		body.style.display = 'flex';
		body.style.flexDirection = 'row';
		body.style.gap = '0px';
		body.style.paddingLeft = '0px';
		body.style.borderColor = 'blue';
		const ops = [...new Layout(body).layout()];
		const id = rootId(ops);
		const dense = [
			open(id, {
				layout: {
					direction: 'ltr',
					gap: 0,
					padding: { top: 0, right: 0, bottom: 0, left: 0 },
				},
			}),
			close(),
		];
		expect(ops).toEqual([open(id), close()]);
		expect(packed(dense).byteLength - packed(ops).byteLength).toBe(36);
	});

	it('packs nondefault layout and border options identically to explicit zero sides', () => {
		const document = new Document(() => {});
		const { body } = document;
		body.style.flexDirection = 'column';
		body.style.gap = '2px';
		body.style.paddingLeft = '2px';
		body.style.borderStyle = 'solid';
		body.style.borderColor = 'blue';
		body.style.borderTopWidth = '0px';
		body.style.borderRightWidth = '0px';
		body.style.borderBottomWidth = '0px';
		const ops = [...new Layout(body).layout()];
		const id = rootId(ops);
		expect(ops).toEqual([
			open(id, {
				layout: { direction: 'ttb', gap: 2, padding: { left: 2 } },
				border: { color: rgba(0, 0, 255), left: 1 },
			}),
			close(),
		]);
		expect(packed(ops)).toEqual(
			packed([
				open(id, {
					layout: { direction: 'ttb', gap: 2, padding: { top: 0, right: 0, bottom: 0, left: 2 } },
					border: { color: rgba(0, 0, 255), top: 0, right: 0, bottom: 0, left: 1 },
				}),
				close(),
			]),
		);
	});

	it('omits terminal-default text color but preserves inherited packed zero', () => {
		const document = new Document(() => {});
		const { body } = document;
		const span = document.createElement('span');
		span.appendChild(document.createTextNode('inline'));
		body.appendChild(document.createTextNode('direct'));
		body.appendChild(span);
		const layout = new Layout(body);
		const ops = [...layout.layout()];
		const id = rootId(ops);
		expect(ops).toEqual([open(id), text('direct'), text('inline'), close()]);
		body.style.color = 'transparent';
		expect([...layout.layout()]).toEqual([
			open(id),
			text('direct', { color: 0 }),
			text('inline', { color: 0 }),
			close(),
		]);
	});
});

function rootId(ops: Op[]): string {
	const root = ops[0];
	assert(root && 'id' in root);
	return root.id;
}

function packed(ops: Op[]): Uint8Array {
	const result = snapshot(ops) as { data: Uint8Array };
	return result.data;
}
