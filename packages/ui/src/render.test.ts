import { describe, expect, test } from 'vitest';
import { RenderApi } from './render.ts';

describe('RenderApi', () => {
	test('waits while clean and yields void when requested', async () => {
		using fixture = setup();
		const { renderer, iterator } = fixture;
		const pending = iterator.next();

		await expectPending(pending);
		renderer.request();

		await expect(pending).resolves.toEqual({ done: false, value: undefined });
	});

	test('coalesces requests made before delivery without leaving an extra iteration', async () => {
		using fixture = setup();
		const { controller, renderer, iterator } = fixture;
		renderer.request();
		renderer.request();
		renderer.request();

		await expect(iterator.next()).resolves.toEqual({ done: false, value: undefined });
		const pending = iterator.next();
		await expectPending(pending);
		controller.abort();

		await expect(pending).resolves.toEqual({ done: true, value: undefined });
	});

	test('retains one follow-up request while the consumer awaits slow output', async () => {
		using fixture = setup();
		const { controller, renderer, iterator } = fixture;
		const output = Promise.withResolvers<void>();
		let iterations = 0;
		const consuming = (async () => {
			for await (const _ of iterator) {
				iterations++;
				// Stop an unexpected extra iteration so a regression cannot spin forever.
				if (iterations > 2) break;
				if (iterations === 1) await output.promise;
			}
		})();

		try {
			renderer.request();
			await nextTurn();
			expect(iterations).toBe(1);

			renderer.request();
			renderer.request();
			renderer.request();
			await nextTurn();
			expect(iterations).toBe(1);

			output.resolve();
			await nextTurn();
			expect(iterations).toBe(2);
		} finally {
			controller.abort();
			output.resolve();
			await consuming;
		}
	});

	test('abort ends a waiting iterator and later requests cannot restart it', async () => {
		using fixture = setup();
		const { controller, renderer, iterator } = fixture;
		const pending = iterator.next();
		controller.abort();

		await expect(pending).resolves.toEqual({ done: true, value: undefined });
		renderer.request();
		await expect(iterator.next()).resolves.toEqual({ done: true, value: undefined });
	});

	test('an already-aborted signal ignores requests before iteration', async () => {
		const controller = new AbortController();
		controller.abort();
		const renderer = new RenderApi(controller.signal);
		const iterator = renderer[Symbol.asyncIterator]();
		renderer.request();

		await expect(iterator.next()).resolves.toEqual({ done: true, value: undefined });
		renderer.request();
		await expect(iterator.next()).resolves.toEqual({ done: true, value: undefined });
	});

	test.each(['before iteration', 'while waiting'] as const)(
		'abort discards a pending request %s',
		async (phase) => {
			using fixture = setup();
			const { controller, renderer, iterator } = fixture;
			const pending = phase === 'while waiting' ? iterator.next() : undefined;
			renderer.request();
			controller.abort();
			renderer.request();

			await expect(pending ?? iterator.next()).resolves.toEqual({ done: true, value: undefined });
		},
	);
});

function setup(): {
	controller: AbortController;
	renderer: RenderApi;
	iterator: AsyncGenerator<void, void, void>;
	[Symbol.dispose](): void;
} {
	const controller = new AbortController();
	const renderer = new RenderApi(controller.signal);
	const iterator = renderer[Symbol.asyncIterator]();
	return {
		controller,
		renderer,
		iterator,
		[Symbol.dispose]() {
			controller.abort();
		},
	};
}

async function expectPending<T>(result: PromiseLike<T>): Promise<void> {
	let settled = false;
	void result.then(
		() => {
			settled = true;
		},
		() => {
			settled = true;
		},
	);

	await nextTurn();
	expect(settled).toBe(false);
}

// Drain promise continuations without sleeping for a wall-clock duration.
function nextTurn(): Promise<void> {
	return new Promise((resolve) => setImmediate(resolve));
}
