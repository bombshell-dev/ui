export type TextNode = {
	type: 'text';
	text: string;
	props: TextProps;
};

export type BoxNode = {
	type: 'box';
	props: BoxProps;
	children: TermNode[];
	dom?: unknown; // source host element (for measureElement), set during extraction
};

export type RootNode = {
	type: 'root';
	children: TermNode[];
};

export type TermNode = TextNode | BoxNode | RootNode;

export type BoxProps = {
	flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
	flexGrow?: number;
	flexShrink?: number;
	flexBasis?: number | string;
	flexWrap?: 'wrap' | 'nowrap';
	aspectRatio?: number;
	gap?: number;
	columnGap?: number;
	rowGap?: number;
	width?: number | string;
	height?: number | string;
	minWidth?: number;
	maxWidth?: number;
	minHeight?: number;
	maxHeight?: number;
	padding?: number;
	paddingX?: number;
	paddingY?: number;
	paddingTop?: number;
	paddingBottom?: number;
	paddingLeft?: number;
	paddingRight?: number;
	margin?: number;
	marginX?: number;
	marginY?: number;
	marginTop?: number;
	marginBottom?: number;
	marginLeft?: number;
	marginRight?: number;
	justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
	alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
	alignSelf?: 'flex-start' | 'flex-end' | 'center' | 'auto' | 'stretch' | 'baseline';
	alignContent?: string;
	display?: 'flex' | 'none';
	position?: 'absolute' | 'relative' | 'static';
	top?: number | string;
	left?: number | string;
	right?: number | string;
	bottom?: number | string;
	overflow?: 'visible' | 'hidden';
	overflowX?: 'visible' | 'hidden';
	overflowY?: 'visible' | 'hidden';
	borderStyle?: string | Record<string, string>;
	borderColor?: string;
	borderDimColor?: boolean;
	borderTop?: boolean;
	borderBottom?: boolean;
	borderLeft?: boolean;
	borderRight?: boolean;
	borderTopColor?: string;
	borderBottomColor?: string;
	borderLeftColor?: string;
	borderRightColor?: string;
	borderTopDimColor?: boolean;
	borderBottomDimColor?: boolean;
	borderLeftDimColor?: boolean;
	borderRightDimColor?: boolean;
	backgroundColor?: string;
	[key: string]: unknown;
};

export type TextProps = {
	color?: string;
	backgroundColor?: string;
	bold?: boolean;
	italic?: boolean;
	dimColor?: boolean;
	underline?: boolean;
	strikethrough?: boolean;
	inverse?: boolean;
	wrap?: 'wrap' | 'truncate' | 'truncate-end' | 'truncate-middle' | 'truncate-start';
};
