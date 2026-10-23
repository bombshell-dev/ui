/* oxlint-disable bombshell-dev/exported-function-async */
import { PassThrough, Writable } from 'node:stream';
import type { Document, Element, Text } from '../src/dom.ts';
import { createUI, type UI } from '../src/ui.ts';

/** Wait until an asynchronous render callback has completed. */
export async function waitFor(predicate: () => boolean): Promise<void> {
	const deadline = performance.now() + 30_000;
	while (!predicate()) {
		if (performance.now() >= deadline) throw new RenderTimeoutError();
		await new Promise<void>((resolve) => setImmediate(resolve));
	}
}

// see the readme for explanation of tree shapes
export const shapes = ['grass', 'bamboo', 'bush', 'evergreen', 'maple', 'sequoia'] as const;
export type TreeShape = (typeof shapes)[number];
export const workloads = [
	'single value update',
	'batch 100 value updates',
	'add one component',
	'add 100-component subtree',
] as const;

interface WorkloadFixture {
	document: Document;
	root: Element;
	texts: Text[];
}

export interface UIWorkloadFixture extends WorkloadFixture {
	ui: UI;
	input: PassThrough;
	output: Writable;
	completedWrites(): number;
	start(): Promise<void>;
	close(): Promise<void>;
}

/** Apply one deterministic mutation to a benchmark fixture. */
export function applyWorkload({
	fixture,
	workload,
	iteration,
}: {
	fixture: WorkloadFixture;
	workload: (typeof workloads)[number];
	iteration: number;
}): void {
	switch (workload) {
		case 'single value update':
			fixture.texts[0]!.data = `updated ${iteration}`;
			break;
		case 'batch 100 value updates': {
			const start = Math.max(0, fixture.texts.length - 100);
			for (let index = start; index < fixture.texts.length; index++) {
				fixture.texts[index]!.data = `batch ${iteration} component ${index}`;
			}
			break;
		}
		case 'add one component': {
			const addedComponent = fixture.document.createElement('document');
			addedComponent.appendChild(fixture.document.createTextNode('added component'));
			fixture.root.appendChild(addedComponent);
			break;
		}
		case 'add 100-component subtree': {
			const addedSubtree = fixture.document.createElement('document');
			addedSubtree.appendChild(fixture.document.createTextNode('added subtree root'));
			for (let index = 0; index < 99; index++) {
				const component = fixture.document.createElement('document');
				component.appendChild(fixture.document.createTextNode(`added subtree component ${index}`));
				addedSubtree.appendChild(component);
			}
			fixture.root.appendChild(addedSubtree);
			break;
		}
		default:
			throw new UnsupportedBenchmarkOptionError('workload', workload);
	}
}

/** Create an in-memory UI and its workload tree without starting rendering. */
export async function setupUI(
	nodeCount: number,
	shape: (typeof shapes)[number],
): Promise<UIWorkloadFixture> {
	const input = new PassThrough();
	let writes = 0;
	const output = new Writable({
		write(_chunk, _encoding, callback) {
			setImmediate(() => {
				writes++;
				callback();
			});
		},
	});
	const ui = await createUI({ input, output, width: 80, height: 24 });
	const { texts } = createTree({ document: ui.document, nodeCount, shape });
	const initialWrites = writes;
	let started = false;
	return {
		document: ui.document,
		root: ui.document.documentElement,
		texts,
		ui,
		input,
		output,
		completedWrites: () => writes,
		async start() {
			if (started) return;
			started = true;
			void ui.main();
			await waitFor(() => writes > initialWrites);
		},
		async close() {
			await ui[Symbol.asyncDispose]();
			input.destroy();
			output.destroy();
		},
	};
}

