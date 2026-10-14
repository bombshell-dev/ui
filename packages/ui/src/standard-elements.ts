import { Button } from './elements/button.ts';
import { Input } from './elements/input.ts';
import {
	Anchor,
	Div,
	Fieldset,
	Form,
	Heading1,
	Heading2,
	Heading3,
	Heading4,
	Heading5,
	Heading6,
	Image,
	Label,
	Legend,
	ListItem,
	Nav,
	OrderedList,
	Paragraph,
	Span,
	Table,
	TableBody,
	TableDataCell,
	TableFoot,
	TableHead,
	TableHeaderCell,
	TableRow,
	TextArea,
	UnorderedList,
} from './elements/html.ts';
import { registerComponents, type Registration } from './component.ts';
import type { Host } from './host.ts';
export * from './elements/button.ts';
export * from './elements/input.ts';
export * from './elements/html.ts';

/** The supported standard element collection; application components are not included. */
export const standardElements = [
	Button,
	Input,
	Div,
	Span,
	Label,
	Legend,
	Form,
	Fieldset,
	TextArea,
	Nav,
	Paragraph,
	Heading1,
	Heading2,
	Heading3,
	Heading4,
	Heading5,
	Heading6,
	UnorderedList,
	OrderedList,
	ListItem,
	Anchor,
	Image,
	Table,
	TableHead,
	TableBody,
	TableFoot,
	TableRow,
	TableHeaderCell,
	TableDataCell,
] as const;

/** Register a standard-element profile and its dependencies without browser globals. */
export function installStandardElements(
	host: Host,
	elements: readonly Registration[] = standardElements,
): void {
	registerComponents(host, elements);
}
