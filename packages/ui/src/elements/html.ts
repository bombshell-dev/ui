import { fit, fixed, grow } from '@bomb.sh/tty';
import { ComponentElement, defineElement, template, type CreateResult } from '../component.ts';
import type { HostEvent } from '../events.ts';
import type { KeyDown, KeyRepeat } from '../keyboard.ts';
import type { HostElement, PropertyChange } from '../elements.ts';
import type { HTMLAttributes } from '../browser-types.ts';
import { boxProperties, textProperties, setSelectedProperties } from '../parts/properties.ts';
import { TextEditor } from '../parts/text-editor.ts';
import { Focusable } from '../parts/focusable.ts';
import { Box, type BoxProps } from '../primitives/box.ts';
import { Text, type TextProps } from '../primitives/text.ts';
import { rgba } from '../values.ts';
import type { InputEvent } from './input.ts';

export type TextAreaEvent = InputEvent;

export interface TextAreaProps extends HTMLAttributes {
	disabled?: boolean;
	value?: string;
	defaultValue?: string;
	rows?: number;
	cols?: number;
	oninput?: (event: TextAreaEvent) => void;
}

export interface ListProps extends BoxProps, HTMLAttributes {
	start?: number;
	marker?: string;
}

export interface ListItemProps extends HTMLAttributes {
	value?: number;
}

export interface AnchorEvent extends HostEvent<'navigate'> {
	href: string;
	linkTarget?: string;
}

export interface AnchorProps extends TextProps, HTMLAttributes {
	href?: string;
	target?: string;
	onnavigate?: (event: AnchorEvent) => void;
}

export interface ImageProps extends HTMLAttributes {
	src?: string;
	alt?: string;
}

export interface TableProps extends BoxProps, HTMLAttributes {
	caption?: string;
}

export interface TableCellProps extends HTMLAttributes {
	colSpan?: number;
}

declare module '@clack/ui/elements' {
	interface HostElements {
		div: BoxProps & HTMLAttributes;
		span: TextProps & HTMLAttributes;
		nav: BoxProps & HTMLAttributes;
		p: BoxProps & HTMLAttributes;
		h1: BoxProps & HTMLAttributes;
		h2: BoxProps & HTMLAttributes;
		h3: BoxProps & HTMLAttributes;
		h4: BoxProps & HTMLAttributes;
		h5: BoxProps & HTMLAttributes;
		h6: BoxProps & HTMLAttributes;
		label: TextProps & HTMLAttributes;
		legend: TextProps & HTMLAttributes;
		form: BoxProps & HTMLAttributes;
		fieldset: BoxProps & HTMLAttributes;
		textarea: TextAreaProps;
		a: AnchorProps;
		img: ImageProps;
		ul: ListProps;
		ol: ListProps;
		li: ListItemProps;
		table: TableProps;
		thead: BoxProps & HTMLAttributes;
		tbody: BoxProps & HTMLAttributes;
		tfoot: BoxProps & HTMLAttributes;
		tr: BoxProps & HTMLAttributes;
		th: TableCellProps;
		td: TableCellProps;
	}
}

declare module '@clack/ui/events' {
	interface HostEvents {
		navigate: AnchorEvent;
	}
}

/** A browser-like block element composed over the TTY box primitive. */
export class DivElement extends ComponentElement<BoxProps & HTMLAttributes> {
	private contentElement!: HostElement;

	override create(): CreateResult {
		this.contentElement = template(
			this.host,
			Box,
		)({
			layout: this.props.layout ?? { direction: 'ttb' },
		});
		this.forwardProperties();
		return { implementation: this.contentElement, contentContainer: this.contentElement };
	}

	override propertyChanged(_change: PropertyChange): void {
		this.forwardProperties();
	}

	private forwardProperties(): void {
		setSelectedProperties(this.element, this.contentElement, boxProperties, {
			layout: { direction: 'ttb' },
		});
	}
}

/** A browser-like inline element composed over the TTY text primitive. */
export class SpanElement extends ComponentElement<TextProps & HTMLAttributes> {
	private textElement!: HostElement;

	override create(): CreateResult {
		this.textElement = template(this.host, Text)({});
		setSelectedProperties(this.element, this.textElement, textProperties);
		return { implementation: this.textElement, contentContainer: this.textElement };
	}

