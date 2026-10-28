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

	/**
	 * Serialize an element to TTY Ops.
	 */
	*layout(element: Element = this.#root, inheritedColor?: number): IterableIterator<Op> {
		const style = computeStyle(element);
		const color = resolveColorValue(style.color.value, inheritedColor);

		if (style.display.value === 'inline') {
			yield* this.#layoutInline(element, color);
		} else {
			yield* this.#layoutContainer(element, style, color);
		}
	}

	/**
	 * Layout an element with `display: flex`
	 */
	*#layoutContainer(element: Element, style: StyleValues, color?: number): IterableIterator<Op> {
		let stableId = this.#stableIds.get(element);
		if (!stableId) {
			stableId = `${element.nodeName}: ${this.#lastIdNumber++}`;
			this.#stableIds.set(element, stableId);
		}
		yield open(stableId, ttyContainerOptions(style, color));

		try {
			let content = '';
			for (const child of element.childNodes) {
				if (child instanceof Text) {
					content += child.data;
				} else if (child instanceof Element) {
					if (content !== '') {
						yield text(content, ttyTextOptions(color));
						content = '';
					}
					yield* this.layout(child, color);
				}
			}
			if (content !== '') {
				yield text(content, ttyTextOptions(color));
			}
		} finally {
			yield close();
		}
	}

	/**
	 * Layout an element with `display: inline`. Any containers contained within
	 * are ignored, and we just collect text. E.g. <span><div>Hello World</span>
	 * ignores the layout of the span
	 */
	*#layoutInline(element: Element, color?: number): IterableIterator<Op> {
		let content = '';
		function collectTextContent(element: Element): void {
			for (const child of element.childNodes) {
				if (child instanceof Text) {
					content += child.data;
				} else if (child instanceof Element) {
					collectTextContent(child);
				}
			}
		}
		collectTextContent(element);
		if (content !== '') {
			yield text(content, ttyTextOptions(color));
		}
	}
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
	const channel = (value: number) => Math.round(Math.max(0, Math.min(255, value)));
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
	const display = element.tagName === 'span' ? 'inline' : 'flex';
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
