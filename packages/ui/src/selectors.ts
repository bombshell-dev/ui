// oxlint-disable bombshell-dev/exported-function-async -- DOM selector and ordering methods are synchronous.
import type { BrowserElement } from './browser-types.ts';

type Test = (element: BrowserElement, scope: BrowserElement) => boolean;
type Selector = { tests: Test[]; combinators: string[] };

/** Match the Host's supported CSS selector subset; unsupported syntax does not match. */
export function matchesSelector(element: BrowserElement, selector: string): boolean {
	const selectors = parse(selector);
	return selectors !== null && matches(element, { selectors, scope: element });
}

/** Query physical element descendants in document order, excluding the root itself. */
export function queryElements(root: BrowserElement, selector: string): BrowserElement[] {
	const selectors = parse(selector);
	const result: BrowserElement[] = [];
	if (!selectors) return result;
	function visit(parent: BrowserElement): void {
		for (const child of parent.children) {
			if (matches(child, { selectors: selectors!, scope: root })) result.push(child);
			visit(child);
		}
	}
	visit(root);
	return result;
}

/** Compare physical Host tree order using DOM document-position bit flags. */
export function compareDocumentPosition(element: BrowserElement, other: BrowserElement): number {
	if (element === other) return 0;
	function ancestors(node: BrowserElement): BrowserElement[] {
		const path = [node];
		while (node.parentElement) {
			node = node.parentElement;
			path.push(node);
		}
		return path.reverse();
	}
	const left = ancestors(element);
	const right = ancestors(other);
	if (left[0] !== right[0]) return 1;
	let index = 0;
	while (left[index] && left[index] === right[index]) index++;
	if (index === left.length) return 4 | 16;
	if (index === right.length) return 2 | 8;
	const siblings = left[index - 1]!.children;
	return siblings.indexOf(left[index]!) < siblings.indexOf(right[index]!) ? 4 : 2;
}

function matches(
	element: BrowserElement,
	{ selectors, scope }: { selectors: Selector[]; scope: BrowserElement },
): boolean {
	return selectors.some(({ tests, combinators }) => {
		function matchAt(node: BrowserElement, index: number): boolean {
			if (!tests[index]!(node, scope)) return false;
			if (index === 0) return true;
			if (combinators[index - 1] === '>') {
				return node.parentElement !== null && matchAt(node.parentElement, index - 1);
			}
			for (let parent = node.parentElement; parent; parent = parent.parentElement) {
				if (matchAt(parent, index - 1)) return true;
			}
			return false;
		}
		return matchAt(element, tests.length - 1);
	});
}

// Only split outside brackets, parentheses and quoted attribute values.
function tokenize(source: string): string[] | null {
	const tokens: string[] = [];
	const stack: string[] = [];
	let quote = '';
	let start = 0;
	for (let index = 0; index < source.length; index++) {
		const char = source[index]!;
		if (char === '\\') return null; // CSS escapes are outside this facade's subset.
		if (quote) {
			if (char === quote) quote = '';
			continue;
		}
		if (char === '"' || char === "'") {
			if (stack.length === 0) return null;
			quote = char;
		} else if (char === '[' || char === '(') stack.push(char);
		else if (char === ']' || char === ')') {
			if (stack.pop() !== (char === ']' ? '[' : '(')) return null;
		} else if (stack.length === 0 && (char === ',' || char === '>' || /\s/.test(char))) {
			if (index > start) tokens.push(source.slice(start, index));
			const delimiter = /\s/.test(char) ? ' ' : char;
			if (delimiter !== ' ' || tokens.at(-1) !== ' ') tokens.push(delimiter);
			start = index + 1;
		}
	}
	if (quote || stack.length) return null;
	if (start < source.length) tokens.push(source.slice(start));
	return tokens.filter(
		(token, index) =>
			token !== ' ' ||
			(index > 0 &&
				index < tokens.length - 1 &&
				!['>', ','].includes(tokens[index - 1]!) &&
				!['>', ','].includes(tokens[index + 1]!)),
	);
}

function parse(source: string): Selector[] | null {
	const tokens = tokenize(source.trim());
	if (!tokens?.length) return null;
	const selectors: Selector[] = [];
	let current: Selector = { tests: [], combinators: [] };
	let needsCompound = true;
	for (const token of tokens) {
		if (token === ',') {
			if (needsCompound) return null;
			selectors.push(current);
			current = { tests: [], combinators: [] };
			needsCompound = true;
		} else if (token === ' ' || token === '>') {
			if (needsCompound) return null;
			current.combinators.push(token);
			needsCompound = true;
		} else {
			if (!needsCompound) return null;
			const test = compound(token);
			if (!test) return null;
			current.tests.push(test);
			needsCompound = false;
		}
	}
	if (needsCompound) return null;
	selectors.push(current);
	return selectors;
}