	override propertyChanged(_change: PropertyChange): void {
		setSelectedProperties(this.element, this.textElement, textProperties);
	}
}

/** A text-backed label; association and click-to-focus are not browser-emulated. */
export class LabelElement extends SpanElement {}

/** Structural form container rendered as a TTY layout box. */
export class FormElement extends DivElement {}

/** Structural fieldset rendered as a TTY layout box. */
export class FieldsetElement extends DivElement {}

/** A multiline text editor with basic terminal keyboard editing. */
export class TextAreaElement extends Focusable(ComponentElement<TextAreaProps>) {
	private textElement!: HostElement;
	private editor = new TextEditor({ multiline: true });
	private hasValue = false;

	override get focusable(): boolean {
		return !this.props.disabled;
	}

	constructor(element: HostElement) {
		super(element);
		this.hasValue = typeof element.properties.value === 'string';
		this.editor.content = this.hasValue ? (element.properties.value as string) : '';
		Object.defineProperty(element.properties, 'value', {
			configurable: true,
			get: () => this.editor.content,
			set: (value: unknown) => {
				if (typeof value === 'string') {
					this.hasValue = true;
					this.editor.content = value;
					this.editor.caret = [...value].length;
					if (this.textElement) this.updateText();
				}
			},
		});
	}

	override create(): CreateResult {
		if (!this.hasValue) {
			this.editor.content =
				this.props.defaultValue ??
				this.element.childNodes
					.map((child) => (child.type === 'literal' ? child.content : ''))
					.join('');
		}
		this.editor.caret = [...this.editor.content].length;
		// Removal mutates childNodes, so consume a snapshot rather than the live list.
		for (const child of this.element.childNodes.slice()) this.element.removeChild(child);
		const rows = Math.max(1, this.props.rows ?? 3);
		const implementation = template(this.host, Box)(
			{ layout: { height: fit(rows) } },
			(this.textElement = template(this.host, Text)({}, this.editor.content || ' ')),
		);
		return { implementation, contentContainer: this.textElement };
	}

	override focusChangedCallback(): void {
		this.updateText();
	}

	override keydown(event: KeyDown): boolean {
		return this.edit(event);
	}

	override keyrepeat(event: KeyRepeat): boolean {
		return this.edit(event);
	}

	override propertyChanged(change: PropertyChange): void {
		super.propertyChanged(change);
		const { name } = change;
		if (name === 'value' && typeof this.props.value === 'string') {
			this.editor.content = this.props.value;
			this.editor.caret = [...this.editor.content].length;
			this.updateText();
		}
	}

	private edit(event: KeyDown | KeyRepeat): boolean {
		if (!this.node || this.props.disabled) return false;
		const previous = this.editor.content;
		const handled = this.editor.handleKey(event);
		if (handled) this.updateText();
		if (previous !== this.editor.content) {
			this.emit({ type: 'input', value: this.editor.content });
		}
		return handled;
	}

	private updateText(): void {
		this.textElement.textContent = this.editor.content || ' ';
		this.textElement.setProperty('caret', this.focused ? this.editor.caret : undefined);
	}
}

/** A vertical list with marker metadata for its initial items. */
export class ListElement extends ComponentElement<ListProps> {
	private contentElement!: HostElement;

	override create(): CreateResult {
		const items = this.element.childNodes.filter(
			(child): child is HostElement => child.type === 'element' && child.name === 'li',
		);
		items.forEach((item, index) => {
			this.host.setProperty(item, '__clackList', {
				ordered: this.element.name === 'ol',
				start: Number(this.props.start ?? 1),
				marker: this.props.marker,
				index,
			});
		});
		this.contentElement = template(
			this.host,
			Box,
		)({
			layout: this.props.layout ?? { direction: 'ttb' },
		});
		setSelectedProperties(this.element, this.contentElement, boxProperties, {
			layout: { direction: 'ttb' },
		});
		return { implementation: this.contentElement, contentContainer: this.contentElement };
	}

	override propertyChanged(_change: PropertyChange): void {
		setSelectedProperties(this.element, this.contentElement, boxProperties, {
			layout: { direction: 'ttb' },
		});
	}
}

