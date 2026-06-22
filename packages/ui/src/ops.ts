// oxlint-disable bombshell-dev/exported-function-async, bombshell-dev/require-export-jsdoc, bombshell-dev/no-generic-error, typescript/explicit-function-return-type, eslint/no-underscore-dangle, eslint/max-params, eslint/no-unassigned-import, unicorn/consistent-function-scoping, unicorn/no-useless-spread, import/no-default-export -- migrated from the shrink spike; house-style rules that do not fit a synchronous TUI library (async-by-default), or are deferred (public-API JSDoc) for a follow-up
import {open, text, close, fit, grow, fixed, percent, rgba, type Op, type SizingAxis} from 'clayterm';

// open()'s props are optional; index the non-null form for sub-types.
type OpenProps = NonNullable<Parameters<typeof open>[1]>;
import {type TermNode, type BoxNode, type BoxProps, type TextProps} from './ir.ts';
import {colorPropToRgba} from './color.ts';
import {sanitizeAnsi} from './sanitize.ts';
import {stringWidth, sliceStartByWidth, sliceEndByWidth} from './string-width.ts';

const TEXT_ATTRS = {
	bold:          1 << 0,
	italic:        1 << 1,
	underline:     1 << 2,
	strikethrough: 1 << 3,
	inverse:       1 << 4,
	dim:           1 << 5,
};

let _boxId = 0;

export function termNodesToOps(nodes: TermNode[], termWidth: number): Op[] {
	_boxId = 0;
	// Top-level children fill the full terminal width by default (like ink's column root).
	// Nested children default to fit() — passed via the fill parameter.
	const topFill = fixed(termWidth);
	return [
		open('root', {layout: {width: fixed(termWidth), direction: 'ltr'}}),
		...nodes.flatMap(n => nodeToOps(n, termWidth, topFill)),
		close(),
	];
}

