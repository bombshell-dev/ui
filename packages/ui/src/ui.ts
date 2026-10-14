import type { ReadStream, WriteStream } from 'node:tty';
import process from 'node:process';
import {
	alternateBuffer,
	createTerm,
	CSI,
	cursor,
	mouseTracking,
	settings,
	type Op,
	type RenderInfo,
	type RenderResult,
	type Setting,
	type Term,
} from '@bomb.sh/tty';
import { DispatchApi } from './dispatch.ts';
import { id, type Node } from './core.ts';
import { getElement } from './elements.ts';
import { EventApi } from './event-api.ts';
import type { HostEventType } from './events.ts';
import { useFocusNavigation } from './focus-navigation.ts';
import { FocusApi } from './focus.ts';
import { useHostRenderer } from './host-render.ts';
import { createHost, type Host } from './host.ts';
import { KeyboardApi } from './keyboard.ts';
import { layout, LayoutApi } from './layout.ts';
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
	let rawMode = false;
	let terminalActive = true;
	let renderInfo: RenderInfo | undefined;

	const term = await createTerm({ width, height });
	const rendererOptions = { height, output, term };
	const { setup, render } = inline
		? createInlineRenderer(rendererOptions)
		: createFullscreenRenderer(rendererOptions);

	const host = createHost();
	host.viewport = { width, height };

	DispatchApi.init(host.root);
	LayoutApi.init(host.root);
	KeyboardApi.init(host.root);
	FocusApi.init(host.root);

	useFocusNavigation(host);
	useRenderLoop(host, render, controller.signal, (info) => {
		renderInfo = info;
		host.setRenderInfo(info);
	});
	useHostRenderer(host);
	const restoreTerminal = (): void => {
		if (!terminalActive) return;
		terminalActive = false;
		controller.abort();
		process.off('uncaughtExceptionMonitor', restoreTerminal);
		if (rawMode) {
			try {
				options.input.setRawMode(false);
				options.input.pause();
			} catch {}
			rawMode = false;
		}
		try {
			output.write(setup.revert);
		} catch {}
	};
	process.on('uncaughtExceptionMonitor', restoreTerminal);

	output.write(setup.apply);

	return {
		host,
		async [Symbol.asyncDispose]() {
			restoreTerminal();
		},

		async main(): Promise<void> {
			const dispatch = DispatchApi.at(host.root);
			const { input: stdin } = options;
			let pressedNode: Node | undefined;
			let pointerTarget: Node | undefined;
			try {
				stdin.setRawMode(true);
				rawMode = true;
				stdin.resume();

				input: for await (const events of createInputLoop({
					stdin,
					signal: controller.signal,
				})) {
					for (const event of events) {
						if (event.type === 'keydown' && event.ctrl === true && event.code === 'c') {
							break input;
						}
						if (event.type === 'mousedown') {
							const focusTarget =
								event.button === 'left' && renderInfo
									? findFocusableTarget(host, { info: renderInfo, x: event.x, y: event.y })
									: undefined;
							if (focusTarget) {
								const focus = FocusApi.at(host.root);
								focus.setFocus(focusTarget, {
									force: !focus.canFocus(focusTarget),
								});
							}
							pointerTarget =
								event.button === 'left' && renderInfo
									? findEventTarget(host, {
											info: renderInfo,
											x: event.x,
											y: event.y,
											type: 'pointerDown',
										})
									: undefined;
							if (pointerTarget) {
								getElement(pointerTarget).emit({
									type: 'pointerDown',
									bubbles: true,
									button: 0,
									buttons: 1,
									clientX: event.x,
									clientY: event.y,
									pointerId: 1,
									pointerType: 'mouse',
									shiftKey: event.shift,
									ctrlKey: event.ctrl,
									altKey: event.alt,
								});
							}
							pressedNode =
								event.button === 'left' && renderInfo
									? findClickTarget(host, { info: renderInfo, x: event.x, y: event.y })
									: undefined;
							continue;
						}
						if (event.type === 'mousemove') {
							if (pointerTarget) {
								getElement(pointerTarget).emit({
									type: 'pointerMove',
									bubbles: true,
									clientX: event.x,
									clientY: event.y,
									pointerId: 1,
									pointerType: 'mouse',
									buttons: 1,
									shiftKey: event.shift,
									ctrlKey: event.ctrl,
									altKey: event.alt,
								});
							}
							continue;
						}
						if (event.type === 'mouseup') {
							if (pointerTarget) {
								getElement(pointerTarget).emit({
									type: 'pointerUp',
									bubbles: true,
									clientX: event.x,
									clientY: event.y,
									pointerId: 1,
									pointerType: 'mouse',
									button: 0,
									buttons: 0,
								});
								pointerTarget = undefined;
							}
							const releasedNode =
								(event.button === 'left' || event.button === 'release') && renderInfo
									? findClickTarget(host, { info: renderInfo, x: event.x, y: event.y })
									: undefined;
							if (pressedNode && releasedNode === pressedNode) {
								getElement(pressedNode).emit({
									type: 'click',
									bubbles: true,
									detail: 1,
									pointerType: 'mouse',
									button: 0,
									shiftKey: event.shift,
									ctrlKey: event.ctrl,
									altKey: event.alt,
								});
							}
							pressedNode = undefined;
							continue;
						}
						try {
							dispatch.dispatch(event);
						} catch {
							// Ignore dispatch errors: writing to the console would corrupt terminal output.
						}
					}
				}
			} finally {
				restoreTerminal();
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
			const result = term.render(ops, { mode: 'line' });
			return new Promise<RenderResult>((res, rej) => {
				output.write(result.output, (err) => (err ? rej(err) : res(result)));
			});
		},
	};
}