/** Build one tree shape with the requested component count. */
export function createTree({
	document,
	nodeCount,
	shape,
}: {
	document: Document;
	nodeCount: number;
	shape: TreeShape;
}): { components: Element[]; texts: Text[] } {
	const root = document.documentElement;
	const nodes = Array.from({ length: nodeCount }, () => document.createElement('document'));
	const texts = nodes.map((_, index) => document.createTextNode(`component ${index}`));

	switch (shape) {
		case 'grass':
			for (let index = 0; index < nodeCount; index++) {
				nodes[index]!.appendChild(texts[index]!);
				root.appendChild(nodes[index]!);
			}
			break;
		case 'bamboo': {
			let parent = root;
			for (let index = 0; index < nodeCount; index++) {
				nodes[index]!.appendChild(texts[index]!);
				parent.appendChild(nodes[index]!);
				parent = nodes[index]!;
			}
			break;
		}
		case 'bush':
			for (let index = 0; index < nodeCount; index++) {
				nodes[index]!.appendChild(texts[index]!);
				const parentIndex = Math.floor((index - 1) / 2);
				(nodes[parentIndex] ?? root).appendChild(nodes[index]!);
			}
			break;
		case 'evergreen': {
			const trunkNodeCount = Math.ceil(nodeCount / 3);
			for (let index = 0; index < trunkNodeCount; index++) {
				nodes[index]!.appendChild(texts[index]!);
				(index === 0 ? root : nodes[index - 1]!).appendChild(nodes[index]!);
			}
			for (let index = trunkNodeCount; index < nodeCount; index++) {
				nodes[index]!.appendChild(texts[index]!);
				const trunkIndex = (index - trunkNodeCount) % trunkNodeCount;
				nodes[trunkIndex]!.appendChild(nodes[index]!);
			}
			break;
		}
		case 'maple': {
			const mainBranchCount = 4;
			const minorBranchesPerMain = 4;
			nodes[0]!.appendChild(texts[0]!);
			root.appendChild(nodes[0]!);

			for (let index = 1; index <= mainBranchCount; index++) {
				nodes[index]!.appendChild(texts[index]!);
				nodes[0]!.appendChild(nodes[index]!);
			}

			const minorBranchStart = mainBranchCount + 1;
			const leafStart = minorBranchStart + mainBranchCount * minorBranchesPerMain;
			for (let index = minorBranchStart; index < leafStart; index++) {
				nodes[index]!.appendChild(texts[index]!);
				const mainBranchIndex = 1 + Math.floor((index - minorBranchStart) / minorBranchesPerMain);
				nodes[mainBranchIndex]!.appendChild(nodes[index]!);
			}

			for (let index = leafStart; index < nodeCount; index++) {
				nodes[index]!.appendChild(texts[index]!);
				const minorBranchIndex =
					minorBranchStart + ((index - leafStart) % (leafStart - minorBranchStart));
				nodes[minorBranchIndex]!.appendChild(nodes[index]!);
			}
			break;
		}
		case 'sequoia': {
			const trunkNodeCount = Math.floor((nodeCount * 3) / 4);
			const crownRootIndex = trunkNodeCount - 1;
			for (let index = 0; index < trunkNodeCount; index++) {
				nodes[index]!.appendChild(texts[index]!);
				(index === 0 ? root : nodes[index - 1]!).appendChild(nodes[index]!);
			}

			const mainBranchCount = 4;
			const minorBranchesPerMain = 4;
			const mainBranchStart = trunkNodeCount;
			const minorBranchStart = mainBranchStart + mainBranchCount;
			const leafStart = minorBranchStart + mainBranchCount * minorBranchesPerMain;
			for (let index = mainBranchStart; index < minorBranchStart; index++) {
				nodes[index]!.appendChild(texts[index]!);
				nodes[crownRootIndex]!.appendChild(nodes[index]!);
			}
			for (let index = minorBranchStart; index < leafStart; index++) {
				nodes[index]!.appendChild(texts[index]!);
				const mainBranchIndex =
					mainBranchStart + Math.floor((index - minorBranchStart) / minorBranchesPerMain);
				nodes[mainBranchIndex]!.appendChild(nodes[index]!);
			}
			for (let index = leafStart; index < nodeCount; index++) {
				nodes[index]!.appendChild(texts[index]!);
				const minorBranchIndex =
					minorBranchStart + ((index - leafStart) % (leafStart - minorBranchStart));
				nodes[minorBranchIndex]!.appendChild(nodes[index]!);
			}
			break;
		}
		default:
			throw new UnsupportedBenchmarkOptionError('tree shape', shape);
	}

	return { components: nodes, texts };
}

class RenderTimeoutError extends Error {
	constructor() {
		super('Timed out waiting for a rendered frame');
		this.name = 'RenderTimeoutError';
	}
}

class UnsupportedBenchmarkOptionError extends Error {
	readonly code = 'UNSUPPORTED_BENCHMARK_OPTION';

	constructor(option: string, value: unknown) {
		super(`Unsupported benchmark ${option}: ${String(value)}`);
		this.name = 'UnsupportedBenchmarkOptionError';
	}
}
