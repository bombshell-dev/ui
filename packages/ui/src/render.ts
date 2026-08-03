import type { Op } from '@bomb.sh/tty';
import { createApi } from './core.ts';

export const RenderApi = createApi('render', {
	requestRender(_): void {},
	render(_, action: RenderAction): Op[] {
		return action.frame.render(action.callback);
	},
	paint(_, callback: () => Promise<void>): Promise<void> {
		return callback();
	},
});

export const { requestRender } = RenderApi.methods;

export interface RenderAction {
	frame: Frame;
	callback: () => Op[];
}

export interface Frame {
	render<T>(callback: () => T): T;
}

/** A coalescing stream of requested render frames. */
export class RenderFrames implements AsyncIterable<Frame, void, void> {
	aborted = withResolvers<IteratorReturnResult<void>>();
	current: Frame | undefined = undefined;
	resolvers: WithResolvers<IteratorYieldResult<Frame>> = withResolvers();

	constructor(signal: AbortSignal) {
		signal.addEventListener('abort', () => this.aborted.resolve({ done: true, value: undefined }));
	}

	request(): void {
		if (!this.current) {
			this.current = {
				render: (callback) => {
					try {
						return callback();
					} finally {
						this.current = undefined;
					}
				},
			};
			this.resolvers.resolve({ done: false, value: this.current });
			this.resolvers = withResolvers();
		}
	}

	[Symbol.asyncIterator](): AsyncIterator<Frame, void, void> {
		return {
			next: () => {
				const frame = this.current
					? Promise.resolve({
							done: false as const,
							value: this.current,
						})
					: this.resolvers.promise;
				return Promise.race([frame, this.aborted.promise]);
			},
		};
	}
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
