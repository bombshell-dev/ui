// oxlint-disable bombshell-dev/exported-function-async, bombshell-dev/require-export-jsdoc, bombshell-dev/no-generic-error, typescript/explicit-function-return-type, eslint/no-underscore-dangle, eslint/max-params, eslint/no-unassigned-import, unicorn/consistent-function-scoping, unicorn/no-useless-spread, import/no-default-export -- migrated from the shrink spike; house-style rules that do not fit a synchronous TUI library (async-by-default), or are deferred (public-API JSDoc) for a follow-up
import {h, type ComponentChildren} from 'preact';
import {type TextProps} from '@clack/ui';

type Props = TextProps & {children?: ComponentChildren};

export function Text({children, ...props}: Props) {
	return h('tui-text' as any, props, children);
}
