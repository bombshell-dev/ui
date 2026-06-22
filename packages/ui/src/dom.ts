// oxlint-disable typescript/explicit-function-return-type, bombshell-dev/require-export-jsdoc, bombshell-dev/exported-function-async, bombshell-dev/no-generic-error -- migrated host module: synchronous IR walk + internal helpers; the bare-string throw is an intentional developer error
import type {TermNode, BoxProps, TextProps} from './ir.ts';

// ─── Fake DOM nodes ───────────────────────────────────────────────────────────

export class FakeTextNode {
	nodeType = 3 as const;
	parentNode: FakeElement | null = null;
	data: string;
	constructor(data: string) {
		this.data = data;
	}
	get nodeValue() { return this.data; }
	set nodeValue(v: string) { this.data = v; }
	// Preact computes insertion references via newDom.nextSibling; without it,
	// keyed inserts fall back to appendChild (node lands at the end).
	get nextSibling(): FakeElement | FakeTextNode | null {
		const p = this.parentNode;
		if (!p) return null;
		const i = p.children.indexOf(this);
		return i >= 0 ? (p.children[i + 1] ?? null) : null;
	}
}

export class FakeElement {
	nodeType = 1 as const;
	tagName: string;
	parentNode: FakeElement | null = null;
	children: (FakeElement | FakeTextNode)[] = [];
	style: Record<string, any> = {};
	[key: string]: any;

	constructor(tagName: string) {
		this.tagName = tagName.toLowerCase();
		// The `has` trap makes `name in element` always true →
		// Preact uses direct assignment instead of setAttribute, preserving numeric types.
		return new Proxy(this, {has: () => true});
	}

	appendChild<T extends FakeElement | FakeTextNode>(child: T): T {
		// Detach from any current parent first so a keyed move relocates the node
		// instead of duplicating it (real-DOM move semantics).
		if (child.parentNode) child.parentNode.removeChild(child);
		child.parentNode = this;
		this.children.push(child);
		return child;
	}

	insertBefore<T extends FakeElement | FakeTextNode>(
		child: T,
		ref: FakeElement | FakeTextNode | null,
	): T {
		// Detach before computing the ref index — Preact's keyed move calls
		// insertBefore on an already-attached node without a prior removeChild.
		if (child.parentNode) child.parentNode.removeChild(child);
		const idx = ref ? this.children.indexOf(ref as any) : -1;
		this.children.splice(idx >= 0 ? idx : this.children.length, 0, child);
		child.parentNode = this;
		return child;
	}

	removeChild<T extends FakeElement | FakeTextNode>(child: T): T {
		const idx = this.children.indexOf(child as any);
		if (idx >= 0) this.children.splice(idx, 1);
		return child;
	}

	setAttribute(name: string, value: any) { this[name] = value; }
	removeAttribute(name: string) { delete this[name]; }
	addEventListener() {}
	removeEventListener() {}
	dispatchEvent() { return true; }

	// Sibling/child traversal — Preact computes insertion references via
	// newDom.nextSibling; without it keyed inserts fall back to appendChild.
	get nextSibling(): FakeElement | FakeTextNode | null {
		const p = this.parentNode;
		if (!p) return null;
		const i = p.children.indexOf(this);
		return i >= 0 ? (p.children[i + 1] ?? null) : null;
	}
	get firstChild(): FakeElement | FakeTextNode | null {
		return this.children[0] ?? null;
	}
}

// ─── Fake document ────────────────────────────────────────────────────────────

const fakeDocument = {
	createElement: (tag: string) => new FakeElement(tag),
	createTextNode: (text: string) => new FakeTextNode(text),
	createElementNS: (_ns: string, tag: string) => new FakeElement(tag),
	createComment: () => new FakeTextNode(''),
	querySelector: (_sel: string) => null,
	querySelectorAll: (_sel: string) => [],
};

if (!globalThis.document) {
	Object.defineProperty(globalThis, 'document', {
		value: fakeDocument,
		writable: true,
		configurable: true,
	});
}

// This is the framework-agnostic host (@clack/ui/dom): the node model, the
// document shim a reconciler mounts into, and the host→IR walk. Host tags are
// neutral (tui-box/tui-text/tui-newline/tui-transform). The bare-string throw
// below is the default host policy (D4: shrink keeps it strict). Preact-specific
// scheduling lives in @clack/ui-preact.

// ─── TermNode extraction ──────────────────────────────────────────────────────

export function fakeNodesToTermNodes(nodes: (FakeElement | FakeTextNode)[]): TermNode[] {
	return nodes.flatMap(n => fakeNodeToTermNodes(n, false));
}