function nodeToOps(node: TermNode, availableWidth?: number, fill: SizingAxis = fit(), parentIsColumn = false, availableHeight?: number): Op[] {
	if (node.type === 'root') return node.children.flatMap(n => nodeToOps(n, availableWidth, fill, parentIsColumn, availableHeight));
	if (node.type === 'text') return [textNodeToOp(node.text, node.props, availableWidth)];

	// Box
	const {props, children} = node;
	if (props.display === 'none') return [];

	const isColumn = props.flexDirection === 'column' || props.flexDirection === 'column-reverse';
	const layoutProps = boxPropsToLayout(props, fill, parentIsColumn);
	const bg = props.backgroundColor ? colorPropToRgba(props.backgroundColor) : undefined;
	const borderDecor = makeBorder(props);
	const clipH = props.overflow === 'hidden' || props.overflowX === 'hidden';
	const clipV = props.overflow === 'hidden' || props.overflowY === 'hidden';
	const clip = (clipH || clipV) ? {horizontal: clipH, vertical: clipV} : undefined;

	// Account for padding + margin + border when computing the available area for children.
	const bpL = (props.borderStyle && props.borderLeft   !== false) ? 1 : 0;
	const bpR = (props.borderStyle && props.borderRight  !== false) ? 1 : 0;
	const bpT = (props.borderStyle && props.borderTop    !== false) ? 1 : 0;
	const bpB = (props.borderStyle && props.borderBottom !== false) ? 1 : 0;
	const effPL = (props.paddingLeft   ?? props.paddingX ?? props.padding ?? 0) + (props.marginLeft   ?? props.marginX ?? props.margin ?? 0) + bpL;
	const effPR = (props.paddingRight  ?? props.paddingX ?? props.padding ?? 0) + (props.marginRight  ?? props.marginX ?? props.margin ?? 0) + bpR;
	const effPT = (props.paddingTop    ?? props.paddingY ?? props.padding ?? 0) + (props.marginTop    ?? props.marginY ?? props.margin ?? 0) + bpT;
	const effPB = (props.paddingBottom ?? props.paddingY ?? props.padding ?? 0) + (props.marginBottom ?? props.marginY ?? props.margin ?? 0) + bpB;
	const padLR = effPL + effPR;
	const padTB = effPT + effPB;
	let childWidth = typeof props.width === 'number'
		? props.width - padLR
		: availableWidth != null ? availableWidth - padLR : undefined;
	// maxWidth caps the inner content width so long text rewraps within the box.
	if (typeof props.maxWidth === 'number') {
		const innerMax = props.maxWidth - padLR;
		childWidth = childWidth == null ? innerMax : Math.min(childWidth, innerMax);
	}
	const childHeight = typeof props.height === 'number'
		? props.height - padTB
		: availableHeight != null ? availableHeight - padTB : undefined;

	// position:absolute → clayterm floating. Element top-left attaches to the
	// parent content origin (attachPoints:0); right/bottom resolve against the
	// parent's inner box minus this element's own measured size.
	let floating: OpenProps['floating'];
	if (props.position === 'absolute') {
		const pw = availableWidth ?? 0;
		const ph = availableHeight ?? 0;
		const size = measureNode(node);
		// Preact clears a prop by assigning '' (not undefined), so treat empty/null
		// as "unset" — otherwise a cleared right/bottom would resolve to the far edge.
		const isSet = (v: unknown) => v !== undefined && v !== null && v !== '';
		let x = 0;
		let y = 0;
		if (isSet(props.left)) x = resolveOffset(props.left!, pw);
		else if (isSet(props.right)) x = pw - size.width - resolveOffset(props.right!, pw);
		if (isSet(props.top)) y = resolveOffset(props.top!, ph);
		else if (isSet(props.bottom)) y = ph - size.height - resolveOffset(props.bottom!, ph);
		floating = {x, y, attachTo: 1, attachPoints: 0};
	}

	// row/column-reverse: clayterm has no reverse direction, so pre-reverse the
	// children (boxPropsToLayout already defaults the main axis to flex-end).
	const isReverse = props.flexDirection === 'row-reverse' || props.flexDirection === 'column-reverse';
	let effChildren: TermNode[] = isReverse ? [...children].toReversed() : children;

	// justifyContent space-between/space-evenly: clayterm has no space
	// distribution, so inject grow() spacers (workaround; true fix is clayterm).
	if ((props.justifyContent === 'space-between' || props.justifyContent === 'space-evenly') && effChildren.length > 1) {
		const spacer = (): TermNode => ({type: 'box', props: {__spacer: true} as unknown as BoxProps, children: []});
		const evenly = props.justifyContent === 'space-evenly';
		const out: TermNode[] = [];
		if (evenly) out.push(spacer());
		effChildren.forEach((c, i) => {
			out.push(c);
			if (i < effChildren.length - 1 || evenly) out.push(spacer());
		});
		effChildren = out;
	}

	// A child's alignSelf (flex-start/end/center, baseline→start) overrides the
	// parent's cross-axis alignment. Single-child case; multi-child divergent
	// alignSelf needs per-child support (clayterm).
	const selfChild = children.find(
		c => c.type === 'box' && !!c.props.alignSelf && c.props.alignSelf !== 'auto' && c.props.alignSelf !== 'stretch',
	) as BoxNode | undefined;
	if (selfChild && layoutProps) {
		const sa = selfChild.props.alignSelf === 'baseline' ? 'flex-start' : selfChild.props.alignSelf;
		const a = alignToNum(sa);
		if (a !== undefined) {
			if (isColumn) layoutProps.alignX = a;
			else layoutProps.alignY = a;
		}
	}

	const cornerRadius = makeCornerRadius(props);
	const id = `box_${_boxId++}`;
	// Stamp the clay element id onto the source host element so measureElement()
	// can look up this box's laid-out bounds from the render info.
	if (node.dom) (node.dom as {__clayId?: string}).__clayId = id;
	return [
		open(id, {layout: layoutProps, bg, border: borderDecor, clip, cornerRadius, floating}),
		...effChildren.flatMap(n => nodeToOps(n, childWidth, fit(), isColumn, childHeight)),
		close(),
	];
}

