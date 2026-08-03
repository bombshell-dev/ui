import { describe, expect, test } from 'vitest';
import { RenderFrames } from './render.ts';

describe('RenderFrames', () => {
	test('emits a requested frame whose render callback returns any value', async () => {
		const { controller, frames, iterator } = setup();
		const pending = iterator.next();
		const value = { arbitrary: true };

		await expectPending(pending);
		frames.request();

		const frame = await receive(pending);
		expect(frame.render(() => value)).toBe(value);
		controller.abort();
	});

	test('absorbs requests made inside the render callback', async () => {
		const { controller, frames, iterator } = setup();
		frames.request();
		const frame = await nextFrame(iterator);

		frame.render(() => {
			frames.request();
			frames.request();
			frames.request();
		});

		const pending = iterator.next();
		await expectPending(pending);

		frames.request();
		const next = await receive(pending);
		next.render(() => {});
		controller.abort();
	});

	test('coalesces requests made after rendering into one follow-up frame', async () => {
		const { controller, frames, iterator } = setup();
		frames.request();
		const frame = await nextFrame(iterator);
		frame.render(() => {});

		frames.request();
		frames.request();
		frames.request();

		const next = await nextFrame(iterator);
		next.render(() => {});
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
	const frames = new RenderFrames(controller.signal);
	const iterator = frames[Symbol.asyncIterator]();
	return { controller, frames, iterator };
}

async function nextFrame<T>(iterator: AsyncIterator<T>): Promise<T> {
	return receive(iterator.next());
}

async function receive<T>(result: PromiseLike<IteratorResult<T>>): Promise<T> {
	const item = await result;
	if (item.done) {
		throw new Error('render frame iterator stopped');
	}
	return item.value;
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
