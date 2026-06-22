// oxlint-disable bombshell-dev/exported-function-async, bombshell-dev/require-export-jsdoc, bombshell-dev/no-generic-error, typescript/explicit-function-return-type, eslint/no-underscore-dangle, eslint/max-params, eslint/no-unassigned-import, unicorn/consistent-function-scoping, import/no-default-export -- migrated from the shrink spike; these house-style rules don't fit a synchronous TUI library (async-by-default primitives), or are deferred (public-API JSDoc) for a follow-up pass
import {rgba} from 'clayterm';

const NAMED_COLORS: Record<string, [number, number, number]> = {
	black:         [0,   0,   0],
	red:           [128, 0,   0],
	green:         [0,   128, 0],
	yellow:        [128, 128, 0],
	blue:          [0,   0,   128],
	magenta:       [128, 0,   128],
	cyan:          [0,   128, 128],
	white:         [192, 192, 192],
	gray:          [128, 128, 128],
	grey:          [128, 128, 128],
	blackBright:   [128, 128, 128],
	redBright:     [255, 0,   0],
	greenBright:   [0,   255, 0],
	yellowBright:  [255, 255, 0],
	blueBright:    [0,   0,   255],
	magentaBright: [255, 0,   255],
	cyanBright:    [0,   255, 255],
	whiteBright:   [255, 255, 255],
};

// Standard 16-color palette in ANSI index order (0–7 normal, 8–15 bright).
// Indexing Object.values(NAMED_COLORS) is wrong — the grey/gray alias shifts
// every entry from index 9 on (9 would be grey, not brightRed).
const ANSI_16: ReadonlyArray<readonly [number, number, number]> = [
	[0, 0, 0], [128, 0, 0], [0, 128, 0], [128, 128, 0],
	[0, 0, 128], [128, 0, 128], [0, 128, 128], [192, 192, 192],
	[128, 128, 128], [255, 0, 0], [0, 255, 0], [255, 255, 0],
	[0, 0, 255], [255, 0, 255], [0, 255, 255], [255, 255, 255],
];

function ansi256ToRgb(n: number): [number, number, number] {
	if (n < 16) {
		return (ANSI_16[n] ?? [0, 0, 0]) as [number, number, number];
	}

	if (n >= 232) {
		const v = (n - 232) * 10 + 8;
		return [v, v, v];
	}

	const idx = n - 16;
	const b = idx % 6;
	const g = Math.floor(idx / 6) % 6;
	const r = Math.floor(idx / 36);
	const toV = (x: number) => (x ? x * 40 + 55 : 0);
	return [toV(r), toV(g), toV(b)];
}

export function colorPropToRgba(color: string): number {
	const named = NAMED_COLORS[color];
	if (named) return rgba(named[0], named[1], named[2]);

	if (color.startsWith('#')) {
		const hex = color.slice(1);
		const expanded = hex.length === 3
			? hex.split('').map(c => c + c).join('')
			: hex;
		const n = Number.parseInt(expanded, 16);
		return rgba((n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff);
	}

	const rgbMatch = /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/.exec(color);
	if (rgbMatch) {
		return rgba(Number(rgbMatch[1]), Number(rgbMatch[2]), Number(rgbMatch[3]));
	}

	const a256Match = /^ansi256\((\d+)\)$/.exec(color);
	if (a256Match) {
		const [r, g, b] = ansi256ToRgb(Number(a256Match[1]));
		return rgba(r, g, b);
	}

	return rgba(255, 255, 255);
}
