import type { DOMElement, DOMHTMLElement, DOMTokenList } from './nodes.ts';
import type { DOMSlotElement, DOMTemplateElement } from './shadow.ts';
import type {
	DOMHTMLCollection,
	DOMHTMLFormControlsCollection,
	DOMHTMLOptionsCollection,
	DOMNodeList,
} from './collections.ts';

export interface DOMValidityState {
	readonly valueMissing: boolean;
	readonly typeMismatch: boolean;
	readonly patternMismatch: boolean;
	readonly tooLong: boolean;
	readonly tooShort: boolean;
	readonly rangeUnderflow: boolean;
	readonly rangeOverflow: boolean;
	readonly stepMismatch: boolean;
	readonly badInput: boolean;
	readonly customError: boolean;
	readonly valid: boolean;
}

export interface DOMFormControl extends DOMHTMLElement {
	name: string;
	readonly form: DOMFormElement | null;
	readonly labels: DOMNodeList<DOMLabelElement> | null;
	readonly willValidate: boolean;
	readonly validity: DOMValidityState;
	readonly validationMessage: string;
	checkValidity(): boolean;
	reportValidity(): boolean;
	setCustomValidity(message: string): void;
}

export interface DOMTextControl extends DOMFormControl {
	value: string;
	defaultValue: string;
	disabled: boolean;
	required: boolean;
	readOnly: boolean;
	selectionStart: number | null;
	selectionEnd: number | null;
	selectionDirection: string | null;
	select(): void;
	setSelectionRange(start: number, end: number, direction?: string): void;
	setRangeText(replacement: string): void;
	setRangeText(
		replacement: string,
		start: number,
		end: number,
		mode?: 'select' | 'start' | 'end' | 'preserve',
	): void;
}

export interface DOMInputElement extends DOMTextControl {
	type: string;
	checked: boolean;
	defaultChecked: boolean;
	indeterminate: boolean;
	multiple: boolean;
	min: string;
	max: string;
	step: string;
	pattern: string;
	valueAsNumber: number;
	valueAsDate: Date | null;
	stepUp(count?: number): void;
	stepDown(count?: number): void;
}

export interface DOMTextAreaElement extends DOMTextControl {
	selectionStart: number;
	selectionEnd: number;
	selectionDirection: string;
	readonly labels: DOMNodeList<DOMLabelElement>;
}

export interface DOMButtonElement extends DOMFormControl {
	readonly labels: DOMNodeList<DOMLabelElement>;
	type: string;
	disabled: boolean;
	value: string;
	formNoValidate: boolean;
}

export interface DOMFormElement extends DOMHTMLElement {
	readonly elements: DOMHTMLFormControlsCollection;
	readonly length: number;
	noValidate: boolean;
	method: string;
	reset(): void;
	checkValidity(): boolean;
	reportValidity(): boolean;
	requestSubmit(submitter?: DOMHTMLElement | null): void;
}

export interface DOMLabelElement extends DOMHTMLElement {
	htmlFor: string;
	readonly control: DOMElement | null;
	readonly form: DOMFormElement | null;
}

export interface DOMFieldSetElement extends DOMHTMLElement {
	disabled: boolean;
	readonly elements: DOMHTMLCollection;
	readonly form: DOMFormElement | null;
	readonly willValidate: boolean;
}

export interface DOMLegendElement extends DOMHTMLElement {
	readonly form: DOMFormElement | null;
}

export interface DOMSelectElement extends DOMFormControl {
	readonly labels: DOMNodeList<DOMLabelElement>;
	disabled: boolean;
	multiple: boolean;
	required: boolean;
	size: number;
	readonly type: string;
	readonly options: DOMHTMLOptionsCollection;
	readonly selectedOptions: DOMHTMLCollection<DOMOptionElement>;
	length: number;
	selectedIndex: number;
	value: string;
	item(index: number): DOMOptionElement | null;
	namedItem(name: string): DOMOptionElement | null;
	add(element: DOMOptionElement | DOMOptGroupElement, before?: DOMElement | number | null): void;
	remove(index?: number): void;
}

export interface DOMOptionElement extends DOMHTMLElement {
	disabled: boolean;
	defaultSelected: boolean;
	selected: boolean;
	value: string;
	label: string;
	text: string;
	readonly index: number;
	readonly form: DOMFormElement | null;
}

export interface DOMOptGroupElement extends DOMHTMLElement {
	disabled: boolean;
	label: string;
}

export interface DOMDataListElement extends DOMHTMLElement {
	readonly options: DOMHTMLCollection<DOMOptionElement>;
}

export interface DOMOutputElement extends DOMFormControl {
	readonly labels: DOMNodeList<DOMLabelElement>;
	readonly type: string;
	value: string;
	defaultValue: string;
	get htmlFor(): DOMTokenList;
	set htmlFor(value: string);
}

export interface DOMProgressElement extends DOMHTMLElement {
	readonly labels: DOMNodeList<DOMLabelElement>;
	value: number;
	max: number;
	readonly position: number;
}

export interface DOMMeterElement extends DOMHTMLElement {
	readonly labels: DOMNodeList<DOMLabelElement>;
	value: number;
	min: number;
	max: number;
	low: number;
	high: number;
	optimum: number;
}

export interface DOMDetailsElement extends DOMHTMLElement {
	open: boolean;
	name: string;
}

export interface DOMDialogElement extends DOMHTMLElement {
	open: boolean;
	returnValue: string;
	show(): void;
	showModal(): void;
	close(returnValue?: string): void;
	requestClose(returnValue?: string): void;
}

export interface DOMElements {
	template: DOMTemplateElement;
	slot: DOMSlotElement;
	input: DOMInputElement;
	textarea: DOMTextAreaElement;
	button: DOMButtonElement;
	form: DOMFormElement;
	label: DOMLabelElement;
	fieldset: DOMFieldSetElement;
	legend: DOMLegendElement;
	select: DOMSelectElement;
	option: DOMOptionElement;
	optgroup: DOMOptGroupElement;
	datalist: DOMDataListElement;
	selectedcontent: DOMHTMLElement;
	output: DOMOutputElement;
	progress: DOMProgressElement;
	meter: DOMMeterElement;
	details: DOMDetailsElement;
	summary: DOMHTMLElement;
	dialog: DOMDialogElement;
}
