import {fakeNodesToTermNodes, FakeElement} from './dom.ts';
import {termNodesToOps} from './ops.ts';
import {termRender} from './term.ts';
import {bsu, esu, shouldSynchronize} from './write-synchronized.ts';
import {renderScreenReader} from './screen-reader.ts';

export type RenderMetrics = {renderTime: number};

export type RendererOptions = {
	stdout: NodeJS.WriteStream;
	debug?: boolean;
	interactive?: boolean;
	isScreenReaderEnabled?: boolean;
	onRender?: (metrics: RenderMetrics) => void;
};

export type PresentOptions = {
	/** Write even if the frame is unchanged (initial render / rerender / resize). */
	force?: boolean;
	/** Fire onRender with timing for this frame. */
	metrics?: boolean;
};

/**
 * Framework-agnostic terminal renderer. Owns the host `container` a reconciler
 * mounts into, and turns the current container tree into a written frame
 * (host → TermNode walk → ops → ANSI → stdout). It knows nothing about any UI
 * framework: a binding mounts into `container`, then calls `present()`. The
 * binding also decides WHEN to present (after its commit); see @clack/ui-preact.
 */
export class Renderer {
	readonly container: FakeElement = new FakeElement('div');
	lastOutput = '';
	isUnmounted = false;
	private readonly stdout: NodeJS.WriteStream;
	private readonly options: RendererOptions;

	constructor(options: RendererOptions) {
		this.stdout = options.stdout;
		this.options = options;
	}

	/**
	 * Produce a frame from the current container and write it. With `force`, an
	 * unchanged frame is still written (initial render / rerender); without it, an
	 * unchanged frame is skipped (post-commit refresh). `metrics` fires onRender.
	 */
	present(opts: PresentOptions = {}): void {
		if (this.isUnmounted) return;
		const start = Date.now();
		const columns = this.stdout.columns ?? 80;
		const nodes = fakeNodesToTermNodes(this.container.children);

		if (this.options.isScreenReaderEnabled) {
			const output = renderScreenReader(nodes);
			this.lastOutput = output;
			this.stdout.write(output);
			if (opts.metrics) this.options.onRender?.({renderTime: Date.now() - start});
			return;
		}

		const ops = termNodesToOps(nodes, columns);
		const output = termRender(ops);
		if (!opts.force && output === this.lastOutput) return; // no-op if unchanged
		this.lastOutput = output;
		if (this.isUnmounted) return;

		// debug mode: single write, no sync sequences — tests use this to capture output
		if (this.options.debug) {
			this.stdout.write(output);
		} else {
			this.writeFrame(output);
		}
		if (opts.metrics) this.options.onRender?.({renderTime: Date.now() - start});
	}

	// Non-debug frame write: BSU / content / ESU as SEPARATE writes (like ink),
	// so write-capturing tests can filter the sync sequences from the content.
	private writeFrame(output: string): void {
		const sync = shouldSynchronize(this.stdout, this.options.interactive);
		if (sync) this.stdout.write(bsu);
		this.stdout.write(output + '\n');
		if (sync) this.stdout.write(esu);
	}
}