// Resolve a positional offset (number of cells, or a percent string of the
// parent dimension) to an integer number of cells.
function resolveOffset(value: number | string, dimension: number): number {
	if (typeof value === 'number') return value;
	if (typeof value === 'string' && value.endsWith('%')) {
		return Math.round((Number.parseFloat(value) / 100) * dimension);
	}
	return 0;
}

// Best-effort intrinsic size of a subtree (display columns × rows), used to
// resolve right/bottom offsets for absolutely-positioned boxes.
function measureNode(node: TermNode): {width: number; height: number} {
	if (node.type === 'text') {
		const lines = node.text.split('\n');
		return {width: Math.max(0, ...lines.map(l => l.length)), height: lines.length};
	}
	const children = node.type === 'root' ? node.children : node.children;
	const props = node.type === 'box' ? node.props : ({} as BoxProps);
	if (props.display === 'none') return {width: 0, height: 0};

	const isColumn = props.flexDirection === 'column' || props.flexDirection === 'column-reverse';
	const kids = children.map(measureNode);
	const gap = props.gap ?? 0;
	let w: number;
	let h: number;
	if (isColumn) {
		w = Math.max(0, ...kids.map(k => k.width));
		h = kids.reduce((s, k) => s + k.height, 0) + gap * Math.max(0, kids.length - 1);
	} else {
		w = kids.reduce((s, k) => s + k.width, 0) + gap * Math.max(0, kids.length - 1);
		h = Math.max(0, ...kids.map(k => k.height));
	}
	const bpL = (props.borderStyle && props.borderLeft   !== false) ? 1 : 0;
	const bpR = (props.borderStyle && props.borderRight  !== false) ? 1 : 0;
	const bpT = (props.borderStyle && props.borderTop    !== false) ? 1 : 0;
	const bpB = (props.borderStyle && props.borderBottom !== false) ? 1 : 0;
	w += (props.paddingLeft ?? props.paddingX ?? props.padding ?? 0) + (props.paddingRight  ?? props.paddingX ?? props.padding ?? 0) + bpL + bpR;
	h += (props.paddingTop  ?? props.paddingY ?? props.padding ?? 0) + (props.paddingBottom ?? props.paddingY ?? props.padding ?? 0) + bpT + bpB;
	if (typeof props.width === 'number') w = props.width;
	if (typeof props.height === 'number') h = props.height;
	return {width: w, height: h};
}

function textNodeToOp(content: string, props: TextProps, availableWidth?: number): Op {
	let attrs = 0;
	if (props.bold)          attrs |= TEXT_ATTRS.bold;
	if (props.italic)        attrs |= TEXT_ATTRS.italic;
	if (props.underline)     attrs |= TEXT_ATTRS.underline;
	if (props.strikethrough) attrs |= TEXT_ATTRS.strikethrough;
	if (props.inverse)       attrs |= TEXT_ATTRS.inverse;
	if (props.dimColor)      attrs |= TEXT_ATTRS.dim;

	let finalContent = sanitizeAnsi(content);
	let wrapMode: number | undefined;

	// Clay wrap modes: 0=WORDS, 1=NEWLINES, 2=NONE. Truncation measures by
	// DISPLAY width (wide CJK/emoji count as 2) and never splits a wide char.
	if (props.wrap === 'truncate' || props.wrap === 'truncate-end') {
		if (availableWidth != null && stringWidth(content) > availableWidth) {
			finalContent = sliceStartByWidth(content, availableWidth - 1) + '…';
		}
		wrapMode = 2;
	} else if (props.wrap === 'truncate-middle') {
		if (availableWidth != null && stringWidth(content) > availableWidth) {
			const half = Math.floor((availableWidth - 1) / 2);
			finalContent = sliceStartByWidth(content, half) + '…' + sliceEndByWidth(content, availableWidth - 1 - half);
		}
		wrapMode = 2;
	} else if (props.wrap === 'truncate-start') {
		if (availableWidth != null && stringWidth(content) > availableWidth) {
			finalContent = '…' + sliceEndByWidth(content, availableWidth - 1);
		}
		wrapMode = 2;
	} else if (props.wrap === 'wrap') {
		wrapMode = 0; // WORDS
	} else {
		// Default: WORDS wrap; fall back to char-level for unbreakable long text
		if (availableWidth != null && content.length > availableWidth && !/\s/.test(content)) {
			finalContent = (content.match(new RegExp(`.{1,${Math.max(1, availableWidth)}}`, 'g')) ?? [content]).join('\n');
			wrapMode = 1; // NEWLINES to honour the inserted breaks
		} else {
			wrapMode = 0; // WORDS
		}
	}

	return text(finalContent, {
		color: props.color ? colorPropToRgba(props.color) : undefined,
		attrs: attrs || undefined,
		wrap: wrapMode,
	});
}

