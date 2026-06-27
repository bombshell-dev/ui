import type { WriteStream } from 'node:tty';
import { createTerm, type Op, type Term } from '@bomb.sh/tty';
import { type Child, normalizeChildren } from '../children.ts';
import { resolveIds } from './ids.ts';

export interface RenderRootOptions {
	/** Stream to write rendered frames to. Defaults to `process.stdout`. */
	output?: WriteStream;
	/** Render width in columns. Defaults to the output's column count. */
	width?: number;
	/** Render height in rows. Defaults to the output's row count. */
	height?: number;
}

/** Owns a tty terminal and its children; each {@link RenderRoot.render} re-renders the full op stream (diffing happens in `Term.render`). */
export class RenderRoot {
	#output: WriteStream;
	#width: number;
	#height: number;
	#term?: Term;
	#children: Op[] = [];

	constructor(options: RenderRootOptions = {}) {
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

	/** Pre-warm the terminal so the first {@link RenderRoot.render} is cheap. */
	async ready(): Promise<void> {
		await this.#getTerm();
	}

	/**
	 * Render `children` to the output, replacing the previous frame. Call with no
	 * arguments to re-render the current children (e.g. on resize).
	 */
	async render(...children: Child[]): Promise<void> {
		if (children.length > 0) this.#children = resolveIds(normalizeChildren(children));
		const term = await this.#getTerm();
		const { output } = term.render(this.#children, { mode: 'line' });
		this.#output.write(output);
	}
}
export async function createRoot(options?: Pick<RenderRootOptions, 'output'>): Promise<RenderRoot> {
	const root = new RenderRoot(options);
	await root.ready();
	return root;
}
