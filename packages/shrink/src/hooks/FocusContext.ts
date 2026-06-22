// oxlint-disable bombshell-dev/exported-function-async, bombshell-dev/require-export-jsdoc, bombshell-dev/no-generic-error, typescript/explicit-function-return-type, eslint/no-underscore-dangle, eslint/max-params, eslint/no-unassigned-import, unicorn/consistent-function-scoping, unicorn/no-useless-spread, import/no-default-export -- migrated from the shrink spike; house-style rules that do not fit a synchronous TUI library (async-by-default), or are deferred (public-API JSDoc) for a follow-up
import {createContext, type ComponentChildren, h} from 'preact';
import {useReducer, useCallback, useMemo} from 'preact/hooks';
import {useInput, type Key} from './useInput.ts';

type Focusable = {id: string; isActive: boolean};

export type FocusContextValue = {
	activeId: string | undefined;
	add: (id: string, opts: {autoFocus: boolean; isActive: boolean}) => void;
	remove: (id: string) => void;
	setActive: (id: string, isActive: boolean) => void;
	enableFocus: () => void;
	disableFocus: () => void;
	focusNext: () => void;
	focusPrevious: () => void;
	focus: (id: string) => void;
};

const noop = () => {};

export const FocusContext = createContext<FocusContextValue>({
	activeId: undefined,
	add: noop,
	remove: noop,
	setActive: noop,
	enableFocus: noop,
	disableFocus: noop,
	focusNext: noop,
	focusPrevious: noop,
	focus: noop,
});

type State = {
	enabled: boolean;
	activeId: string | undefined;
	focusables: Focusable[];
};

type Action =
	| {type: 'ADD'; id: string; autoFocus: boolean; isActive: boolean}
	| {type: 'REMOVE'; id: string}
	| {type: 'SET_ACTIVE'; id: string; isActive: boolean}
	| {type: 'ENABLE'}
	| {type: 'DISABLE'}
	| {type: 'FOCUS'; id: string}
	| {type: 'FOCUS_NEXT'}
	| {type: 'FOCUS_PREVIOUS'}
	| {type: 'UNFOCUS'};

// Next active focusable id after `fromId` in direction `dir` (wrapping), or undefined.
function nextActiveId(focusables: Focusable[], fromId: string | undefined, dir: 1 | -1): string | undefined {
	const count = focusables.length;
	if (count === 0) return undefined;
	const fromIndex = fromId ? focusables.findIndex(f => f.id === fromId) : (dir === 1 ? -1 : count);
	for (let step = 1; step <= count; step++) {
		const idx = (((fromIndex + dir * step) % count) + count) % count;
		const candidate = focusables[idx];
		if (candidate?.isActive) return candidate.id;
	}
	return undefined;
}

function reducer(state: State, action: Action): State {
	switch (action.type) {
		case 'ADD': {
			if (state.focusables.some(f => f.id === action.id)) return state; // idempotent
			const focusables = [...state.focusables, {id: action.id, isActive: action.isActive}];
			let {activeId} = state;
			if (action.autoFocus && action.isActive && state.enabled && activeId === undefined) {
				activeId = action.id;
			}
			return {...state, focusables, activeId};
		}

		case 'REMOVE': {
			const focusables = state.focusables.filter(f => f.id !== action.id);
			const activeId = state.activeId === action.id ? undefined : state.activeId;
			return {...state, focusables, activeId};
		}

		case 'SET_ACTIVE': {
			const focusables = state.focusables.map(f =>
				f.id === action.id ? {...f, isActive: action.isActive} : f,
			);
			const activeId = !action.isActive && state.activeId === action.id ? undefined : state.activeId;
			return {...state, focusables, activeId};
		}

		case 'ENABLE':
			return state.enabled ? state : {...state, enabled: true};

		case 'DISABLE':
			return state.enabled ? {...state, enabled: false} : state;

		case 'FOCUS': {
			const target = state.focusables.find(f => f.id === action.id);
			if (!target || !target.isActive) return state;
			return {...state, activeId: action.id};
		}

		case 'FOCUS_NEXT': {
			if (!state.enabled) return state;
			const activeId = nextActiveId(state.focusables, state.activeId, 1);
			return activeId === undefined ? state : {...state, activeId};
		}

		case 'FOCUS_PREVIOUS': {
			if (!state.enabled) return state;
			const activeId = nextActiveId(state.focusables, state.activeId, -1);
			return activeId === undefined ? state : {...state, activeId};
		}

		case 'UNFOCUS':
			return {...state, activeId: undefined};

		default:
			return state;
	}
}

export function FocusProvider({children}: {readonly children: ComponentChildren}) {
	const [state, dispatch] = useReducer(reducer, {
		enabled: true,
		activeId: undefined,
		focusables: [],
	});

	// Stable method refs (dispatch is stable) so consumer effects that depend on
	// them don't churn; only `activeId` changes the context value identity.
	const methods = useMemo(
		() => ({
			add: (id: string, opts: {autoFocus: boolean; isActive: boolean}) =>
				dispatch({type: 'ADD', id, autoFocus: opts.autoFocus, isActive: opts.isActive}),
			remove: (id: string) => dispatch({type: 'REMOVE', id}),
			setActive: (id: string, isActive: boolean) => dispatch({type: 'SET_ACTIVE', id, isActive}),
			enableFocus: () => dispatch({type: 'ENABLE'}),
			disableFocus: () => dispatch({type: 'DISABLE'}),
			focusNext: () => dispatch({type: 'FOCUS_NEXT'}),
			focusPrevious: () => dispatch({type: 'FOCUS_PREVIOUS'}),
			focus: (id: string) => dispatch({type: 'FOCUS', id}),
		}),
		[],
	);

	const value = useMemo<FocusContextValue>(
		() => ({activeId: state.activeId, ...methods}),
		[state.activeId, methods],
	);

	// Built-in keyboard navigation. Attach to stdin only while there is a
	// focusable and focus is enabled, so non-focus apps never touch stdin.
	const handleInput = useCallback((input: string, key: Key) => {
		const shiftTab = String.fromCharCode(27) + '[Z';
		if (input === shiftTab) {
			dispatch({type: 'FOCUS_PREVIOUS'});
		} else if (key.tab) {
			dispatch({type: 'FOCUS_NEXT'});
		} else if (key.escape) {
			dispatch({type: 'UNFOCUS'});
		}
	}, []);

	useInput(handleInput, {isActive: state.enabled && state.focusables.length > 0});

	return h(FocusContext.Provider, {value}, children);
}
