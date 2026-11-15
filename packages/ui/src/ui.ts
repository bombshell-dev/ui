import { alternateBuffer, createTerm, cursor, settings } from '@bomb.sh/tty';
import type { Readable, Writable } from 'node:stream';
import { Document } from './dom.ts';
import type { Platform } from './platform.ts';
import { RenderApi } from './render.ts';
import { Layout } from './layout.ts';

export interface UI {
	document: Document;
	main(): Promise<void>;
}

/** Defaults come from the platform for the current runtime. */
export interface UIOptions {
	height?: number;
	width?: number;
	input?: Readable;
	output?: Writable;
	/** Stops the UI. Without one, the platform decides, such as SIGINT on Node. */
	signal?: AbortSignal;
}

/** Run a UI on `platform` until `signal` aborts or the platform interrupts it. */
export async function startUI(platform: Platform, signal?: AbortSignal): Promise<UI> {
	const stop = new AbortController();
	const lifetime = signal ? AbortSignal.any([signal, stop.signal]) : stop.signal;

	const setup = settings(cursor(false), alternateBuffer());

	const term = await createTerm(platform.size());
	const render = new RenderApi(lifetime);

	const document = new Document(() => render.request());

	const layout = new Layout(document.documentElement);

	let running: Promise<void> | undefined = undefined;

	const run = async () => {
		await platform.write(setup.apply);

		try {
			platform.listen(
				{
					resize({ width, height }) {
						platform.write(term.update([{ type: 'resize', width, height }])).then(
							() => render.request(),
							() => stop.abort(),
						);
					},
					interrupt: () => stop.abort(),
				},
				lifetime,
			);

			for await (const _ of render) {
				const ops = [...layout.layout()];
				const result = term.render(ops);
				await platform.write(result.output);
			}
		} finally {
			stop.abort();
			await platform.write(setup.revert);
		}
	};

	return {
		document,
		main() {
			return running ? running : lifetime.aborted ? Promise.resolve() : (running = run());
		},
	};
}