function attribute(element: BrowserElement, name: string): string | null {
	const value = element.getAttribute(name);
	if (value !== null) return value;
	const alias = name === 'class' ? 'className' : name === 'tabindex' ? 'tabIndex' : null;
	if (alias === null) return null;
	const property = element.properties[alias];
	return property === undefined ? null : String(property ?? '');
}

function compound(source: string): Test | null {
	const tests: Test[] = [];
	const tag = /^(\*|[a-zA-Z][\w-]*)/.exec(source);
	if (tag) {
		if (tag[0] !== '*')
			tests.push((element) => element.tagName.toLowerCase() === tag[0].toLowerCase());
		source = source.slice(tag[0].length);
	}
	while (source) {
		const identity = /^([.#])((?:[a-zA-Z_]|-[a-zA-Z_-])[\w-]*)/.exec(source);
		if (identity) {
			const [, kind, value] = identity;
			tests.push((element) =>
				kind === '#'
					? attribute(element, 'id') === value
					: (attribute(element, 'class') ?? '').split(/\s+/).includes(value!),
			);
			source = source.slice(identity[0].length);
			continue;
		}
		const attr =
			/^\[\s*([\w-]+)\s*(?:(\^=|\$=|\*=|~=|\|=|=)\s*(?:"([^"]*)"|'([^']*)'|([^\s\]"']+))\s*)?\]/.exec(
				source,
			);
		if (attr) {
			const [, name, operator, doubleQuoted, singleQuoted, bare] = attr;
			const expected = doubleQuoted ?? singleQuoted ?? bare ?? '';
			tests.push((element) => {
				const value = attribute(element, name!.toLowerCase());
				if (value === null) return false;
				switch (operator) {
					case undefined:
						return true;
					case '=':
						return value === expected;
					case '^=':
						return expected !== '' && value.startsWith(expected);
					case '$=':
						return expected !== '' && value.endsWith(expected);
					case '*=':
						return expected !== '' && value.includes(expected);
					case '~=':
						return expected !== '' && !/\s/.test(expected) && value.split(/\s+/).includes(expected);
					case '|=':
						return value === expected || value.startsWith(`${expected}-`);
					default:
						return false;
				}
			});
			source = source.slice(attr[0].length);
			continue;
		}
		if (source.startsWith(':not(')) {
			let depth = 1;
			let quote = '';
			let end = 5;
			for (; end < source.length && depth; end++) {
				const char = source[end]!;
				if (quote) {
					if (char === quote) quote = '';
				} else if (char === '"' || char === "'") quote = char;
				else if (char === '(') depth++;
				else if (char === ')') depth--;
			}
			if (depth) return null;
			const negated = parse(source.slice(5, end - 1));
			if (!negated) return null;
			tests.push((element, scope) => !matches(element, { selectors: negated, scope }));
			source = source.slice(end);
			continue;
		}
		const pseudo = /^:(disabled|enabled|scope|first-child)(?![\w-])/.exec(source);
		if (!pseudo) return null;
		switch (pseudo[1]) {
			case 'disabled':
				tests.push((element) => isDisabled(element));
				break;
			case 'enabled':
				tests.push((element) => canDisable(element) && !isDisabled(element));
				break;
			case 'scope':
				tests.push((element, scope) => element === scope);
				break;
			case 'first-child':
				tests.push(
					(element) => !element.parentElement || element.parentElement.children[0] === element,
				);
				break;
		}
		source = source.slice(pseudo[0].length);
	}
	if (!tag && tests.length === 0) return null;
	return (element, scope) => tests.every((test) => test(element, scope));
}

function canDisable(element: BrowserElement): boolean {
	return ['button', 'input', 'select', 'textarea', 'fieldset', 'optgroup', 'option'].includes(
		element.name.toLowerCase(),
	);
}

function isDisabled(element: BrowserElement): boolean {
	if (!canDisable(element)) return false;
	if (element.disabled) return true;
	const name = element.name.toLowerCase();
	if (name === 'option') {
		return (
			element.parentElement?.name.toLowerCase() === 'optgroup' && element.parentElement.disabled
		);
	}
	if (name === 'optgroup') return false;
	for (let parent = element.parentElement; parent; parent = parent.parentElement) {
		if (parent.name.toLowerCase() !== 'fieldset' || !parent.disabled) continue;
		const legend = parent.children.find((child) => child.name.toLowerCase() === 'legend');
		let current: BrowserElement | null = element;
		while (current && current !== legend && current !== parent) current = current.parentElement;
		if (current !== legend) return true;
	}
	return false;
}
