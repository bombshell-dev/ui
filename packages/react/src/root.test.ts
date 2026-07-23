import type { WriteStream } from 'node:tty';
import { type FunctionComponent, createElement as h, useEffect, useState } from 'react';
import { describe, expect, test } from 'vitest';
import { Box, Text, createRoot } from './index.ts';

function fakeOutput() {
	const writes: Uint8Array[] = [];
	const stream = {
		columns: 40,
		rows: 10,
		write: (chunk: Uint8Array) => (writes.push(chunk), true),
	};
	return { writes, stream: stream as unknown as WriteStream };
}

describe('createRoot', () => {
	test('renders synchronously to the output', async () => {
		const { writes, stream } = fakeOutput();
		const root = await createRoot({ output: stream });

		root.render(h(Box, {}, h(Text, {}, 'hello')));

		// No tick needed — LegacyRoot + flushSyncWork commit inline.
		expect(writes).toHaveLength(1);
		expect(writes[0]!.byteLength).toBeGreaterThan(0);
		root.unmount();
	});

	test('re-renders on update and reflects structural changes', async () => {
		const { writes, stream } = fakeOutput();
		const root = await createRoot({ output: stream });

		root.render(h(Box, {}, h(Text, { color: 15 }, 'first')));
		root.render(h(Box, {}, h(Text, { color: 9 }, 'second'), h(Text, {}, 'extra')));
		root.render(h(Box, {}, h(Text, { color: 9 }, 'second')));

		expect(writes).toHaveLength(3);
		root.unmount();
	});

	test('structured props survive to the frame (no attribute stringification)', async () => {
		const { writes, stream } = fakeOutput();
		const root = await createRoot({ output: stream });

		root.render(
			h(
				Box,
				{
					// Borders don't reserve layout space — padding makes room for them.
					layout: { padding: { top: 1, bottom: 1, left: 2, right: 2 } },
					border: { color: 7, top: 1, right: 1, bottom: 1, left: 1 },
				},
				h(Text, { color: 15 }, 'boxed'),
			),
		);

		const frame = new TextDecoder().decode(writes[0]);
		// A border means box-drawing characters made it to the output.
		expect(frame).toContain('─');
		expect(frame).toContain('boxed');
		root.unmount();
	});

	test('state updates flush through a microtask', async () => {
		const { writes, stream } = fakeOutput();
		const root = await createRoot({ output: stream });

		const Counter: FunctionComponent = () => {
			const [count, setCount] = useState(0);
			useEffect(() => {
				if (count === 0) setCount(1);
			}, [count]);
			return h(Text, {}, `count: ${count}`);
		};
		root.render(h(Box, {}, h(Counter, {})));
		// Passive effects and their re-render flush async; one macrotask covers both.
		await new Promise((resolve) => setTimeout(resolve, 0));

		expect(writes.length).toBeGreaterThanOrEqual(2);
		expect(new TextDecoder().decode(writes.at(-1))).toContain('count: 1');
		root.unmount();
	});

	test('unmount does not write an extra frame', async () => {
		const { writes, stream } = fakeOutput();
		const root = await createRoot({ output: stream });

		root.render(h(Box, {}, h(Text, {}, 'bye')));
		const before = writes.length;
		root.unmount();

		expect(writes).toHaveLength(before);
	});
});
