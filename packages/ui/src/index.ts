import type { WriteStream } from 'node:tty';
import { setTimeout } from 'node:timers/promises';
import { createTerm, type Op, open, text, close, type Term } from '@bomb.sh/tty';

export interface Component {
	render(): Promise<Op[]>;
	appendChild(child: Component): void;
	removeChild(child: Component): void;
}

export class Box implements Component {
	#children: Component[] = [];

	constructor(children: Component[] = []) {
		this.#children = children;
	}

	async render(): Promise<Op[]> {
		const childrenRenderings = await Promise.all(this.#children.map((child) => child.render()));
		return [
			open('box', {
				border: {
					color: 15,
					left: 1,
					right: 1,
					top: 1,
					bottom: 1,
				},
				layout: {
					padding: {
						top: 1,
						bottom: 1,
						left: 1,
						right: 1,
					},
				},
			}),
			...childrenRenderings.flat(1),
			close(),
		];
	}

	appendChild(child: Component): void {
		this.#children.push(child);
	}

	removeChild(child: Component): void {
		const index = this.#children.indexOf(child);
		if (index !== -1) {
			this.#children.splice(index, 1);
		}
	}
}

export class ComponentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ComponentError';
  }
}

export class Text implements Component {
	#text: string;

	constructor(value: string) {
		this.#text = value;
	}

	async render(): Promise<Op[]> {
		return [text(this.#text, {})];
	}

	appendChild(): void {
		throw new ComponentError('Text component cannot have children.');
	}

	removeChild(): void {
		throw new ComponentError('Text component cannot have children.');
	}
}

export class RenderRoot implements Component {
	#children: Component[] = [];
	#output: WriteStream;
	#term?: Term;

	async #getTerm(): Promise<Term> {
		if (!this.#term) {
			this.#term = await createTerm({
				// TODO (jg): this needs to come from a `RenderRootOptions`
				height: this.#output.rows,
				width: this.#output.columns,
			});
		}
		return this.#term;
	}

	constructor(output: WriteStream = process.stdout) {
		this.#output = output;
	}

	async render(): Promise<Op[]> {
		const childrenRenderings = await Promise.all(this.#children.map((child) => child.render()));
		return childrenRenderings.flat(1);
	}

	appendChild(child: Component): void {
		this.#children.push(child);
	}

	removeChild(child: Component): void {
		const index = this.#children.indexOf(child);
		if (index !== -1) {
			this.#children.splice(index, 1);
		}
	}

	async requestUpdate(): Promise<void> {
		const result = await this.render();
		const term = await this.#getTerm();
		const rendered = term.render(result, {
			mode: 'line',
		});
		this.#output.write(rendered.output);
	}
}

export async function createRenderRoot(target: WriteStream = process.stdout): Promise<RenderRoot> {
	const component = new RenderRoot(target);
	return component;
}

// Example usage
const root = await createRenderRoot();
root.appendChild(new Box([new Text('Hello')]));
await root.requestUpdate();
await setTimeout(5000);
