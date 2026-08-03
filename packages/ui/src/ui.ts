import type { ReadStream, WriteStream } from 'node:tty';
import {
	alternateBuffer,
	createTerm,
	CSI,
	cursor,
	settings,
	type Op,
	type Setting,
	type Term,
} from '@bomb.sh/tty';
import { DispatchApi } from './dispatch.ts';
import { useBoxElement } from './elements/box.ts';
import { useInputElement } from './elements/input.ts';
import { useTextElement } from './elements/text.ts';
import { useFocusNavigation } from './focus-navigation.ts';
import { FocusApi } from './focus.ts';
import { useHostRenderer } from './host-render.ts';
import { createHost, type Host } from './host.ts';
import { KeyboardApi } from './keyboard.ts';
import { LayoutApi } from './layout.ts';
import { RenderApi } from './render.ts';
import { createInputLoop } from './input-loop.ts';
export interface UIOptions {
	height?: number;
	inline?: boolean;
	width?: number;
	input: ReadStream;
	output: WriteStream;
}

export interface UI extends AsyncDisposable {
	host: Host;
	main(): Promise<void>;
}

export async function createUI(options: UIOptions): Promise<UI> {
	const { output } = options;
	const { inline = false } = options;
	const { width = output.columns ?? 80 } = options;
	const { height = output.rows ?? 24 } = options;

	const controller = new AbortController();

	const term = await createTerm({ width, height });
	const rendererOptions = { height, output, term };
	const { setup, render } = inline
		? createInlineRenderer(rendererOptions)
		: createFullscreenRenderer(rendererOptions);

	const host = createHost();

	DispatchApi.init(host.root);
	LayoutApi.init(host.root);
	KeyboardApi.init(host.root);
	FocusApi.init(host.root);

	useFocusNavigation(host);
	useBoxElement(host);
	useTextElement(host);
	useInputElement(host);
	useRenderLoop(host, render, controller.signal);
	useHostRenderer(host);

	output.write(setup.apply);

	return {
		host,
		async [Symbol.asyncDispose]() {
			controller.abort();
			output.write(setup.revert);
		},

		async main(): Promise<void> {
			const dispatch = DispatchApi.at(host.root);
			const { input: stdin } = options;
			try {
				stdin.setRawMode(true);
				stdin.resume();

				input: for await (const events of createInputLoop({
					stdin,
					signal: controller.signal,
				})) {
					for (const event of events) {
						if (event.type === 'keydown' && event.ctrl === true && event.code === 'c') {
							break input;
						}
						try {
							dispatch.dispatch(event);
						} catch {
							// Ignore dispatch errors: writing to the console would corrupt terminal output.
						}
					}
				}
			} finally {
				controller.abort();
				stdin.setRawMode(false);
				stdin.pause();
			}
		},
	};
}

function createInlineRenderer({ height, output, term }: RendererOptions): Renderer {
	let firstRender = true;
	const nextLine: Setting = {
		apply: new Uint8Array(),
		revert: new TextEncoder().encode('\r\n'),
	};

	return {
		setup: settings(cursor(false), nextLine),
		render(ops) {
			if (!firstRender) {
				if (height > 1) {
					output.write(CSI(`${height - 1}A`));
				}
				output.write(CSI('1G'));
			}
			firstRender = false;
			return new Promise<void>((res, rej) => {
				output.write(term.render(ops, { mode: 'line' }).output, (err) => (err ? rej(err) : res()));
			});
		},
	};
}

function createFullscreenRenderer({ output, term }: RendererOptions): Renderer {
	return {
		setup: settings(cursor(false), alternateBuffer()),
		render(ops) {
			return new Promise<void>((res, rej) => {
				output.write(term.render(ops).output, (err) => (err ? rej(err) : res()));
			});
		},
	};
}

interface Renderer {
	setup: Setting;
	render(ops: Op[]): Promise<void>;
}

interface RendererOptions {
	height: number;
	output: WriteStream;
	term: Term;
}

// oxlint-disable-next-line bombshell-dev/max-params
async function useRenderLoop(
	host: Host,
	render: Renderer['render'],
	signal: AbortSignal,
): Promise<void> {
	const renderer = RenderApi.init(host.root, signal);

	const layout = LayoutApi.at(host.root);

	for await (const frame of renderer) {
		const ops = renderer.render(frame, () => [...layout.layout()]);
		await renderer.paint(() => render(ops));
	}
}
