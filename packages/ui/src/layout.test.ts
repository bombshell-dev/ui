import { close, open, rgba, snapshot, text, type Op } from '@bomb.sh/tty';
import { assert, describe, expect, it } from 'vitest';
import { Document } from './dom.ts';
import { Layout } from './layout.ts';

describe('sparse layout options', () => {
	it('omits default layout options and saves the whole packed layout block', () => {
		const document = new Document(() => {});
		const { documentElement } = document;
		// Explicit defaults have the same packing requirements as undeclared defaults.
		documentElement.style.display = 'flex';
		documentElement.style.flexDirection = 'row';
		documentElement.style.gap = '0px';
		documentElement.style.paddingLeft = '0px';
		documentElement.style.borderColor = 'blue';
		const ops = [...new Layout(documentElement).layout()];
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
		const { documentElement } = document;
		documentElement.style.flexDirection = 'column';
		documentElement.style.gap = '2px';
		documentElement.style.paddingLeft = '2px';
		documentElement.style.borderStyle = 'solid';
		documentElement.style.borderColor = 'blue';
		documentElement.style.borderTopWidth = '0px';
		documentElement.style.borderRightWidth = '0px';
		documentElement.style.borderBottomWidth = '0px';
		const ops = [...new Layout(documentElement).layout()];
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
		const { documentElement } = document;
		const span = document.createElement('span');
		span.appendChild(document.createTextNode('inline'));
		documentElement.appendChild(document.createTextNode('direct'));
		documentElement.appendChild(span);
		const layout = new Layout(documentElement);
		const ops = [...layout.layout()];
		const id = rootId(ops);
		expect(ops).toEqual([open(id), text('direct'), text('inline'), close()]);
		documentElement.style.color = 'transparent';
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
