import type { Op } from '@bomb.sh/tty';
import { Api } from './core/api.ts';
import type { Node } from './core/node.ts';
import { withResolvers, type WithResolvers } from './with-resolvers.ts';

/**
 * A coalescing, back-pressured stream of render frames.
 *
 * `request()` schedules a frame unless one is already pending. Requests made
 * while that frame is rendering are considered served by it. The frame becomes
 * complete when its render callback returns, before painting begins; requests
 * made during paint therefore coalesce into one subsequent frame.
 *
 * Consumers iterate over the API and await each paint before asking for the
 * next frame. This prevents rendering from outrunning terminal output while
 * still retaining changes requested during a slow paint. `render()` and
 * `paint()` are separate methods so decorators can observe or replace either
 * phase independently. Iteration ends when the constructor's signal aborts.
 */
export class RenderApi extends Api {
	aborted = withResolvers<IteratorReturnResult<void>>();
	current: Frame | undefined = undefined;
	resolvers: WithResolvers<IteratorYieldResult<Frame>> = withResolvers();

	constructor(node: Node, signal: AbortSignal) {
		super(node);
		signal.addEventListener('abort', () => this.aborted.resolve({ done: true, value: undefined }));
	}

	/** Requests a frame, coalescing with the current pending or rendering frame. */
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

	/** Runs layout within a frame and marks that frame served when layout finishes. */
	render(frame: Frame, callback: () => Op[]): Op[] {
		return frame.render(callback);
	}

	/** Runs the output phase; requests during it schedule the next frame. */
	paint<T>(callback: () => Promise<T>): Promise<T> {
		return callback();
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

export interface Frame {
	render<T>(callback: () => T): T;
}
