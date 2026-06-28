import { Buffer } from 'node:buffer';
import type { ReadStream, WriteStream } from 'node:tty';
import {
	createInput as ttyCreateInput,
	createTerm as ttyCreateTerm,
	type Input,
	type InputEvent,
	type InputOptions,
	type Op,
	type RenderOptions,
	type Term,
	type TermOptions,
} from '@bomb.sh/tty';
import { type Child, normalizeChildren } from '../children.ts';
import { resolveIds } from './ids.ts';
import { type InputCategory, resolveSettings } from './settings.ts';

export interface RenderRootOptions {
	/** Stream to write rendered frames to. Defaults to `process.stdout`. */
	output?: WriteStream;
	/** Stream to read bytes from. Defaults to `process.stdin`. */
	input?: ReadStream;
	/** Render width in columns. Defaults to the output's column count. */
	width?: number;
	/** Render height in rows. Defaults to the output's row count. */
	height?: number;
	/** `'fullscreen'` uses the alternate buffer + hidden cursor; `'inline'` renders into scrollback. Default `'fullscreen'`. */
	mode?: 'fullscreen' | 'inline';
	/** Input categories to enable and surface. Default `['key', 'mouse']`. */
	events?: InputCategory[];
	/** Aborting unmounts the root. */
	signal?: AbortSignal;
	/** @internal Factory for the input parser; overridable for tests/alt runtimes. */
	createInput?: (options?: InputOptions) => Promise<Input>;
	/** @internal Factory for the term renderer; overridable for tests/alt runtimes. */
	createTerm?: (options: TermOptions) => Promise<Term>;
}

/** Dispose symbol with a fallback for runtimes that predate `Symbol.dispose`. */
const DISPOSE: typeof Symbol.dispose =
	Symbol.dispose ?? (Symbol.for('nodejs.dispose') as typeof Symbol.dispose);

/** ~60fps cadence for animation follow-up frames, in milliseconds. */
const FRAME_MS = 16;

/** Imperative, reactivity-agnostic event hub over a tty terminal. */
export class RenderRoot {
	#outputStream: WriteStream;
	#inputStream: ReadStream;
	#width: number;
	#height: number;
	#mode: 'fullscreen' | 'inline';
	#events: Set<InputCategory>;
	#renderMode: RenderOptions['mode'];
	#setting: ReturnType<typeof resolveSettings>;
	#createInput: (options?: InputOptions) => Promise<Input>;
	#createTerm: (options: TermOptions) => Promise<Term>;

	#term?: Term;
	#parser?: Input;
	#children: Op[] = [];

	constructor(options: RenderRootOptions = {}) {
		this.#outputStream = options.output ?? (process.stdout as WriteStream);
		this.#inputStream = options.input ?? (process.stdin as ReadStream);
		this.#width = options.width ?? this.#outputStream.columns ?? 80;
		this.#height = options.height ?? this.#outputStream.rows ?? 24;
		this.#mode = options.mode ?? 'fullscreen';
		this.#events = new Set(options.events ?? ['key', 'mouse']);
		this.#renderMode = this.#mode === 'inline' ? 'line' : undefined;
		this.#setting = resolveSettings({ mode: this.#mode, events: [...this.#events] });
		this.#createInput = options.createInput ?? ttyCreateInput;
		this.#createTerm = options.createTerm ?? ttyCreateTerm;
	}

	/** @internal Async WASM init. `start`/`createRoot` call this for you. Idempotent. */
	async ready(): Promise<void> {
		const [parser, term] = await Promise.all([
			this.#parser ?? this.#createInput(),
			this.#term ?? this.#createTerm({ width: this.#width, height: this.#height }),
		]);
		this.#parser ??= parser;
		this.#term ??= term;
	}

	/** @internal Enter interactive mode. Filled in by later tasks; for now just `ready`. */
	async start(): Promise<void> {
		await this.ready();
	}

	/** Render `children` (or re-render the cached children when called with no args). Synchronous. */
	render(...children: Child[]): void {
		if (!this.#term) {
			throw new Error('RenderRoot is not ready: use `createRoot` (or await `start`) before `render`.');
		}
		if (children.length > 0) this.#children = resolveIds(normalizeChildren(children));
		this.#draw();
	}

	/** Restore the terminal and detach everything. Idempotent. Filled in by later tasks. */
	unmount(): void {}

	[DISPOSE](): void {
		this.unmount();
	}

	/** The one render path. `pointer` is passed only on the mouse-driven mechanical path (Task 6). */
	#draw(pointer?: { x: number; y: number; down: boolean }): void {
		if (!this.#term) return;
		const options: RenderOptions = {};
		if (this.#renderMode) options.mode = this.#renderMode;
		if (pointer) options.pointer = pointer;
		const result = this.#term.render(this.#children, options);
		this.#outputStream.write(Buffer.from(result.output));
	}
}

export async function createRoot(options?: RenderRootOptions): Promise<RenderRoot> {
	const root = new RenderRoot(options);
	await root.start();
	return root;
}