function sizingAxis(value: number | string | undefined, fallback: SizingAxis, min?: number, max?: number): SizingAxis {
	if (value === undefined) {
		// Apply min/max to fit/grow fallbacks
		if ((fallback.type === 'fit' || fallback.type === 'grow') && (min !== undefined || max !== undefined)) {
			return fallback.type === 'grow' ? grow(min, max) : fit(min, max);
		}
		return fallback;
	}
	if (typeof value === 'number') return fixed(value);
	// clayterm percent() expects a 0..1 fraction; ink uses 0..100 strings.
	if (typeof value === 'string' && value.endsWith('%')) return percent(Number.parseFloat(value) / 100);
	return fallback;
}

function boxPropsToLayout(props: BoxProps, fill: SizingAxis = fit(), parentIsColumn = false): OpenProps['layout'] {
	// Injected justify-content spacer: grows along the PARENT's main axis only.
	if ((props as {__spacer?: boolean}).__spacer) {
		return {
			direction: parentIsColumn ? 'ttb' : 'ltr',
			width: parentIsColumn ? fit() : grow(),
			height: parentIsColumn ? grow() : fit(),
		};
	}

	const isColumn = props.flexDirection === 'column' || props.flexDirection === 'column-reverse';
	const isReverse = props.flexDirection === 'row-reverse' || props.flexDirection === 'column-reverse';
	const direction = isColumn ? 'ttb' : 'ltr';

	const hasFlex = (props.flexGrow ?? 0) > 0;
	// alignSelf:stretch fills the PARENT's CROSS axis (row parent→height, column parent→width).
	const stretch = props.alignSelf === 'stretch';
	// alignSelf flex-start/center shrinks to content (parent then aligns it).
	const shrinkAlign = props.alignSelf === 'flex-start' || props.alignSelf === 'center';
	const widthFallback = hasFlex ? grow()
		: (stretch && parentIsColumn) ? grow()
		: shrinkAlign ? fit() : fill;
	const heightFallback = (stretch && !parentIsColumn) ? grow() : fit();

	// Resolve the box's width/height, applying flexBasis (main-axis start size)
	// and aspectRatio (derives the partner dimension) before sizing.
	let width: number | string | undefined = props.width;
	let height: number | string | undefined = props.height;
	// flexBasis seeds the PARENT flex container's MAIN axis (row→width,
	// column→height) when this box has no explicit size on that axis.
	if (props.flexBasis !== undefined) {
		if (parentIsColumn) height ??= props.flexBasis;
		else width ??= props.flexBasis;
	}
	// aspectRatio = width/height. An explicit height wins; otherwise derive from
	// width. maxHeight clamps the resolved height, then width follows from it.
	if (typeof props.aspectRatio === 'number' && props.aspectRatio > 0) {
		const ratio = props.aspectRatio;
		let h = typeof height === 'number' ? height
			: typeof width === 'number' ? width / ratio
			: undefined;
		if (h !== undefined) {
			if (typeof props.maxHeight === 'number' && h > props.maxHeight) h = props.maxHeight;
			height = h;
			width = h * ratio;
		}
	}
	const widthAxis = sizingAxis(width, widthFallback, props.minWidth, props.maxWidth);
	const heightAxis = sizingAxis(height, heightFallback, props.minHeight, props.maxHeight);

	// Clay borders are purely decorative — they don't affect layout sizing.
	// Add them as padding so fit() naturally includes the border rows/columns.
	const bpTop    = (props.borderStyle && props.borderTop    !== false) ? 1 : 0;
	const bpBottom = (props.borderStyle && props.borderBottom !== false) ? 1 : 0;
	const bpLeft   = (props.borderStyle && props.borderLeft   !== false) ? 1 : 0;
	const bpRight  = (props.borderStyle && props.borderRight  !== false) ? 1 : 0;

	// Expand shorthand padding props: paddingTop > paddingY > padding > 0
	const pt = props.paddingTop    ?? props.paddingY ?? props.padding ?? 0;
	const pb = props.paddingBottom ?? props.paddingY ?? props.padding ?? 0;
	const pl = props.paddingLeft   ?? props.paddingX ?? props.padding ?? 0;
	const pr = props.paddingRight  ?? props.paddingX ?? props.padding ?? 0;

	// Expand shorthand margin props: marginTop > marginY > margin > 0
	const mt = props.marginTop    ?? props.marginY ?? props.margin ?? 0;
	const mb = props.marginBottom ?? props.marginY ?? props.margin ?? 0;
	const ml = props.marginLeft   ?? props.marginX ?? props.margin ?? 0;
	const mr = props.marginRight  ?? props.marginX ?? props.margin ?? 0;

	// For row (ltr): justifyContent = main axis = alignX, alignItems = cross axis = alignY
	// For column (ttb): justifyContent = main axis = alignY, alignItems = cross axis = alignX
	// Reverse directions default the main axis to flex-end (children are pre-reversed
	// in nodeToOps), unless an explicit justifyContent overrides.
	const justifyNum = alignToNum(props.justifyContent) ?? (isReverse ? 1 : undefined);
	const alignItemsNum = alignToNum(props.alignItems);

	return {
		direction,
		width: widthAxis,
		height: heightAxis,
		gap: props.gap,
		padding: {
			left:   pl + ml + bpLeft,
			right:  pr + mr + bpRight,
			top:    pt + mt + bpTop,
			bottom: pb + mb + bpBottom,
		},
		alignX: isColumn ? alignItemsNum : justifyNum,
		alignY: isColumn ? justifyNum : alignItemsNum,
	};
}

