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
