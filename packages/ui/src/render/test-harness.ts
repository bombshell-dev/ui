// Test-only helpers. Not exported from the package.
import { Buffer } from 'node:buffer';
import { createMocks } from '@bomb.sh/tools/test-utils';
import type { Input, Op, RenderOptions, RenderResult, ScanResult, Term } from '@bomb.sh/tty';

/** Default frame text a fake term emits; tests assert it lands in `output`. */
export const SENTINEL = 'A';

/** Escape-sequence fragments for output assertions (verified against tty v0.8.0). */
export const Seq = {
	altBuffer: '?1049h',
	altBufferOff: '?1049l',
} as const;

/** Synchronously deliver bytes to a mock stdin (the loop listens via `.on('data')`). */
export function feed(input: { emit(event: 'data', chunk: Buffer): boolean }, bytes: number[]): void {
	input.emit('data', Buffer.from(bytes));
}

/** A scripted {@link Input}: each scan() returns the next queued result (or empty). */
export function fakeParser(script: ScanResult[] = []) {
	const queue = [...script];
	const calls: Array<Uint8Array | undefined> = [];
	const parser: Input & { calls: typeof calls; push(result: ScanResult): void } = {
		scan(bytes?: Uint8Array): ScanResult {
			calls.push(bytes);
			return queue.shift() ?? { events: [] };
		},
		calls,
		push: (result: ScanResult) => queue.push(result),
	};
	return parser;
}

/** A scripted {@link Term}: each render() returns the next queued result, repeating the last. */
export function fakeTerm(script: Array<Partial<RenderResult>> = []) {
	const queue = [...script];
	const renders: Array<{ ops: Op[]; options?: RenderOptions }> = [];
	let last: Partial<RenderResult> = {};
	const term: Term & { renders: typeof renders; push(result: Partial<RenderResult>): void } = {
		render(ops: Op[], options?: RenderOptions): RenderResult {
			renders.push({ ops, options });
			last = queue.shift() ?? last;
			return {
				output: last.output ?? new Uint8Array(),
				events: last.events ?? [],
				info: last.info ?? { get: () => undefined },
				errors: last.errors ?? [],
				animating: last.animating ?? false,
			};
		},
		renders,
		push: (result: Partial<RenderResult>) => queue.push(result),
	};
	return term;
}

/** Mock stdio + scripted parser/term. Call inside a test (createMocks registers cleanup). */
export function mockEnv(config: { columns?: number; rows?: number } = {}) {
	const mocks = createMocks({
		input: { isTTY: true },
		output: { isTTY: true, columns: config.columns ?? 80, rows: config.rows ?? 24 },
	});
	return {
		input: mocks.input!,
		output: mocks.output!,
		parser: fakeParser(),
		term: fakeTerm(),
	};
}