function makeBorder(props: BoxProps): OpenProps['border'] | undefined {
	if (!props.borderStyle) return undefined;
	// Per-side colors: Clayterm takes one color for the whole border.
	// In non-TTY (chalk.level=0) all ANSI is stripped on both sides — tests still pass.
	const sideColor =
		props.borderTopColor ?? props.borderBottomColor ??
		props.borderLeftColor ?? props.borderRightColor ??
		props.borderColor;
	const color = sideColor ? colorPropToRgba(sideColor) : rgba(192, 192, 192);
	return {
		color,
		top:    props.borderTop    === false ? 0 : 1,
		bottom: props.borderBottom === false ? 0 : 1,
		left:   props.borderLeft   === false ? 0 : 1,
		right:  props.borderRight  === false ? 0 : 1,
	};
}

function makeCornerRadius(props: BoxProps): OpenProps['cornerRadius'] | undefined {
	if (props.borderStyle === 'round') return {tl: 1, tr: 1, bl: 1, br: 1};
	return undefined;
}

// Clayterm alignX/alignY: 0=start, 1=end, 2=center
function alignToNum(align: string | undefined): number | undefined {
	switch (align) {
		case 'flex-start':   return 0;
		case 'flex-end':     return 1;
		case 'center':       return 2;
		case 'space-between':
		case 'space-around':
		case 'space-evenly': return 0; // not natively supported, fallback to start
		default:             return undefined;
	}
}
