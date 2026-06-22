// oxlint-disable bombshell-dev/exported-function-async, bombshell-dev/require-export-jsdoc, bombshell-dev/no-generic-error, typescript/explicit-function-return-type, eslint/no-underscore-dangle, eslint/max-params, eslint/no-unassigned-import, unicorn/consistent-function-scoping, unicorn/no-useless-spread, import/no-default-export -- migrated from the shrink spike; house-style rules that do not fit a synchronous TUI library (async-by-default), or are deferred (public-API JSDoc) for a follow-up
import {h, type VNode} from 'preact';
import {render as preactRender} from 'preact';
import '@clack/ui/dom'; // installs globalThis.document before any preact.render() call
import {Renderer, type RenderMetrics} from '@clack/ui';
import {
	setDeferPassiveEffects,
	drainPassiveEffects,
	isDeferPassiveEffects,
	act,
	onPreactFlush,
	__resetRefreshers,
} from '@clack/ui-preact';
import {AppContext, type AppContextValue} from './hooks/AppContext.ts';
import {StdoutContext} from './hooks/StdoutContext.ts';
import {StdinContext, type StdinContextValue} from './hooks/StdinContext.ts';
import {FocusProvider} from './hooks/FocusContext.ts';

export type {RenderMetrics};

type InkOptions = {
	stdout?: NodeJS.WriteStream;
	stdin?: NodeJS.ReadStream;
	debug?: boolean;
	patchConsole?: boolean;
	interactive?: boolean;
	concurrent?: boolean;
	alternateScreen?: boolean;
	maxFps?: number;
	onRender?: (metrics: RenderMetrics) => void;
	isScreenReaderEnabled?: boolean;
	exitOnCtrlC?: boolean;
};

export type Instance = ReturnType<Ink['getInstance']>;
export type RenderOptions = InkOptions;
export type RenderToStringOptions = {columns?: number};

/**
 * Test-only: forget all live renderers so a leaked instance from a prior test
 * can't receive a refresh on the shared Preact-flush trigger. Delegates to the
 * binding's registry (the trigger lives in @clack/ui-preact now).
 * @internal
 */
export function __resetInkInstances(): void {
	__resetRefreshers();
}

// ─── Ink class ────────────────────────────────────────────────────────────────
// The ink-compat wrapper. It owns the Preact mount, the App/Stdin/Stdout/Focus
// context providers, passive-effect timing, exit semantics, and the instance
// API. The frame pipeline (container → ops → ANSI → stdout) lives in the generic
// @clack/ui Renderer; the post-commit trigger lives in @clack/ui-preact.

class Ink {
	private readonly stdout: NodeJS.WriteStream;
	private readonly stdin: NodeJS.ReadStream;
	private readonly exitPromise: Promise<unknown>;
	private exitResolve!: (value: unknown) => void;
	private exitReject!: (error: unknown) => void;
	isUnmounted = false;
	private currentElement: VNode | null = null;
	private readonly renderer: Renderer;
	private readonly unregister: () => void;

	constructor(private readonly options: InkOptions) {
		this.stdout = options.stdout ?? process.stdout;
		this.stdin = (options.stdin ?? process.stdin) as NodeJS.ReadStream;
		this.renderer = new Renderer({
			stdout: this.stdout,
			debug: options.debug,
			interactive: options.interactive,
			isScreenReaderEnabled: options.isScreenReaderEnabled,
			onRender: options.onRender,
		});

		this.exitPromise = new Promise<unknown>((resolve, reject) => {
			this.exitResolve = resolve;
			this.exitReject = reject;
		});
		this.exitPromise.catch(() => {});

		// Refresh after every Preact commit. The trigger (debounceRendering patch)
		// lives in the binding; here we just say "produce a frame if anything
		// changed" — present() without force diff-skips an unchanged frame.
		this.unregister = onPreactFlush(() => {
			if (!this.isUnmounted && this.currentElement) this.renderer.present();
		});

		// Re-render on terminal resize so layout reflows to the new width.
		if (typeof (this.stdout as unknown as NodeJS.EventEmitter).on === 'function') {
			(this.stdout as unknown as NodeJS.EventEmitter).on('resize', this.onResize);
		}
	}

	private readonly onResize = (): void => {
		if (!this.isUnmounted) this.flushSync();
	};

	renderElement(element: VNode): void {
		this.currentElement = element;
		this.flushSync();
	}

	// Stable context values — recreating them each render would change identity
	// and force consumers (e.g. useInput's stdin listener) to re-subscribe,
	// dropping in-flight input.
	private _appCtx?: AppContextValue;
	private _stdinCtx?: StdinContextValue;
	private _stdoutCtx?: {stdout: NodeJS.WriteStream};

