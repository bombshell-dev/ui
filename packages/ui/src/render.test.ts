import { describe, expect, test } from 'vitest';
import { Node } from './core.ts';
import { RenderApi } from './render.ts';

describe('RenderApi', () => {
	test('renders a requested frame and returns its terminal operations', async () => {
		const { controller, renderer, iterator } = setup();
		const pending = iterator.next();
		const value = [];

		await expectPending(pending);
		renderer.request();

		const frame = await receive(pending);
		expect(renderer.render(frame, () => value)).toBe(value);
		controller.abort();
	});

	test('absorbs requests made inside the render callback', async () => {
		const { controller, renderer, iterator } = setup();
		renderer.request();
		const frame = await nextFrame(iterator);

		renderer.render(frame, () => {
			renderer.request();
			renderer.request();
			renderer.request();
			return [];
		});

		const pending = iterator.next();
		await expectPending(pending);

		renderer.request();
		const next = await receive(pending);
		renderer.render(next, () => []);
		controller.abort();
	});

	test('coalesces requests made after rendering into one follow-up frame', async () => {
		const { controller, renderer, iterator } = setup();
		renderer.request();
		const frame = await nextFrame(iterator);
		renderer.render(frame, () => []);

		renderer.request();
		renderer.request();
		renderer.request();

		const next = await nextFrame(iterator);
		renderer.render(next, () => []);
		const pending = iterator.next();
		await expectPending(pending);
		controller.abort();
		await expect(pending).resolves.toEqual({ done: true, value: undefined });
	});

	test('stops waiting for frames when aborted', async () => {
		const { controller, iterator } = setup();
		const pending = iterator.next();

		controller.abort();

		await expect(pending).resolves.toEqual({ done: true, value: undefined });
	});
});

function setup() {
	const controller = new AbortController();
	const renderer = RenderApi.init(new Node(), controller.signal);
	const iterator = renderer[Symbol.asyncIterator]();
	return { controller, renderer, iterator };
}

async function nextFrame<T>(iterator: AsyncIterator<T>): Promise<T> {
	return receive(iterator.next());
}

async function receive<T>(result: PromiseLike<IteratorResult<T>>): Promise<T> {
	const item = await result;
	if (item.done) {
		throw new RenderFrameIteratorStoppedError();
	}
	return item.value;
}

class RenderFrameIteratorStoppedError extends Error {
	readonly code = 'CLACK_UI_TEST_RENDER_FRAME_ITERATOR_STOPPED';

	constructor() {
		super('render frame iterator stopped');
		this.name = 'RenderFrameIteratorStoppedError';
	}
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

	await new Promise<void>((resolve) => setImmediate(resolve));
	expect(settled).toBe(false);
}
