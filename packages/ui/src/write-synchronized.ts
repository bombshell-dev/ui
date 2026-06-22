// oxlint-disable bombshell-dev/exported-function-async, bombshell-dev/require-export-jsdoc, bombshell-dev/no-generic-error, typescript/explicit-function-return-type, eslint/no-underscore-dangle, eslint/max-params, eslint/no-unassigned-import, unicorn/consistent-function-scoping, unicorn/no-useless-spread, import/no-default-export -- migrated from the shrink spike; house-style rules that do not fit a synchronous TUI library (async-by-default), or are deferred (public-API JSDoc) for a follow-up
import {type Writable} from 'node:stream';

export const bsu = '[?2026h';
export const esu = '[?2026l';

export function shouldSynchronize(stream: Writable, interactive?: boolean): boolean {
	const isTTY = 'isTTY' in stream && (stream as Writable & {isTTY: boolean}).isTTY === true;
	if (!isTTY) return false;
	if (interactive !== undefined) return interactive;
	// Avoid sync in CI environments
	return process.env['CI'] !== 'true' && process.env['CI'] !== '1';
}