function createFullscreenRenderer({ output, term }: RendererOptions): Renderer {
	return {
		setup: settings(cursor(false), alternateBuffer(), mouseTracking()),
		render(ops) {
			const result = term.render(ops);
			return new Promise<RenderResult>((res, rej) => {
				output.write(result.output, (err) => (err ? rej(err) : res(result)));
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

// oxlint-disable-next-line bombshell-dev/max-params
async function useRenderLoop(
	host: Host,
	render: Renderer['render'],
	signal: AbortSignal,
	onRender: (info: RenderInfo) => void,
): Promise<void> {
	const renderer = RenderApi.init(host.root, signal);

	for await (const frame of renderer) {
		const ops = renderer.render(frame, () => [...layout(host.root)]);
		const result = await renderer.paint(() => render(ops));
		onRender(result.info);
		if (result.animating && !signal.aborted) {
			await new Promise<void>((resolve) => setTimeout(resolve, 16));
			if (!signal.aborted) renderer.request();
		}
	}
}

interface HitTest {
	info: RenderInfo;
	x: number;
	y: number;
}

function findClickTarget(host: Host, position: HitTest): Node | undefined {
	return findEventTarget(host, { ...position, type: 'click' });
}

function findFocusableTarget(host: Host, { info, x, y }: HitTest): Node | undefined {
	const focus = FocusApi.at(host.root);
	const visit = (node: Node): { hit: boolean; target?: Node } => {
		const bounds = info.get(id(node))?.bounds;
		let hit =
			!!bounds &&
			x >= bounds.x &&
			x < bounds.x + bounds.width &&
			y >= bounds.y &&
			y < bounds.y + bounds.height;
		let childTarget: Node | undefined;
		for (const child of node.children) {
			const result = visit(child);
			hit ||= result.hit;
			if (result.target) childTarget = result.target;
		}
		if (childTarget) return { hit, target: childTarget };
		const element = getElement(node);
		const tabIndex = element.properties.tabIndex;
		const tabFocusable =
			typeof tabIndex === 'number' && tabIndex >= 0 && !element.properties.disabled;
		if (hit && (focus.canFocus(node) || tabFocusable)) return { hit, target: node };
		return { hit };
	};
	return visit(host.root).target;
}

function findEventTarget(
	host: Host,
	{ info, x, y, type }: HitTest & { type: HostEventType },
): Node | undefined {
	const events = EventApi.at(host.root);
	const visit = (node: Node): { hit: boolean; target?: Node } => {
		const bounds = info.get(id(node))?.bounds;
		let hit =
			!!bounds &&
			x >= bounds.x &&
			x < bounds.x + bounds.width &&
			y >= bounds.y &&
			y < bounds.y + bounds.height;
		let childTarget: Node | undefined;
		for (const child of node.children) {
			const result = visit(child);
			hit ||= result.hit;
			if (result.target) childTarget = result.target;
		}
		if (childTarget) return { hit, target: childTarget };
		if (hit && events.hasEventListener(getElement(node), type)) return { hit, target: node };
		return { hit };
	};
	return visit(host.root).target;
}