/** A marked row with a separate projected content container. */
export class ListItemElement extends ComponentElement<ListItemProps> {
	private contentElement!: HostElement;

	override create(): CreateResult {
		const list = this.element.properties.__clackList as
			| { ordered: boolean; start: number; marker?: string; index: number }
			| undefined;
		const ordered = list?.ordered ?? false;
		const marker = ordered
			? `${this.props.value ?? (list?.start ?? 1) + (list?.index ?? 0)}.`
			: String(list?.marker ?? '-');
		const box = template(this.host, Box);
		this.contentElement = box({ layout: { direction: 'ttb', width: grow() } });
		const implementation = box(
			{ layout: { direction: 'ltr', width: grow(), gap: 1 } },
			template(this.host, Text)({ color: rgba(140, 140, 140) }, marker),
			this.contentElement,
		);
		return { implementation, contentContainer: this.contentElement };
	}
}

/** Styled text that emits a navigation request rather than navigating itself. */
export class AnchorElement extends ComponentElement<AnchorProps> {
	private contentElement!: HostElement;

	override create(): CreateResult {
		this.contentElement = template(this.host, Text)({});
		setSelectedProperties(this.element, this.contentElement, textProperties);
		this.element.addEventListener('click', () => {
			if (this.props.href) {
				this.emit({
					type: 'navigate',
					href: this.props.href,
					linkTarget: this.props.target,
				});
			}
		});
		return { implementation: this.contentElement, contentContainer: this.contentElement };
	}

	override propertyChanged(_change: PropertyChange): void {
		setSelectedProperties(this.element, this.contentElement, textProperties);
	}
}

/** A text fallback for images that cannot be displayed in the terminal. */
export class ImageElement extends ComponentElement<ImageProps> {
	override create(): HostElement {
		const description = this.props.alt ?? this.props['aria-label'] ?? 'image';
		return template(this.host, Text)({ color: rgba(150, 150, 150) }, `[${description}]`);
	}
}

/** A table container that computes initial shared column widths. */
export class TableElement extends ComponentElement<TableProps> {
	private contentElement!: HostElement;

	override create(): CreateResult {
		const rows = findTableRows(this.element);
		const widths = computeTableColumnWidths(rows);
		for (const row of rows) {
			row.childNodes
				.filter(
					(child): child is HostElement =>
						child.type === 'element' && (child.name === 'th' || child.name === 'td'),
				)
				.forEach((cell, index) => {
					this.host.setProperty(cell, '__clackTableColumnWidth', widths[index] ?? 8);
				});
		}
		this.contentElement = template(
			this.host,
			Box,
		)({
			border: { color: rgba(100, 100, 100), top: 1, right: 1, bottom: 1, left: 1 },
			layout: this.props.layout ?? { direction: 'ttb' },
		});
		this.forwardProperties();
		return { implementation: this.contentElement, contentContainer: this.contentElement };
	}

	override propertyChanged(_change: PropertyChange): void {
		this.forwardProperties();
	}

	private forwardProperties(): void {
		setSelectedProperties(this.element, this.contentElement, boxProperties, {
			layout: { direction: 'ttb' },
			border: { color: rgba(100, 100, 100), top: 1, right: 1, bottom: 1, left: 1 },
		});
	}
}

/** A vertical structural group of table rows. */
export class TableSectionElement extends DivElement {}

/** A horizontal row that projects its cells into a layout box. */
export class TableRowElement extends ComponentElement<BoxProps & HTMLAttributes> {
	private contentElement!: HostElement;

	override create(): CreateResult {
		this.contentElement = template(
			this.host,
			Box,
		)({
			layout: { direction: 'ltr', width: grow(), ...this.props.layout },
		});
		this.forwardProperties();
		return { implementation: this.contentElement, contentContainer: this.contentElement };
	}

	override propertyChanged(_change: PropertyChange): void {
		this.forwardProperties();
	}

	private forwardProperties(): void {
		setSelectedProperties(this.element, this.contentElement, boxProperties);
		this.contentElement.setProperty('layout', {
			direction: 'ltr',
			width: grow(),
			...this.props.layout,
		});
	}
}

