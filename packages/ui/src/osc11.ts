// oxlint-disable bombshell-dev/exported-function-async -- pure synchronous helpers; async would be semantically wrong

/** 8-bit RGB, each channel 0–255. */
export interface Rgb {
	r: number;
	g: number;
	b: number;
}

/** Bytes to write to the terminal to request the background color (OSC 11). */
export const BACKGROUND_COLOR_QUERY: Uint8Array = new Uint8Array([
	0x1b,
	0x5d,
	0x31,
	0x31,
	0x3b,
	0x3f,
	0x07, // ESC ] 1 1 ; ? BEL
]);

// rgb:R/G/B or rgba:R/G/B/A — 1–4 hex digits per channel (alpha ignored).
const RGB_RE = /rgba?:([0-9a-f]{1,4})\/([0-9a-f]{1,4})\/([0-9a-f]{1,4})/i;
// #RGB, #RRGGBB, #RRRGGGBBB, #RRRRGGGGBBBB — equal-width channels.
const HASH_RE = /#([0-9a-f]{12}|[0-9a-f]{9}|[0-9a-f]{6}|[0-9a-f]{3})\b/i;

function scaleChannel(hex: string): number {
	const value = Number.parseInt(hex, 16);
	const max = 16 ** hex.length - 1;
	return Math.round((value / max) * 255);
}

/**
 * Extract an 8-bit RGB color from an OSC color response payload.
 * Scans for an X11 `rgb:`/`rgba:` spec or a `#`-hash color anywhere in the
 * input (string or Uint8Array) and tolerates BEL or ST framing. Does not
 * validate the OSC number. Returns undefined if no color is found.
 */
export function parseColorResponse(response: Uint8Array | string): Rgb | undefined {
	const text = typeof response === 'string' ? response : new TextDecoder().decode(response);

	const rgb = RGB_RE.exec(text);
	if (rgb) {
		return {
			r: scaleChannel(rgb[1]),
			g: scaleChannel(rgb[2]),
			b: scaleChannel(rgb[3]),
		};
	}

	const hash = HASH_RE.exec(text);
	if (hash) {
		const digits = hash[1];
		const width = digits.length / 3;
		return {
			r: scaleChannel(digits.slice(0, width)),
			g: scaleChannel(digits.slice(width, width * 2)),
			b: scaleChannel(digits.slice(width * 2)),
		};
	}

	return undefined;
}

/** Perceived luminance in 0–1 (sRGB-weighted). */
export function luminance(color: Rgb): number {
	return (0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b) / 255;
}

/** True when luminance < threshold (default 0.5). */
export function isDark(color: Rgb, threshold = 0.5): boolean {
	return luminance(color) < threshold;
}

export interface QueryBackgroundColorOptions {
	/** Read stream for the response. Default: process.stdin. */
	input?: NodeJS.ReadStream;
	/** Write stream for the query. Default: process.stdout. */
	output?: NodeJS.WriteStream;
	/** Milliseconds before giving up. Default: 100. */
	timeout?: number;
	/** Optional abort signal. */
	signal?: AbortSignal;
}

/**
 * Query the terminal's background color via OSC 11.
 *
 * Resolves the parsed color, or undefined on timeout, non-TTY, abort, or
 * unparsable response. Never rejects for environmental reasons.
 *
 * Consumes stdin while waiting, so run it as a one-shot probe at startup
 * before the main input loop takes over.
 */
export function queryBackgroundColor(
	options: QueryBackgroundColorOptions = {},
): Promise<Rgb | undefined> {
	const { input = process.stdin, output = process.stdout, timeout = 100, signal } = options;

	return new Promise<Rgb | undefined>((resolve) => {
		if (!input.isTTY || !output.isTTY) {
			resolve(undefined);
			return;
		}

		let buffer = new Uint8Array(0);
		let settled = false;
		const prevRaw = input.isRaw;
		const wasPaused = input.isPaused();

		function finish(result: Rgb | undefined): void {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			input.off('data', onData);
			signal?.removeEventListener('abort', onAbort);
			input.setRawMode(prevRaw);
			if (wasPaused) input.pause();
			resolve(result);
		}

		const onData = (chunk: Buffer): void => {
			const next = new Uint8Array(buffer.length + chunk.length);
			next.set(buffer);
			next.set(chunk, buffer.length);
			buffer = next;
			const color = parseColorResponse(buffer);
			if (color) finish(color);
		};

		const onAbort = (): void => finish(undefined);
		const timer = setTimeout(() => finish(undefined), timeout);

		if (signal) {
			if (signal.aborted) {
				finish(undefined);
				return;
			}
			signal.addEventListener('abort', onAbort);
		}

		input.setRawMode(true);
		input.resume();
		input.on('data', onData);
		output.write(BACKGROUND_COLOR_QUERY);
	});
}
