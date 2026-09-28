import type { ReadStream, WriteStream } from 'node:tty';
import {
	alternateBuffer,
	createTerm,
	CSI,
	cursor,
	settings,
	type Op,
	type RenderResult,
	type Setting,
	type Term,
} from '@bomb.sh/tty';
import { DispatchApi, installDispatch } from './dispatch.ts';
import { installBuiltins } from './builtins.ts';
import { installFocusNavigation } from './focus-navigation.ts';
import { installFocus } from './focus.ts';
import { installHostRenderer } from './host-render.ts';
import { createHost, type Host } from './host.ts';
import type { Node } from './core.ts';
import { installKeyboard } from './keyboard.ts';
import { layout } from './layout.ts';
import {
	collectRenderRegions,
	getIndependentRegion,
	RenderApi,
	RenderFrames,
	type RenderRegion,
} from './render.ts';
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
	const term = await createTerm({ width, height });
	const host = createHost();

	installDispatch(host);
	installFocus(host);
	installKeyboard(host);
	installFocusNavigation(host);
	installBuiltins(host);
	installHostRenderer(host);

	const rendererOptions = { height, output, term };
	const { setup, render } = inline
		? createInlineRenderer(rendererOptions)
		: createFullscreenRenderer(rendererOptions);

	output.write(setup.apply);

	const controller = new AbortController();
	void spawnRenderLoop({ host, signal: controller.signal, render, partial: !inline });

	return {
		host,
		async [Symbol.asyncDispose]() {
			controller.abort();
			output.write(setup.revert);
		},

		async main(): Promise<void> {
			const { input: stdin } = options;
			try {
				stdin.setRawMode(true);
				stdin.resume();
				input: for await (const events of createInputLoop({ stdin, signal: controller.signal })) {
					for (const event of events) {
						if (event.type === 'keydown' && event.ctrl === true && event.code === 'c') {
							break input;
						}
						const dispatched = DispatchApi.methods.dispatch(host.root, event);
						if (!dispatched.ok) {
							// do something maybe?
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
				if (height > 1) output.write(CSI(`${height - 1}A`));
				output.write(CSI('1G'));
			}
			firstRender = false;
			return new Promise<RenderResult>((resolve, reject) => {
				const result = term.render(ops, { mode: 'line' });
				output.write(result.output, (error) => (error ? reject(error) : resolve(result)));
			});
		},
	};
}

function createFullscreenRenderer({ output, term }: RendererOptions): Renderer {
	return {
		setup: settings(cursor(false), alternateBuffer()),
		render(ops) {
			return new Promise<RenderResult>((resolve, reject) => {
				const result = term.render(ops);
				output.write(result.output, (error) => (error ? reject(error) : resolve(result)));
			});
		},
	};
}

interface Renderer {
	setup: Setting;
	render(ops: Op[]): Promise<RenderResult>;
}

interface RendererOptions {
	height: number;
	output: WriteStream;
	term: Term;
}

async function spawnRenderLoop(options: {
	signal: AbortSignal;
	host: Host;
	render: Renderer['render'];
	partial: boolean;
}): Promise<void> {
	const frames = new RenderFrames(options.signal);
	const { render, host, partial: allowPartial } = options;
	let regions = new Map<Node, RenderRegion>();

	RenderApi.around(host.root, {
		requestRender([node, reason], next) {
			next(node, reason);
			frames.request(node, reason);
		},
	});

	for await (const frame of frames) {
		let partial = false;
		const ops = RenderApi.methods.render(host.root, {
			frame,
			// tty consumes iterables at runtime; its current public type requires Op[].
			callback: () => {
				const region = allowPartial ? getIndependentRegion(frame.requests, regions) : undefined;
				if (region) {
					partial = true;
					return region;
				}
				return layout(host.root) as unknown as Op[];
			},
		});
		const result = await RenderApi.methods.paint(host.root, () => render(ops));
		if (!partial) regions = collectRenderRegions(host.root, result.info);
	}
}
