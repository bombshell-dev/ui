import { alternateBuffer, createTerm, cursor, settings } from '@bomb.sh/tty';
import type { Readable, Writable } from 'node:stream';
import { Document } from './dom.ts';
import { RenderApi } from './render.ts';
import { Layout } from './layout.ts';

export interface UI {
	document: Document;
	main(): Promise<void>;
}

export interface UIOptions {
	height?: number;
	width?: number;
	input: Readable;
	output: Writable;
	signal: AbortSignal;
}

export async function createUI(options: UIOptions): Promise<UI> {
	const { output, width = 80, height = 24, signal } = options;

	const setup = settings(cursor(false), alternateBuffer());

	const term = await createTerm({ width, height });
	const render = new RenderApi(signal);

	const document = new Document(() => render.request());

	const layout = new Layout(document.documentElement);

	let running: Promise<void> | undefined = undefined;

	const run = async () => {
		await write(output, setup.apply);

		try {
			for await (const _ of render) {
				const ops = [...layout.layout()];
				const result = term.render(ops);
				await write(output, result.output);
			}
		} finally {
			await write(output, setup.revert);
		}
	};

	return {
		document,
		main() {
			return running ? running : signal.aborted ? Promise.resolve() : (running = run());
		},
	};
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
