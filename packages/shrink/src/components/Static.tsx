// oxlint-disable bombshell-dev/exported-function-async, bombshell-dev/require-export-jsdoc, bombshell-dev/no-generic-error, typescript/explicit-function-return-type, eslint/no-underscore-dangle, eslint/max-params, eslint/no-unassigned-import, unicorn/consistent-function-scoping, unicorn/no-useless-spread, import/no-default-export -- migrated from the shrink spike; house-style rules that do not fit a synchronous TUI library (async-by-default), or are deferred (public-API JSDoc) for a follow-up
import {h, type ComponentChildren} from 'preact';

type Props<T> = {
	items: T[];
	children: (item: T, index: number) => ComponentChildren;
	style?: Record<string, unknown>;
};

export function Static<T>({items, children}: Props<T>) {
	return h('tui-box' as any, {flexDirection: 'column'}, ...items.map((item, i) => children(item, i)));
}
