import type { ContainerNode } from 'preact';
import type { WriteStream } from 'node:tty';
import { describe, expect, test } from 'vitest';
import { h, render as preactRender } from 'preact';
import { toOps } from '@clack/ui';
import { createDocument } from '../ir/node-state.ts';
import { domToTree } from './to-tree.ts';
import { Box, Text, createRoot } from '../index.ts';

// `@bomb.sh/tty` op directives (OP_OPEN_ELEMENT / OP_TEXT / OP_CLOSE_ELEMENT).
const OPEN = 2;
const TEXT = 3;
const CLOSE = 4;

const asContainer = (node: unknown) => node as unknown as ContainerNode;

describe('preact → tty walker', () => {
	test('flattens host nodes to open/text/close and preserves structured props', () => {
		const document = createDocument();
		preactRender(
			h(
				'tui-box',
				{ layout: { direction: 'ttb', gap: 1 }, border: { color: 7, top: 1, bottom: 1, left: 1, right: 1 } },
				h('tui-text', { color: 15 }, 'Hello'),
				h('tui-text', { color: 9 }, 'world'),
			),
			asContainer(document.body),
		);

		const ops = toOps(domToTree(document.body));

		expect(ops.map((op) => op.directive)).toEqual([OPEN, TEXT, TEXT, CLOSE]);
		// The Proxy hands Preact the property path, so the nested objects survive
		// intact rather than being stringified to "[object Object]" via setAttribute.
		expect(ops[0]).toMatchObject({
			directive: OPEN,
			border: { color: 7, top: 1, bottom: 1, left: 1, right: 1 },
			layout: { direction: 'ttb', gap: 1 },
		});
		expect(ops[1]).toMatchObject({ directive: TEXT, content: 'Hello', color: 15 });
		expect(ops[2]).toMatchObject({ directive: TEXT, content: 'world', color: 9 });
	});

	test('Box / Text components map to the same op shape', () => {
		const document = createDocument();
		preactRender(
			h(Box, { layout: { padding: { top: 1, right: 1, bottom: 1, left: 1 } } }, h(Text, {}, 'Hello')),
			asContainer(document.body),
		);

		const ops = toOps(domToTree(document.body));

		expect(ops.map((op) => op.directive)).toEqual([OPEN, TEXT, CLOSE]);
		expect(ops[0]).toMatchObject({ layout: { padding: { top: 1, right: 1, bottom: 1, left: 1 } } });
		expect(ops[1]).toMatchObject({ directive: TEXT, content: 'Hello' });
	});
});

describe('createRoot end-to-end', () => {
	const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

	function fakeOutput() {
		const writes: Uint8Array[] = [];
		const stream = {
			columns: 40,
			rows: 10,
			write: (chunk: Uint8Array) => (writes.push(chunk), true),
		};
		return { writes, stream: stream as unknown as WriteStream };
	}

	test('renders to the output and re-renders on update', async () => {
		const { writes, stream } = fakeOutput();
		const root = await createRoot(stream);

		root.render(h(Box, {}, h(Text, {}, 'first')));
		await tick();
		expect(writes).toHaveLength(1);
		expect(writes[0]!.byteLength).toBeGreaterThan(0);

		root.render(h(Box, {}, h(Text, {}, 'second')));
		await tick();
		expect(writes).toHaveLength(2);

		root.unmount();
	});

	test('coalesces multiple synchronous renders into a single flush', async () => {
		const { writes, stream } = fakeOutput();
		const root = await createRoot(stream);

		root.render(h(Box, {}, h(Text, {}, 'a')));
		root.render(h(Box, {}, h(Text, {}, 'b')));
		root.render(h(Box, {}, h(Text, {}, 'c')));
		await tick();

		expect(writes).toHaveLength(1);

		root.unmount();
	});
});