/** A padded cell using its table's computed column width. */
export class TableCellElement extends ComponentElement<TableCellProps> {
	private contentElement!: HostElement;

	override create(): CreateResult {
		const width = Number(this.element.properties.__clackTableColumnWidth ?? 8);
		const header = this.element.name === 'th';
		this.contentElement = template(
			this.host,
			Box,
		)({
			layout: { width: fixed(width + 2), height: fit(), padding: { left: 1, right: 1 } },
			border: { color: rgba(100, 100, 100), right: 1, bottom: 1 },
			...(header ? { bg: rgba(40, 40, 40) } : {}),
		});
		return { implementation: this.contentElement, contentContainer: this.contentElement };
	}
}

export const Div = defineElement('div', { define: DivElement, dependencies: [Box] });
export const Span = defineElement('span', { define: SpanElement, dependencies: [Text] });
export const Label = defineElement('label', { define: LabelElement, dependencies: [Text] });
export const Legend = defineElement('legend', { define: LabelElement, dependencies: [Text] });
export const Form = defineElement('form', { define: FormElement, dependencies: [Box] });
export const Fieldset = defineElement('fieldset', {
	define: FieldsetElement,
	dependencies: [Box],
});
export const TextArea = defineElement('textarea', {
	define: TextAreaElement,
	dependencies: [Box, Text],
});
export const Nav = defineElement('nav', { define: DivElement, dependencies: [Box] });
export const Paragraph = defineElement('p', { define: DivElement, dependencies: [Box] });
export const Heading1 = defineElement('h1', { define: DivElement, dependencies: [Box] });
export const Heading2 = defineElement('h2', { define: DivElement, dependencies: [Box] });
export const Heading3 = defineElement('h3', { define: DivElement, dependencies: [Box] });
export const Heading4 = defineElement('h4', { define: DivElement, dependencies: [Box] });
export const Heading5 = defineElement('h5', { define: DivElement, dependencies: [Box] });
export const Heading6 = defineElement('h6', { define: DivElement, dependencies: [Box] });
export const UnorderedList = defineElement('ul', {
	define: ListElement,
	dependencies: [Box, Text],
});
export const OrderedList = defineElement('ol', {
	define: ListElement,
	dependencies: [Box, Text],
});
export const ListItem = defineElement('li', {
	define: ListItemElement,
	dependencies: [Box, Text],
});
export const Anchor = defineElement('a', { define: AnchorElement, dependencies: [Text] });
export const Image = defineElement('img', { define: ImageElement, dependencies: [Text] });
export const Table = defineElement('table', { define: TableElement, dependencies: [Box] });
export const TableHead = defineElement('thead', {
	define: TableSectionElement,
	dependencies: [Box],
});
export const TableBody = defineElement('tbody', {
	define: TableSectionElement,
	dependencies: [Box],
});
export const TableFoot = defineElement('tfoot', {
	define: TableSectionElement,
	dependencies: [Box],
});
export const TableRow = defineElement('tr', { define: TableRowElement, dependencies: [Box] });
export const TableHeaderCell = defineElement('th', {
	define: TableCellElement,
	dependencies: [Box],
});
export const TableDataCell = defineElement('td', {
	define: TableCellElement,
	dependencies: [Box],
});

function findTableRows(table: HostElement): HostElement[] {
	const rows: HostElement[] = [];
	const visit = (element: HostElement): void => {
		if (element.name === 'table' && element !== table) return;
		if (element.name === 'tr') {
			rows.push(element);
			return;
		}
		for (const child of element.childNodes) {
			if (child.type === 'element') visit(child);
		}
	};
	visit(table);
	return rows;
}

function computeTableColumnWidths(rows: readonly HostElement[]): number[] {
	const widths: number[] = [];
	for (const row of rows) {
		const cells = row.childNodes.filter(
			(child): child is HostElement =>
				child.type === 'element' && ['th', 'td'].includes(child.name),
		);
		cells.forEach((cell, index) => {
			const contentWidth = Math.max(
				...cell.textContent.split('\n').map((line) => [...line].length),
				1,
			);
			widths[index] = Math.min(30, Math.max(widths[index] ?? 0, contentWidth));
		});
	}
	return widths;
}
