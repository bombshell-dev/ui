import { alternateBuffer, createTerm, cursor, settings, type Term } from '@bomb.sh/tty';
import type { Readable, Writable } from 'node:stream';
import { Document } from './dom.ts';
import { RenderApi } from './render.ts';
import { Layout } from './layout.ts';

export interface UI extends AsyncDisposable {
	document: Document;
	/** Start rendering once. Disposal waits for this task and propagates its failure. */
	main(): Promise<void>;
}

export interface UIOptions {
	height?: number;
	width?: number;
	input: Readable;
	output: Writable;
}

export async function createUI(options: UIOptions): Promise<UI> {
	const { output, width = 80, height = 24 } = options;
	const controller = new AbortController();

	const setup = settings(cursor(false), alternateBuffer());
	await write(output, setup.apply);

	const term = await createTerm({ width, height });
	const render = new RenderApi(controller.signal);

	const document = new Document(() => render.request());

	const layout = new Layout(document.documentElement);

	const loop = new RenderLoop({ layout, term, output, frames: render });

	return {
		document,
		main: () => loop.run(),
		async [Symbol.asyncDispose]() {
			controller.abort();
			try {
				await loop.run();
			} finally {
				await write(output, setup.revert);
			}
		},
	};
}

interface RenderLoopOptions {
	layout: Layout;
	frames: AsyncIterable<void>;
	term: Term;
	output: Writable;
}

class RenderLoop {
	#layout: Layout;
	#frames: AsyncIterable<void>;
	#term: Term;
	#output: Writable;
	#running: Promise<void> | undefined;

	constructor(options: RenderLoopOptions) {
		this.#layout = options.layout;
		this.#frames = options.frames;
		this.#term = options.term;
		this.#output = options.output;
	}

	async #loop() {
		for await (const _ of this.#frames) {
			const ops = [...this.#layout.layout()];
			const result = this.#term.render(ops);
			await write(this.#output, result.output);
		}
	}

	run() {
		if (!this.#running) {
			this.#running = this.#loop();
		}
		return this.#running;
	}
}

function write(stream: Writable, bytes: Uint8Array): Promise<void> {
	const result = Promise.withResolvers<void>();
	stream.write(bytes, (err) => {
		if (err) {
			result.reject(err);
		} else {
			result.resolve();
		}
	});
	return result.promise;
}
