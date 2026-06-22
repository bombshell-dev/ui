// oxlint-disable bombshell-dev/exported-function-async, bombshell-dev/require-export-jsdoc, bombshell-dev/no-generic-error, typescript/explicit-function-return-type, eslint/no-underscore-dangle, eslint/max-params, eslint/no-unassigned-import, unicorn/consistent-function-scoping, unicorn/no-useless-spread, import/no-default-export -- migrated from the shrink spike; house-style rules that do not fit a synchronous TUI library (async-by-default), or are deferred (public-API JSDoc) for a follow-up
import {createTerm, type Term, type Op, type RenderInfo} from 'clayterm';
import chalk from 'chalk';
import stripAnsi from 'strip-ansi';

// Bounds info from the most recent render — read by measureElement().
let lastInfo: RenderInfo | undefined;
export function getLastRenderInfo(): RenderInfo | undefined {
	return lastInfo;
}

// A single large term shared across all renders.
// mode:'line' (present_lines) emits every cell on each render without diffing,
// so sharing one term instance across multiple calls works correctly.
const LARGE_W = 500;
const LARGE_H = 200;

let sharedTerm: Term | null = null;
sharedTerm = await createTerm({width: LARGE_W, height: LARGE_H});

const decoder = new TextDecoder();

function cleanOutput(raw: string, contentHeight?: number): string {
	const lines = raw.split('\n').map(line => line.trimEnd());
	if (contentHeight != null && contentHeight > 0) {
		// Preserve exactly contentHeight rows so fixed-height boxes keep their blank lines
		return lines.slice(0, contentHeight).join('\n');
	}
	// Fallback: strip trailing blank lines
	let end = lines.length;
	while (end > 0 && lines[end - 1] === '') end--;
	return lines.slice(0, end).join('\n');
}

// Renders ops synchronously using the pre-warmed shared term.
// The root box must use fixed(columns) so layout is constrained to the right width.
export function termRender(ops: Op[]): string {
	if (!sharedTerm) throw new Error('Term not initialized');
	const result = sharedTerm.render(ops, {mode: 'line'});
	lastInfo = result.info;
	const raw = decoder.decode(result.output);
	const contentHeight = result.info.get('root')?.bounds?.height;
	const cleaned = cleanOutput(raw, contentHeight);
	if (chalk.level === 0) {
		// stripAnsi first, then per-line trimEnd: raw ANSI trimEnd doesn't remove
		// trailing spaces when an ANSI reset code follows (e.g. "Hello \x1b[0m").
		return stripAnsi(cleaned).split('\n').map(l => l.trimEnd()).join('\n');
	}
	return cleaned;
}

// Async path — used when color dimensions differ (currently always uses sharedTerm)
export async function renderToBytes(ops: Op[]): Promise<Uint8Array> {
	if (!sharedTerm) sharedTerm = await createTerm({width: LARGE_W, height: LARGE_H});
	return sharedTerm.render(ops, {mode: 'line'}).output;
}
