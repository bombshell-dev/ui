// oxlint-disable bombshell-dev/exported-function-async, bombshell-dev/require-export-jsdoc, bombshell-dev/no-generic-error, typescript/explicit-function-return-type, eslint/no-underscore-dangle, eslint/max-params, eslint/no-unassigned-import, unicorn/consistent-function-scoping, unicorn/no-useless-spread, import/no-default-export -- migrated from the shrink spike; house-style rules that do not fit a synchronous TUI library (async-by-default), or are deferred (public-API JSDoc) for a follow-up
import stripAnsi from 'strip-ansi';
import {type TermNode, type BoxProps} from './ir.ts';

type AriaState = Record<string, boolean | undefined>;

const STATE_LABELS: Record<string, string> = {
	busy: 'busy',
	checked: 'checked',
	disabled: 'disabled',
	expanded: 'expanded',
	multiline: 'multiline',
	multiselectable: 'multiselectable',
	readonly: 'readonly',
	required: 'required',
	selected: 'selected',
};

function statePrefix(state: AriaState): string {
	const active = Object.entries(state)
		.filter(([k, v]) => v === true && k in STATE_LABELS)
		.map(([k]) => `(${STATE_LABELS[k]!})`);
	return active.length > 0 ? active.join(' ') + ' ' : '';
}

function extractPlainText(node: TermNode): string {
	if (node.type === 'text') return stripAnsi(node.text);
	const sep = (node as {props?: BoxProps}).props?.flexDirection === 'column' ? '\n' : ' ';
	const parts = node.children
		.map(c => screenReaderText(c))
		.filter(s => s !== '');
	return parts.join(sep);
}

export function screenReaderText(node: TermNode): string {
	if (node.type === 'text') {
		// Text nodes may carry aria-label (e.g. <Text aria-label="..." />)
		const ariaLabel = (node.props as Record<string, unknown>)?.['aria-label'] as string | undefined;
		return ariaLabel ?? stripAnsi(node.text);
	}

	const props = (node as {props?: BoxProps}).props;
	if (!props) return extractPlainText(node);

	// aria-hidden and display:none both suppress the entire subtree
	if ((props as Record<string, unknown>)['aria-hidden']) return '';
	if (props.display === 'none') return '';

	// aria-label replaces children
	const label = (props as Record<string, unknown>)['aria-label'] as string | undefined;
	const role = (props as Record<string, unknown>)['aria-role'] as string | undefined;
	const state = (props as Record<string, unknown>)['aria-state'] as AriaState | undefined;

	const innerText = label ?? extractPlainText(node);
	const prefix = [
		role ? `${role}: ` : '',
		state ? statePrefix(state) : '',
	].join('');

	return prefix + innerText;
}

export function renderScreenReader(nodes: TermNode[]): string {
	const parts = nodes.map(n => screenReaderText(n)).filter(s => s !== '');
	return parts.join('\n');
}
