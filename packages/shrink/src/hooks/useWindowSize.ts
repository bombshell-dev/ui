// oxlint-disable bombshell-dev/exported-function-async, bombshell-dev/require-export-jsdoc, bombshell-dev/no-generic-error, typescript/explicit-function-return-type, eslint/no-underscore-dangle, eslint/max-params, eslint/no-unassigned-import, unicorn/consistent-function-scoping, unicorn/no-useless-spread, import/no-default-export -- migrated from the shrink spike; house-style rules that do not fit a synchronous TUI library (async-by-default), or are deferred (public-API JSDoc) for a follow-up
import {useState, useEffect} from 'preact/hooks';
import {useStdout} from './StdoutContext.ts';

export type WindowSize = {columns: number; rows: number};

// Resolve dimensions with fallbacks: the stream's own size, then the
// COLUMNS/LINES env vars, then a sane default. Guards against a 0/undefined
// size (non-TTY) so consumers always get a positive count.
function readSize(stdout: NodeJS.WriteStream | undefined): WindowSize {
	const columns = (stdout?.columns || Number(process.env.COLUMNS) || 80) | 0;
	const rows = (stdout?.rows || Number(process.env.LINES) || 24) | 0;
	return {columns: columns > 0 ? columns : 80, rows: rows > 0 ? rows : 24};
}

/** Current terminal dimensions, updating on stdout 'resize'. */
export function useWindowSize(): WindowSize {
	const {stdout} = useStdout();
	const [size, setSize] = useState<WindowSize>(() => readSize(stdout));

	useEffect(() => {
		if (!stdout) return;
		const onResize = () => setSize(readSize(stdout));
		const emitter = stdout as unknown as NodeJS.EventEmitter;
		emitter.on('resize', onResize);
		return () => {
			emitter.off('resize', onResize);
		};
	}, [stdout]);

	return size;
}
