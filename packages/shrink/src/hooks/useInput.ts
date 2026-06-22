// oxlint-disable bombshell-dev/exported-function-async, bombshell-dev/require-export-jsdoc, bombshell-dev/no-generic-error, typescript/explicit-function-return-type, eslint/no-underscore-dangle, eslint/max-params, eslint/no-unassigned-import, unicorn/consistent-function-scoping, unicorn/no-useless-spread, import/no-default-export -- migrated from the shrink spike; house-style rules that do not fit a synchronous TUI library (async-by-default), or are deferred (public-API JSDoc) for a follow-up
import {useEffect} from 'preact/hooks';
import {useStdin} from './StdinContext.ts';

export type Key = {
	upArrow: boolean;
	downArrow: boolean;
	leftArrow: boolean;
	rightArrow: boolean;
	pageUp: boolean;
	pageDown: boolean;
	return: boolean;
	escape: boolean;
	ctrl: boolean;
	shift: boolean;
	meta: boolean;
	tab: boolean;
	backspace: boolean;
	delete: boolean;
	name: string;
	[key: string]: boolean | string;
};

export function useInput(
	handler: (input: string, key: Key) => void,
	options?: {isActive?: boolean},
): void {
	const {stdin, isRawModeSupported, setRawMode} = useStdin();
	const isActive = options?.isActive ?? true;

	useEffect(() => {
		if (!isActive) return;
		if (isRawModeSupported) setRawMode(true);

		// Node's readable-stream pattern (also what the test stdin emits): on
		// 'readable', drain chunks via read() until null.
		const onReadable = () => {
			let chunk: unknown;
			while ((chunk = (stdin as NodeJS.ReadStream).read()) !== null && chunk !== undefined) {
				const str = String(chunk);
				handler(str, parseKey(str));
			}
		};

		const emitter = stdin as unknown as NodeJS.EventEmitter;
		emitter.on('readable', onReadable);
		return () => {
			emitter.off('readable', onReadable);
			if (isRawModeSupported) setRawMode(false);
		};
	}, [isActive, handler, stdin, isRawModeSupported, setRawMode]);
}

function parseKey(input: string): Key {
	return {
		upArrow:    input === '\x1B[A',
		downArrow:  input === '\x1B[B',
		rightArrow: input === '\x1B[C',
		leftArrow:  input === '\x1B[D',
		pageUp:     input === '\x1B[5~',
		pageDown:   input === '\x1B[6~',
		return:     input === '\r' || input === '\n',
		escape:     input === '\x1B',
		ctrl:       false,
		shift:      false,
		meta:       false,
		tab:        input === '\t',
		backspace:  input === '\x7F' || input === '\x08',
		delete:     input === '\x1B[3~',
		name:       '',
	};
}
