/* oxlint-disable bombshell-dev/max-params -- Layout helpers pass the element and rendering context explicitly. */
import { close, open, rgba, text, type Op } from '@bomb.sh/tty';
import { convert } from 'hueful';
import { Element, Text } from './dom.ts';
import type { StyleValues } from './style.ts';

type TTYContainerOptions = NonNullable<Parameters<typeof open>[1]>;
type TTYTextOptions = NonNullable<Parameters<typeof text>[1]>;

export class Layout {
	#lastIdNumber = 0;
	#stableIds = new WeakMap<Element, string>();
	#root: Element;

	constructor(root: Element) {
		this.#root = root;
	}

	/** Serialize an element to TTY Ops. */
	*layout(element: Element = this.#root, inheritedColor?: number): IterableIterator<Op> {
		const style = computeStyle(element);
		const color = resolveColorValue(style.color.value, inheritedColor);
		if (style.display.value === 'inline') {
			const content = collectInlineText(element);
			if (content !== '') {
				yield text(content, ttyTextOptions(color));
			}
			return;
		}

		const stack = [{ children: element.childNodes[Symbol.iterator](), color }];
		try {
			yield this.#open(element, style, color);
			let content = '';
			while (stack.length > 0) {
				const frame = stack[stack.length - 1]!;
				const next = frame.children.next();
				if (next.done) {
					if (content !== '') {
						yield text(content, ttyTextOptions(frame.color));
						content = '';
					}
					stack.pop();
					yield close();
					continue;
				}
				const child = next.value;
				if (child instanceof Text) {
					content += child.data;
				} else if (child instanceof Element) {
					if (content !== '') {
						yield text(content, ttyTextOptions(frame.color));
						content = '';
					}
					const childStyle = computeStyle(child);
					const childColor = resolveColorValue(childStyle.color.value, frame.color);
					if (childStyle.display.value === 'inline') {
						const inlineContent = collectInlineText(child);
						if (inlineContent !== '') {
							yield text(inlineContent, ttyTextOptions(childColor));
						}
					} else {
						stack.push({ children: child.childNodes[Symbol.iterator](), color: childColor });
						yield this.#open(child, childStyle, childColor);
					}
				}
			}
		} finally {
			while (stack.length > 0) {
				stack.pop();
				yield close();
			}
		}
	}

	#open(element: Element, style: StyleValues, color?: number): Op {
		let stableId = this.#stableIds.get(element);
		if (!stableId) {
			stableId = `${element.nodeName}: ${this.#lastIdNumber++}`;
			this.#stableIds.set(element, stableId);
		}
		return open(stableId, ttyContainerOptions(style, color));
	}
}

/** Inline elements collect descendant text using the outer element's styles. */
function collectInlineText(element: Element): string {
	let content = '';
	const stack = [element.childNodes[Symbol.iterator]()];
	while (stack.length > 0) {
		const next = stack[stack.length - 1]!.next();
		if (next.done) {
			stack.pop();
		} else if (next.value instanceof Text) {
			content += next.value.data;
		} else if (next.value instanceof Element) {
			stack.push(next.value.childNodes[Symbol.iterator]());
		}
	}
	return content;
}

/**
 * Convert a color which is stored internally as a hueful `ParseResult` into
 * an RGB numeric value which is what TTY speaks natively.
 */
function resolveColorValue(
	value: StyleValues['color']['value'],
	inheritedColor?: number,
): number | undefined {
	if (value === 'currentColor') {
		return inheritedColor;
	}
	const [r, g, b, alpha = 1] = convert(value.space, 'rgb', value.value);
	const channel = (component: number): number => Math.round(Math.max(0, Math.min(255, component)));
	return rgba(channel(r), channel(g), channel(b), channel(alpha * 255));
}

/**
 * Map a layout container element's styles to TTY options. The mapping is
 * sparse so that even though we have a completely known computed style,
 * we only send through to WASM enough information to render.
 */
function ttyContainerOptions(style: StyleValues, color?: number): TTYContainerOptions {
	const props: TTYContainerOptions = {};
	const layout: NonNullable<typeof props.layout> = {};
	if (style.flexDirection.value === 'column') {
		layout.direction = 'ttb';
	}
	if (style.gap.value !== 0) {
		layout.gap = style.gap.value;
	}

	let top = style.paddingTop.value;
	let right = style.paddingRight.value;
	let bottom = style.paddingBottom.value;
	let left = style.paddingLeft.value;
	const borderTop = style.borderTopWidth.value;
	const borderRight = style.borderRightWidth.value;
	const borderBottom = style.borderBottomWidth.value;
	const borderLeft = style.borderLeftWidth.value;
	if (
		style.borderStyle.value === 'solid' &&
		(borderTop || borderRight || borderBottom || borderLeft)
	) {
		const borderColor = resolveColorValue(style.borderColor.value, color);
		// TTY requires an explicit border color. Keep the space when it cannot draw the border.
		if (borderColor !== undefined) {
			props.border = { color: borderColor };
			if (borderTop !== 0) {
				props.border.top = borderTop;
			}
			if (borderRight !== 0) {
				props.border.right = borderRight;
			}
			if (borderBottom !== 0) {
				props.border.bottom = borderBottom;
			}
			if (borderLeft !== 0) {
				props.border.left = borderLeft;
			}
		} else {
			// TTY cannot draw borders with the terminal-default foreground yet.
			// Reserve their space with padding until https://github.com/bombshell-dev/tty/issues/155
			// is implemented; then emit the border and remove this fallback.
			top += borderTop;
			right += borderRight;
			bottom += borderBottom;
			left += borderLeft;
		}
	}

	if (top || right || bottom || left) {
		layout.padding = {};
		if (top !== 0) {
			layout.padding.top = top;
		}
		if (right !== 0) {
			layout.padding.right = right;
		}
		if (bottom !== 0) {
			layout.padding.bottom = bottom;
		}
		if (left !== 0) {
			layout.padding.left = left;
		}
	}
	// Even an empty layout object makes TTY pack the entire layout block.
	if (Object.keys(layout).length > 0) {
		props.layout = layout;
	}
	return props;
}

function ttyTextOptions(color?: number): TTYTextOptions {
	return color === undefined ? {} : { color };
}

function computeStyle(element: Element): StyleValues {
	const defaults = computeDefaultStyles(element);
	return applyInlineStyles(element, defaults);
}

function computeDefaultStyles(element: Element): StyleValues {
	const display =
		element.namespaceURI === 'http://www.w3.org/1999/xhtml' && element.localName === 'span'
			? 'inline'
			: 'flex';
	return {
		color: { value: 'currentColor', representation: 'currentColor' },
		display: { value: display, representation: display },
		flexDirection: { value: 'row', representation: 'row' },
		gap: { value: 0, representation: '0px' },
		paddingTop: { value: 0, representation: '0px' },
		paddingRight: { value: 0, representation: '0px' },
		paddingBottom: { value: 0, representation: '0px' },
		paddingLeft: { value: 0, representation: '0px' },
		borderStyle: { value: 'none', representation: 'none' },
		borderTopWidth: { value: 1, representation: '1px' },
		borderRightWidth: { value: 1, representation: '1px' },
		borderBottomWidth: { value: 1, representation: '1px' },
		borderLeftWidth: { value: 1, representation: '1px' },
		borderColor: { value: 'currentColor', representation: 'currentColor' },
	};
}

function applyInlineStyles(element: Element, defaults: StyleValues): StyleValues {
	return { ...defaults, ...element.style.values };
}
