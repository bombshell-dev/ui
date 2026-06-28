import type { InputEvent, Term, TermOptions } from '@bomb.sh/tty';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { text } from '../components/text.ts';
import { createRoot, RenderRoot, type RenderRootOptions } from './createRoot.ts';
import { feed, mockEnv, SENTINEL, Seq } from './test-harness.ts';

afterEach(() => vi.useRealTimers());

/** Build a RenderRoot wired to mock stdio + scripted parser/term. */
function makeRoot(rootOptions: Partial<RenderRootOptions> = {}, config: { columns?: number; rows?: number } = {}) {
	const env = mockEnv(config);
	const root = new RenderRoot({
		input: env.input as never,
		output: env.output as never,
		createInput: async () => env.parser,
		createTerm: async () => env.term,
		...rootOptions,
	});
	return { ...env, root };
}

describe('RenderRoot — init and logical render', () => {
	test('render before ready throws', () => {
		const { root } = makeRoot();
		expect(() => root.render(text('x'))).toThrow(/ready/);
	});

	test('render after start writes the term output to the stream', async () => {
		const { root, output, term } = makeRoot();
		await root.start();
		term.push({ output: new TextEncoder().encode(SENTINEL) });
		root.render(text('x'));
		expect(output.buffer.join('')).toContain(SENTINEL);
		expect(term.renders.length).toBeGreaterThanOrEqual(1);
		root.unmount();
	});

	test('render() with no args re-renders the cached children', async () => {
		const { root, term } = makeRoot();
		await root.start();
		root.render(text('x'));
		const after = term.renders.length;
		root.render();
		expect(term.renders.length).toBe(after + 1);
		root.unmount();
	});
});

describe('RenderRoot — event stream', () => {
	test('subscribe receives scanned events; off() stops them', async () => {
		const { root, input, parser } = makeRoot();
		await root.start();
		const seen: InputEvent[] = [];
		const off = root.subscribe((e) => seen.push(e));
		parser.push({ events: [{ type: 'keydown', key: 'a', code: 'a' } as InputEvent] });
		feed(input, [0]);
		expect(seen).toHaveLength(1);
		expect(seen[0]).toMatchObject({ type: 'keydown', key: 'a' });
		off();
		parser.push({ events: [{ type: 'keydown', key: 'b', code: 'b' } as InputEvent] });
		feed(input, [0]);
		expect(seen).toHaveLength(1);
		root.unmount();
	});

	test('events not in the enable-list are filtered out', async () => {
		const { root, input, parser } = makeRoot({ events: ['key'] });
		await root.start();
		const seen: InputEvent[] = [];
		root.subscribe((e) => seen.push(e));
		parser.push({
			events: [
				{ type: 'keydown', key: 'a', code: 'a' } as InputEvent,
				{ type: 'mousedown', button: 'left', x: 1, y: 1 } as InputEvent,
			],
		});
		feed(input, [0]);
		expect(seen.map((e) => e.type)).toEqual(['keydown']);
		root.unmount();
	});

	test('resize events are always delivered regardless of enable-list', async () => {
		const { root, input, parser } = makeRoot({ events: [] });
		await root.start();
		const seen: InputEvent[] = [];
		root.subscribe((e) => seen.push(e));
		parser.push({ events: [{ type: 'resize', width: 10, height: 5 } as InputEvent] });
		feed(input, [0]);
		expect(seen.map((e) => e.type)).toEqual(['resize']);
		root.unmount();
	});

	test('a subscriber that re-enters render() does not interleave dispatch', async () => {
		const { root, input, parser } = makeRoot();
		await root.start();
		const order: string[] = [];
		root.subscribe((e) => {
			order.push(`in:${e.type}`);
			root.render();
			order.push(`out:${e.type}`);
		});
		parser.push({
			events: [
				{ type: 'keydown', key: 'a', code: 'a' } as InputEvent,
				{ type: 'keydown', key: 'b', code: 'b' } as InputEvent,
			],
		});
		feed(input, [0]);
		expect(order).toEqual(['in:keydown', 'out:keydown', 'in:keydown', 'out:keydown']);
		root.unmount();
	});
});
