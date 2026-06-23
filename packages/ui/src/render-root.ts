import type { WriteStream } from 'node:tty';
import { createTerm, type Op, type Term } from '@bomb.sh/tty';
import { type Node, toOps } from './tree/to-ops.ts';

export interface RenderRootOptions {
	/** Stream to write rendered frames to. Defaults to `process.stdout`. */
	output?: WriteStream;
	/** Render width in columns. Defaults to the output's column count. */
	width?: number;
	/** Render height in rows. Defaults to the output's row count. */
	height?: number;
}

/**
 * Owns a `@bomb.sh/tty` terminal and turns an op-producing closure into written
 * output. Framework bindings supply a `produce` function (e.g. one that walks
 * their host tree via `toOps`) and call {@link RenderRoot.requestUpdate}
 * whenever the tree changes.
 *
 * Each `requestUpdate` hands the *entire* op stream to `Term.render`, which
 * diffs internally — so this re-walks and re-renders in full on every update.
 * That is intentional for proving the bindings out; coalescing happens at the
 * binding's commit hook, and finer-grained diffing is a later optimization.
 */
export class RenderRoot {
	#produce: () => Op[];
	#output: WriteStream;
	#width: number;
	#height: number;
	#term?: Term;

	constructor(produce: () => Op[], options: RenderRootOptions = {}) {
		this.#produce = produce;
		this.#output = options.output ?? process.stdout;
		this.#width = options.width ?? this.#output.columns ?? 80;
		this.#height = options.height ?? this.#output.rows ?? 24;
	}

	async #getTerm(): Promise<Term> {
		if (!this.#term) {
			this.#term = await createTerm({ width: this.#width, height: this.#height });
		}
		return this.#term;
	}

	/** Pre-warm the terminal so the first {@link RenderRoot.requestUpdate} is cheap. */
	async ready(): Promise<void> {
		await this.#getTerm();
	}

	/** Re-render the current tree and write the frame to the output. */
	async requestUpdate(): Promise<void> {
		const term = await this.#getTerm();
		const { output } = term.render(this.#produce(), { mode: 'line' });
		this.#output.write(output);
	}
}

/** A framework-free render root: pass `box`/`text` nodes to {@link Root.render}. */
export interface Root {
	/** Render `node`(s) to the output, replacing the previous frame. */
	render(node: Node | Node[]): void;
}

/**
 * Create a framework-free render root. Build a tree with `box`/`text` and hand
 * it to {@link Root.render}; resolves once the terminal is ready so the first
 * render paints immediately.
 */
export async function createRoot(output: WriteStream = process.stdout): Promise<Root> {
	let current: Node[] = [];
	const root = new RenderRoot(() => toOps(current), { output });
	await root.ready();
	return {
		render(node) {
			current = Array.isArray(node) ? node : [node];
			void root.requestUpdate();
		},
	};
}
