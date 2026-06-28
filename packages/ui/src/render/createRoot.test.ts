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

describe('RenderRoot — pending ESC flush', () => {
	test('a pending scan re-scans after the delay and emits the flushed event', async () => {
		vi.useFakeTimers();
		const { root, input, parser } = makeRoot();
		await root.start();
		const seen: InputEvent[] = [];
		root.subscribe((e) => seen.push(e));
		parser.push({ events: [], pending: { delay: 25 } });
		parser.push({ events: [{ type: 'keydown', key: 'Escape', code: 'Escape' } as InputEvent] });
		feed(input, [0x1b]);
		expect(seen).toHaveLength(0);
		vi.advanceTimersByTime(25);
		expect(seen.map((e) => e.key)).toEqual(['Escape']);
		expect(parser.calls.at(-1)).toBeUndefined();
		root.unmount();
	});

	test('a new chunk cancels a still-pending flush timer', async () => {
		vi.useFakeTimers();
		const { root, input, parser } = makeRoot();
		await root.start();
		const seen: InputEvent[] = [];
		root.subscribe((e) => seen.push(e));
		parser.push({ events: [], pending: { delay: 25 } });
		parser.push({ events: [{ type: 'keydown', key: 'ArrowUp', code: 'ArrowUp' } as InputEvent] });
		feed(input, [0x1b]);
		feed(input, [0x5b, 0x41]);
		vi.advanceTimersByTime(25);
		expect(seen.map((e) => e.key)).toEqual(['ArrowUp']);
		root.unmount();
	});
});

describe('RenderRoot — pointer feedback', () => {
	test('a mouse event triggers a pointer-passing render and emits the resulting pointer events', async () => {
		const { root, input, parser, term } = makeRoot();
		await root.start();
		root.render(text('x'));
		const seen: InputEvent[] = [];
		root.subscribe((e) => seen.push(e));
		term.push({ output: new Uint8Array(), events: [{ type: 'pointerclick', id: 'btn' }] });
		parser.push({ events: [{ type: 'mousedown', button: 'left', x: 3, y: 1 } as InputEvent] });
		feed(input, [0]);
		expect(seen.map((e) => e.type)).toEqual(['mousedown', 'pointerclick']);
		expect(term.renders.at(-1)?.options?.pointer).toMatchObject({ x: 3, y: 1, down: true });
		root.unmount();
	});

	test('logical render passes NO pointer and emits no pointer events (feedback-loop cut)', async () => {
		const { root, term } = makeRoot();
		await root.start();
		const seen: InputEvent[] = [];
		root.subscribe((e) => seen.push(e));
		term.push({ output: new Uint8Array(), events: [{ type: 'pointerenter', id: 'x' }] });
		root.render(text('x'));
		expect(seen).toHaveLength(0);
		expect(term.renders.at(-1)?.options?.pointer).toBeUndefined();
		root.unmount();
	});
});

describe('RenderRoot — animation scheduling', () => {
	test('an animating render schedules exactly one follow-up frame per tick until it settles', async () => {
		vi.useFakeTimers();
		const { root, term } = makeRoot();
		await root.start();
		term.push({ output: new Uint8Array(), animating: true });
		term.push({ output: new Uint8Array(), animating: true });
		term.push({ output: new Uint8Array(), animating: false });
		const before = term.renders.length;
		root.render(text('x'));
		expect(term.renders.length).toBe(before + 1);
		vi.advanceTimersByTime(16);
		expect(term.renders.length).toBe(before + 2);
		vi.advanceTimersByTime(16);
		expect(term.renders.length).toBe(before + 3);
		vi.advanceTimersByTime(64);
		expect(term.renders.length).toBe(before + 3);
		root.unmount();
	});

	test('animation frames carry no pointer (cannot emit pointer events)', async () => {
		vi.useFakeTimers();
		const { root, term } = makeRoot();
		await root.start();
		const seen: InputEvent[] = [];
		root.subscribe((e) => seen.push(e));
		term.push({ output: new Uint8Array(), animating: true });
		term.push({ output: new Uint8Array(), animating: false, events: [{ type: 'pointerenter', id: 'x' }] });
		root.render(text('x'));
		vi.advanceTimersByTime(16);
		expect(seen).toHaveLength(0);
		root.unmount();
	});
});
