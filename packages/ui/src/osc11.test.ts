import { createMocks } from '@bomb.sh/tools/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
	BACKGROUND_COLOR_QUERY,
	isDark,
	luminance,
	parseColorResponse,
	queryBackgroundColor,
} from './osc11.js';

describe('BACKGROUND_COLOR_QUERY', () => {
	it('is the OSC 11 request sequence ESC ] 11 ; ? BEL', () => {
		expect(Array.from(BACKGROUND_COLOR_QUERY)).toEqual([0x1b, 0x5d, 0x31, 0x31, 0x3b, 0x3f, 0x07]);
	});
});

describe('parseColorResponse', () => {
	it('parses 4-digit rgb with BEL terminator', () => {
		expect(parseColorResponse('\x1b]11;rgb:0000/0000/0000\x07')).toEqual({
			r: 0,
			g: 0,
			b: 0,
		});
	});

	it('parses 4-digit rgb with ST terminator', () => {
		expect(parseColorResponse('\x1b]11;rgb:ffff/ffff/ffff\x1b\\')).toEqual({
			r: 255,
			g: 255,
			b: 255,
		});
	});

	it('parses a mid-range value', () => {
		expect(parseColorResponse('\x1b]11;rgb:1c1c/1c1c/1c1c\x07')).toEqual({
			r: 28,
			g: 28,
			b: 28,
		});
	});

	it('parses 2-digit channels', () => {
		expect(parseColorResponse('\x1b]11;rgb:ff/80/00\x07')).toEqual({
			r: 255,
			g: 128,
			b: 0,
		});
	});

	it('parses a bare response with no escape framing', () => {
		expect(parseColorResponse('rgb:fafa/fafa/fafa')).toEqual({
			r: 250,
			g: 250,
			b: 250,
		});
	});

	it('ignores the alpha channel of rgba', () => {
		expect(parseColorResponse('\x1b]11;rgba:ffff/0000/0000/8888\x07')).toEqual({
			r: 255,
			g: 0,
			b: 0,
		});
	});

	it('parses a #RRGGBB hash response', () => {
		expect(parseColorResponse('\x1b]11;#1c1c1c\x07')).toEqual({
			r: 28,
			g: 28,
			b: 28,
		});
	});

	it('parses a Uint8Array response', () => {
		const bytes = new TextEncoder().encode('\x1b]11;rgb:0000/0000/0000\x07');
		expect(parseColorResponse(bytes)).toEqual({ r: 0, g: 0, b: 0 });
	});

	it('parses a #RGB short hash', () => {
		expect(parseColorResponse('\x1b]11;#abc\x07')).toEqual({
			r: 170,
			g: 187,
			b: 204,
		});
	});

	it('rejects a hash with trailing hex digits', () => {
		expect(parseColorResponse('#1c1c1cff')).toBeUndefined();
	});

	it('returns undefined for unrecognizable input', () => {
		expect(parseColorResponse('garbage')).toBeUndefined();
		expect(parseColorResponse('')).toBeUndefined();
	});
});

describe('luminance / isDark', () => {
	it('treats black as dark and white as light', () => {
		expect(isDark({ r: 0, g: 0, b: 0 })).toBe(true);
		expect(isDark({ r: 255, g: 255, b: 255 })).toBe(false);
	});

	it('computes sRGB-weighted luminance in 0..1', () => {
		expect(luminance({ r: 0, g: 0, b: 0 })).toBe(0);
		expect(luminance({ r: 255, g: 255, b: 255 })).toBeCloseTo(1, 5);
	});

	it('respects a custom threshold', () => {
		const gray = { r: 128, g: 128, b: 128 };
		expect(isDark(gray, 0.9)).toBe(true);
		expect(isDark(gray, 0.1)).toBe(false);
	});
});

describe('queryBackgroundColor', () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	it('writes the query and resolves the parsed reply', async () => {
		const { input, output } = createMocks({
			input: { isTTY: true },
			output: { isTTY: true },
		});
		const promise = queryBackgroundColor({
			input: input as unknown as NodeJS.ReadStream,
			output: output as unknown as NodeJS.WriteStream,
		});
		// The data listener is attached synchronously; emit the reply.
		input.emit('data', Buffer.from('\x1b]11;rgb:1c1c/1c1c/1c1c\x07'));
		expect(await promise).toEqual({ r: 28, g: 28, b: 28 });
		expect(output.buffer.join('')).toContain(']11;?');
	});

	it('resolves undefined when output is not a TTY', async () => {
		const { input, output } = createMocks({
			input: { isTTY: true },
			output: { isTTY: false },
		});
		expect(
			await queryBackgroundColor({
				input: input as unknown as NodeJS.ReadStream,
				output: output as unknown as NodeJS.WriteStream,
			}),
		).toBeUndefined();
		expect(output.buffer.join('')).toBe('');
	});

	it('resolves undefined on timeout', async () => {
		vi.useFakeTimers();
		const { input, output } = createMocks({
			input: { isTTY: true },
			output: { isTTY: true },
		});
		const promise = queryBackgroundColor({
			input: input as unknown as NodeJS.ReadStream,
			output: output as unknown as NodeJS.WriteStream,
			timeout: 50,
		});
		await vi.advanceTimersByTimeAsync(50);
		expect(await promise).toBeUndefined();
	});

	it('resolves undefined when the signal is aborted', async () => {
		const { input, output } = createMocks({
			input: { isTTY: true },
			output: { isTTY: true },
		});
		const controller = new AbortController();
		const promise = queryBackgroundColor({
			input: input as unknown as NodeJS.ReadStream,
			output: output as unknown as NodeJS.WriteStream,
			signal: controller.signal,
		});
		controller.abort();
		expect(await promise).toBeUndefined();
	});

	it('resolves undefined when the signal is already aborted', async () => {
		const { input, output } = createMocks({
			input: { isTTY: true },
			output: { isTTY: true },
		});
		const result = await queryBackgroundColor({
			input: input as unknown as NodeJS.ReadStream,
			output: output as unknown as NodeJS.WriteStream,
			signal: AbortSignal.abort(),
		});
		expect(result).toBeUndefined();
		expect(output.buffer.join('')).toBe('');
	});
});
