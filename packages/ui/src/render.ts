import {
	fixed,
	type BoundingBox,
	type Op,
	type OpenElement,
	type RenderInfo,
	type RenderResult,
} from '@bomb.sh/tty';
import { createApi, id, type Node } from './core.ts';
import { getCachedLayout, layout } from './layout.ts';

export type RenderReason = 'structure' | 'property' | 'text' | 'focus' | 'manual';

export interface RenderRequest {
	node: Node;
	reason: RenderReason;
}

export const RenderApi = createApi('render', {
	requestRender(_node, _reason: RenderReason = 'manual'): void {},
	render(_, action: RenderAction): Op[] {
		return action.frame.render(action.callback);
	},
	paint(_, callback: () => Promise<RenderResult>): Promise<RenderResult> {
		return callback();
	},
});

export const { requestRender } = RenderApi.methods;

export interface RenderAction {
	frame: Frame;
	callback: () => Op[];
}

export interface Frame {
	readonly requests: readonly RenderRequest[];
	render<T>(callback: () => T): T;
}

/** A coalescing stream of requested render frames. */
export class RenderFrames implements AsyncIterable<Frame, void, void> {
	aborted = withResolvers<IteratorReturnResult<void>>();
	current: Frame | undefined = undefined;
	pending = new Map<Node, RenderReason>();
	resolvers: WithResolvers<IteratorYieldResult<Frame>> = withResolvers();

	constructor(signal: AbortSignal) {
		signal.addEventListener('abort', () => this.aborted.resolve({ done: true, value: undefined }));
	}

	request(node: Node = manualNode, reason: RenderReason = 'manual'): void {
		this.pending.set(node, mergeReason(this.pending.get(node), reason));
		if (!this.current) {
			this.publish();
		}
	}

	private publish(): void {
		const requests = [...this.pending.entries()].map(([node, reason]) => ({ node, reason }));
		this.pending.clear();
		const frame: Frame = {
			requests,
			render: (callback) => {
				try {
					return callback();
				} finally {
					this.current = undefined;
				}
			},
		};
		this.current = frame;
		this.resolvers.resolve({ done: false, value: frame });
		this.resolvers = withResolvers();
	}

	[Symbol.asyncIterator](): AsyncIterator<Frame, void, void> {
		return {
			next: () => {
				const frame = this.current
					? Promise.resolve({ done: false as const, value: this.current })
					: this.resolvers.promise;
				return Promise.race([frame, this.aborted.promise]);
			},
		};
	}
}

const manualNode = {} as Node;

function mergeReason(previous: RenderReason | undefined, next: RenderReason): RenderReason {
	if (!previous || previous === next) return next;
	if (previous === 'structure' || next === 'structure') return 'structure';
	if (previous === 'property' || next === 'property') return 'property';
	if (previous === 'text' || next === 'text') return 'text';
	if (previous === 'focus' || next === 'focus') return 'focus';
	return 'manual';
}

export interface RenderRegion {
	node: Node;
	bounds: BoundingBox;
}

export function collectRenderRegions(root: Node, info: RenderInfo): Map<Node, RenderRegion> {
	const regions = new Map<Node, RenderRegion>();
	collectRegion(root, { info, regions });
	return regions;
}

function collectRegion(
	node: Node,
	collection: { info: RenderInfo; regions: Map<Node, RenderRegion> },
): BoundingBox | undefined {
	const { info, regions } = collection;
	let bounds = info.get(id(node))?.bounds;
	for (const child of node.children) {
		bounds = unionBounds(bounds, collectRegion(child, collection));
	}
	if (bounds) regions.set(node, { node, bounds });
	return bounds;
}

function unionBounds(
	first: BoundingBox | undefined,
	second: BoundingBox | undefined,
): BoundingBox | undefined {
	if (!first) return second;
	if (!second) return first;
	const x = Math.min(first.x, second.x);
	const y = Math.min(first.y, second.y);
	return {
		x,
		y,
		width: Math.max(first.x + first.width, second.x + second.width) - x,
		height: Math.max(first.y + first.height, second.y + second.height) - y,
	};
}

export function getIndependentRegion(
	requests: readonly RenderRequest[],
	regions: ReadonlyMap<Node, RenderRegion>,
): Op[] | undefined {
	if (requests.length !== 1 || requests[0].reason !== 'text') return;

	for (let node: Node | undefined = requests[0].node; node; node = node.parent) {
		const region = regions.get(node);
		const operations = getCachedLayout(node) ?? [...layout(node)];
		const open = operations?.[0];
		if (!region || !isFixedRegion(open, node) || !operations) continue;

		return [
			{
				...open,
				width: fixed(region.bounds.width),
				height: fixed(region.bounds.height),
				floating: {
					x: region.bounds.x,
					y: region.bounds.y,
					attachTo: 'root',
				},
			},
			...operations.slice(1),
		];
	}
}

function isFixedRegion(operation: Op | undefined, node: Node): operation is OpenElement {
	if (!operation || operation.directive !== 2 || operation.id !== id(node)) return false;
	return operation.width?.type === 'fixed' && operation.height?.type === 'fixed';
}

interface WithResolvers<T> {
	promise: Promise<T>;
	resolve: (value: T | PromiseLike<T>) => void;
	reject: (reason?: unknown) => void;
}

function withResolvers<T>(): WithResolvers<T> {
	let resolve!: (value: T | PromiseLike<T>) => void;
	let reject!: (reason?: unknown) => void;

	const promise = new Promise<T>((res, rej) => {
		resolve = res;
		reject = rej;
	});

	return { promise, resolve, reject };
}
