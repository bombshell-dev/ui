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