	private buildWrapped(): VNode {
		this._appCtx ??= {
			exit: this.exit.bind(this),
			waitUntilRenderFlush: () => Promise.resolve(),
		};
		this._stdinCtx ??= {
			stdin: this.stdin,
			setRawMode: (mode: boolean) => {
				if (typeof this.stdin.setRawMode === 'function') this.stdin.setRawMode(mode);
			},
			isRawModeSupported: Boolean(this.stdin.isTTY),
			internal_exitOnCtrlC: this.options.exitOnCtrlC ?? true,
		};
		this._stdoutCtx ??= {stdout: this.stdout};
		return h(
			AppContext.Provider,
			{value: this._appCtx},
			h(
				StdinContext.Provider,
				{value: this._stdinCtx},
				h(
					StdoutContext.Provider,
					{value: this._stdoutCtx},
					h(FocusProvider, null, this.currentElement!),
				),
			),
		);
	}

	private flushSync(): void {
		if (this.isUnmounted || !this.currentElement) return;

		// Defer passive effects until AFTER layout, so an effect that calls
		// measureElement() sees this frame's bounds (layout effects still run
		// during the render). Then drain — a deferred effect's setState
		// re-renders via the binding's flush trigger. If renderToString is already
		// driving the deferral, leave it to manage the capture/drain.
		const ownDefer = !isDeferPassiveEffects();
		if (ownDefer) setDeferPassiveEffects(true);
		try {
			// Real Preact reconciler — useEffect/useLayoutEffect fire naturally.
			preactRender(this.buildWrapped(), this.renderer.container as unknown as Element);
			// Initial render / rerender / resize always writes (force) + reports metrics.
			this.renderer.present({force: true, metrics: true});
		} finally {
			if (ownDefer) {
				setDeferPassiveEffects(false);
				drainPassiveEffects();
			}
		}
	}

	exit(errorOrResult?: unknown): void {
		if (this.isUnmounted) return;
		this.isUnmounted = true;
		this.renderer.isUnmounted = true;
		this.unregister();

		if (typeof (this.stdout as unknown as NodeJS.EventEmitter).off === 'function') {
			(this.stdout as unknown as NodeJS.EventEmitter).off('resize', this.onResize);
		}

		// Unmount the Preact tree so cleanup effects (useEffect returns) run.
		preactRender(null, this.renderer.container as unknown as Element);

		const isError =
			errorOrResult instanceof Error ||
			(errorOrResult !== null &&
				typeof errorOrResult === 'object' &&
				'message' in (errorOrResult as object));

		if (isError) {
			this.exitReject(errorOrResult);
		} else {
			this.exitResolve(errorOrResult);
		}
	}

	getInstance() {
		return {
			rerender: (element: VNode) => {
				this.currentElement = element;
				this.flushSync();
			},
			unmount: () => {
				this.exit();
			},
			waitUntilExit: () => this.exitPromise,
			waitUntilRenderFlush: () => Promise.resolve(),
			cleanup: () => {},
			lastFrame: () => this.renderer.lastOutput,
		};
	}
}

// ─── Public API ───────────────────────────────────────────────────────────────
// The single live pipeline. renderToString/renderToStringAsync mount through the
// real Preact reconciler (so effects fire), capture the frame, then unmount (so
// cleanups run) — no separate sync tree-walker.

/** Minimal stdout-like sink for off-screen string rendering. */
function createStringSink(columns: number): NodeJS.WriteStream {
	return {columns, isTTY: false, write: () => true} as unknown as NodeJS.WriteStream;
}

/** Create a live render instance (writes to stdout). */
export function render(element: VNode, options: RenderOptions = {}): Instance {
	const ink = new Ink(options);
	ink.renderElement(element);
	return ink.getInstance();
}

/**
 * Synchronous render to string. Mounts via the real reconciler: layout effects
 * (and the re-renders they trigger) are reflected, passive effects are deferred
 * past the captured frame, then drained so their cleanups run on unmount.
 */
export function renderToString(element: VNode, opts: RenderToStringOptions = {}): string {
	const sink = createStringSink(opts.columns ?? 80);
	setDeferPassiveEffects(true);
	try {
		const instance = render(element, {stdout: sink, debug: true});
		const frame = instance.lastFrame(); // layout effects applied; passive deferred
		drainPassiveEffects();               // run passive setups (registers cleanups)
		instance.unmount();                  // run effect cleanups
		return frame;
	} finally {
		setDeferPassiveEffects(false);
		drainPassiveEffects();               // flush anything queued at the boundary
	}
}

/** Async render to string — flushes effects and Suspense via act(). */
export async function renderToStringAsync(
	element: VNode,
	opts: RenderToStringOptions = {},
): Promise<string> {
	const sink = createStringSink(opts.columns ?? 80);
	let instance!: Instance;
	await act(async () => {
		instance = render(element, {stdout: sink, debug: true, concurrent: true});
	});
	const frame = instance.lastFrame();
	instance.unmount();
	return frame;
}