function fakeNodeToTermNodes(node: FakeElement | FakeTextNode, insideText: boolean): TermNode[] {
	if (node.nodeType === 3) {
		// data may be a number (Preact renders {0} via createTextNode(0)); coerce
		// and length-check so falsy-but-present values like 0 aren't dropped.
		const text = String((node as FakeTextNode).data ?? '');
		// Bare strings must live inside <Text> (matches ink).
		if (text.length > 0 && !insideText) {
			throw new Error(`Text string "${text}" must be rendered inside <Text> component`);
		}
		return text.length > 0 ? [{type: 'text', text, props: {}}] : [];
	}

	const el = node as FakeElement;
	const childInsideText = insideText || el.tagName === 'tui-text';
	const kids = el.children.flatMap(c => fakeNodeToTermNodes(c, childInsideText));

	switch (el.tagName) {
		case 'tui-box':
			return [{type: 'box', props: extractBoxProps(el), children: kids, dom: el}];
		case 'tui-text': {
			const text = extractTextContent(kids);
			return [{type: 'text', text, props: extractTextProps(el)}];
		}
		case 'tui-newline': {
			const count = (el.count as number | undefined) ?? 1;
			return [{type: 'box', props: {height: count + 1} as BoxProps, children: []}];
		}
		case 'tui-transform': {
			const fn = el.transform as ((s: string) => string) | undefined;
			return fn ? applyTransform(kids, fn) : kids;
		}
		default:
			// Context providers, fragments, unknown wrappers — pass children through
			return kids;
	}
}

// Preact writes a `style` object prop onto el.style (px-suffixing numbers, e.g.
// {marginLeft:1} → el.style.marginLeft = '1px'). ink host elements accept a
// style object, so merge style values (style takes precedence over direct attrs).
function styleVal(v: unknown): unknown {
	if (v === '' || v == null) return undefined;
	if (typeof v === 'number') return v;
	if (typeof v === 'string') {
		const m = /^(-?\d+(?:\.\d+)?)px$/.exec(v);
		if (m) return Number(m[1]);
	}
	return v;
}

function mergeStyle<T>(el: FakeElement, props: T): T {
	if (!el.style) return props;
	const target = props as Record<string, unknown>;
	for (const key in el.style) {
		const v = styleVal(el.style[key]);
		if (v !== undefined) target[key] = v;
	}
	return props;
}

function extractBoxProps(el: FakeElement): BoxProps {
	return mergeStyle(el, {
		flexDirection: el.flexDirection,
		flexGrow: el.flexGrow,
		flexShrink: el.flexShrink,
		flexBasis: el.flexBasis,
		aspectRatio: el.aspectRatio,
		alignItems: el.alignItems,
		alignContent: el.alignContent,
		justifyContent: el.justifyContent,
		padding: el.padding,
		paddingTop: el.paddingTop,
		paddingBottom: el.paddingBottom,
		paddingLeft: el.paddingLeft,
		paddingRight: el.paddingRight,
		paddingX: el.paddingX,
		paddingY: el.paddingY,
		margin: el.margin,
		marginTop: el.marginTop,
		marginBottom: el.marginBottom,
		marginLeft: el.marginLeft,
		marginRight: el.marginRight,
		marginX: el.marginX,
		marginY: el.marginY,
		width: el.width,
		height: el.height,
		minWidth: el.minWidth,
		maxWidth: el.maxWidth,
		minHeight: el.minHeight,
		maxHeight: el.maxHeight,
		display: el.display,
		position: el.position,
		top: el.top,
		left: el.left,
		right: el.right,
		bottom: el.bottom,
		overflow: el.overflow,
		overflowX: el.overflowX,
		overflowY: el.overflowY,
		alignSelf: el.alignSelf,
		borderStyle: el.borderStyle,
		borderColor: el.borderColor,
		borderDimColor: el.borderDimColor,
		borderTop: el.borderTop,
		borderBottom: el.borderBottom,
		borderLeft: el.borderLeft,
		borderRight: el.borderRight,
		borderTopColor: el.borderTopColor,
		borderBottomColor: el.borderBottomColor,
		borderLeftColor: el.borderLeftColor,
		borderRightColor: el.borderRightColor,
		borderTopDimColor: el.borderTopDimColor,
		borderBottomDimColor: el.borderBottomDimColor,
		borderLeftDimColor: el.borderLeftDimColor,
		borderRightDimColor: el.borderRightDimColor,
		backgroundColor: el.backgroundColor,
		gap: el.gap,
		'aria-hidden': el['aria-hidden'],
		'aria-label': el['aria-label'],
		'aria-role': el['aria-role'],
		'aria-state': el['aria-state'],
	});
}

function extractTextProps(el: FakeElement): TextProps {
	return mergeStyle(el, {
		color: el.color,
		bold: el.bold,
		italic: el.italic,
		dimColor: el.dimColor,
		underline: el.underline,
		strikethrough: el.strikethrough,
		inverse: el.inverse,
		wrap: el.wrap,
		'aria-label': el['aria-label'],
		'aria-hidden': el['aria-hidden'],
	});
}

function extractTextContent(nodes: TermNode[]): string {
	return nodes.map(n => {
		if (n.type === 'text') return n.text;
		if (n.type === 'box' || n.type === 'root') return extractTextContent((n as any).children ?? []);
		return '';
	}).join('');
}

function applyTransform(nodes: TermNode[], fn: (s: string) => string): TermNode[] {
	return nodes.map(n => {
		if (n.type === 'text') return {...n, text: fn(n.text)};
		if (n.type === 'box') return {...n, children: applyTransform(n.children, fn)};
		return n;
	});
}
