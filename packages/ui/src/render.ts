/**
 * Drives a single `for await` rendering loop.
 *
 * `request()` asks the loop to run. Multiple requests before the iterator
 * yields are combined into one pass through the loop.
 *
 * The caller renders and awaits its output write inside the loop. Any requests
 * made during that work cause one more pass after it finishes.
 *
 * Aborting the signal ends iteration.
 */
export class RenderApi {
	#signal: AbortSignal;
	#requested = Promise.withResolvers<void>();

	constructor(signal: AbortSignal) {
		this.#signal = signal;
		if (!signal.aborted) {
			signal.addEventListener('abort', () => this.#requested.resolve(), { once: true });
		}
	}

	/** Ask the rendering loop to run; repeated pending requests count as one. */
	request(): void {
		this.#requested.resolve();
	}

	async *[Symbol.asyncIterator](): AsyncGenerator<void, void, void> {
		while (!this.#signal.aborted) {
			await this.#requested.promise;
			if (this.#signal.aborted) {
				break;
			}

			// Collect requests for the next pass before handing control to the loop.
			this.#requested = Promise.withResolvers<void>();
			yield;
		}
	}
}
