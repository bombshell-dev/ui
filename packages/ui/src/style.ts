/* oxlint-disable bombshell-dev/max-params -- Style setters take a property, value, and priority. */
/* oxlint-disable bombshell-dev/no-generic-error -- Web IDL requires TypeError for missing arguments. */
import { parse, type names, type ParseResult } from 'hueful';
import type { StandardSchemaV1 } from '@standard-schema/spec';
import { asciiLowercase } from './ascii.ts';

/** Approximate CSS color syntax; Hueful validates the contents at runtime. */
export type ColorValue =
	| keyof typeof names
	| 'transparent'
	| 'currentColor'
	| `#${string}`
	| `${'rgb' | 'rgba' | 'hsl' | 'hsla' | 'hwb' | 'lab' | 'lch' | 'oklab' | 'oklch' | 'device-cmyk'}(${string})`;

export type DisplayValue = 'inline' | 'flex';

export type FlexDirectionValue = 'row' | 'column';

export type LengthValue = `${number}px`;
export type BorderWidthValue = '0px' | '1px';
export type BorderStyleValue = 'solid' | 'none';

export interface StyleValues {
	color: StyleValue<ParseResult | 'currentColor', ColorValue>;
	display: StyleValue<DisplayValue>;
	flexDirection: StyleValue<FlexDirectionValue>;
	gap: StyleValue<number, LengthValue>;
	paddingTop: StyleValue<number, LengthValue>;
	paddingRight: StyleValue<number, LengthValue>;
	paddingBottom: StyleValue<number, LengthValue>;
	paddingLeft: StyleValue<number, LengthValue>;
	borderStyle: StyleValue<BorderStyleValue>;
	borderTopWidth: StyleValue<number, BorderWidthValue>;
	borderRightWidth: StyleValue<number, BorderWidthValue>;
	borderBottomWidth: StyleValue<number, BorderWidthValue>;
	borderLeftWidth: StyleValue<number, BorderWidthValue>;
	borderColor: StyleValue<ParseResult | 'currentColor', ColorValue>;
}

export interface StyleValue<T, R extends string = T extends string ? T : never> {
	value: T;
	representation: R;
}

export class StyleDeclaration {
	#values: Partial<StyleValues>;
	#important = new Set<keyof StyleValues>();
	#changed: () => void;
	constructor(changed: () => void = () => {}) {
		this.#values = {};
		this.#changed = changed;
	}

	get values(): Readonly<Partial<StyleValues>> {
		return { ...this.#values };
	}

	getPropertyValue(property: string): string {
		if (arguments.length === 0) {
			throw new TypeError('getPropertyValue requires a property name');
		}
		const key = styleProperty(`${property}`);
		return key === undefined ? '' : this.#getProperty(key);
	}

	getPropertyPriority(property: string): string {
		if (arguments.length === 0) {
			throw new TypeError('getPropertyPriority requires a property name');
		}
		const key = styleProperty(`${property}`);
		return key !== undefined && this.#important.has(key) ? 'important' : '';
	}

	setProperty(property: string, value: string | null, priority: string | null = ''): void {
		if (arguments.length < 2) {
			throw new TypeError('setProperty requires a property name and value');
		}
		const name = `${property}`;
		const normalValue = value === null ? '' : `${value}`;
		const normalPriority = priority === null ? '' : asciiLowercase(`${priority}`);
		const key = styleProperty(name);
		if (key === undefined) {
			return;
		}
		if (normalValue !== '' && normalPriority !== '' && normalPriority !== 'important') {
			return;
		}
		this.#setProperty(key, normalValue, normalPriority === 'important');
	}

	set color(value: ColorValue | '') {
		this.#setProperty('color', value);
	}

	get color(): ColorValue | '' {
		return this.#getProperty('color');
	}

	set display(value: DisplayValue | '') {
		this.#setProperty('display', value);
	}

	get display(): DisplayValue | '' {
		return this.#getProperty('display');
	}

	set flexDirection(value: FlexDirectionValue | '') {
		this.#setProperty('flexDirection', value);
	}

	get flexDirection(): FlexDirectionValue | '' {
		return this.#getProperty('flexDirection');
	}

	set 'flex-direction'(value: FlexDirectionValue | '') {
		this.flexDirection = value;
	}

	get 'flex-direction'(): FlexDirectionValue | '' {
		return this.flexDirection;
	}

	set gap(value: LengthValue | '') {
		this.#setProperty('gap', value);
	}

	get gap(): LengthValue | '' {
		return this.#getProperty('gap');
	}

	set paddingTop(value: LengthValue | '') {
		this.#setProperty('paddingTop', value);
	}

	get paddingTop(): LengthValue | '' {
		return this.#getProperty('paddingTop');
	}

	set 'padding-top'(value: LengthValue | '') {
		this.paddingTop = value;
	}

	get 'padding-top'(): LengthValue | '' {
		return this.paddingTop;
	}

	set paddingRight(value: LengthValue | '') {
		this.#setProperty('paddingRight', value);
	}

	get paddingRight(): LengthValue | '' {
		return this.#getProperty('paddingRight');
	}

	set 'padding-right'(value: LengthValue | '') {
		this.paddingRight = value;
	}

	get 'padding-right'(): LengthValue | '' {
		return this.paddingRight;
	}

	set paddingBottom(value: LengthValue | '') {
		this.#setProperty('paddingBottom', value);
	}

	get paddingBottom(): LengthValue | '' {
		return this.#getProperty('paddingBottom');
	}

	set 'padding-bottom'(value: LengthValue | '') {
		this.paddingBottom = value;
	}

	get 'padding-bottom'(): LengthValue | '' {
		return this.paddingBottom;
	}

	set paddingLeft(value: LengthValue | '') {
		this.#setProperty('paddingLeft', value);
	}

	get paddingLeft(): LengthValue | '' {
		return this.#getProperty('paddingLeft');
	}

	set 'padding-left'(value: LengthValue | '') {
		this.paddingLeft = value;
	}

	get 'padding-left'(): LengthValue | '' {
		return this.paddingLeft;
	}

	set borderTopWidth(value: BorderWidthValue | '') {
		this.#setProperty('borderTopWidth', value);
	}

	get borderTopWidth(): BorderWidthValue | '' {
		return this.#getProperty('borderTopWidth');
	}

	set 'border-top-width'(value: BorderWidthValue | '') {
		this.borderTopWidth = value;
	}

	get 'border-top-width'(): BorderWidthValue | '' {
		return this.borderTopWidth;
	}

	set borderRightWidth(value: BorderWidthValue | '') {
		this.#setProperty('borderRightWidth', value);
	}

	get borderRightWidth(): BorderWidthValue | '' {
		return this.#getProperty('borderRightWidth');
	}

	set 'border-right-width'(value: BorderWidthValue | '') {
		this.borderRightWidth = value;
	}

	get 'border-right-width'(): BorderWidthValue | '' {
		return this.borderRightWidth;
	}

	set borderBottomWidth(value: BorderWidthValue | '') {
		this.#setProperty('borderBottomWidth', value);
	}

	get borderBottomWidth(): BorderWidthValue | '' {
		return this.#getProperty('borderBottomWidth');
	}

	set 'border-bottom-width'(value: BorderWidthValue | '') {
		this.borderBottomWidth = value;
	}

	get 'border-bottom-width'(): BorderWidthValue | '' {
		return this.borderBottomWidth;
	}

	set borderLeftWidth(value: BorderWidthValue | '') {
		this.#setProperty('borderLeftWidth', value);
	}

	get borderLeftWidth(): BorderWidthValue | '' {
		return this.#getProperty('borderLeftWidth');
	}

	set 'border-left-width'(value: BorderWidthValue | '') {
		this.borderLeftWidth = value;
	}

	get 'border-left-width'(): BorderWidthValue | '' {
		return this.borderLeftWidth;
	}

	set borderStyle(value: BorderStyleValue | '') {
		this.#setProperty('borderStyle', value);
	}

	get borderStyle(): BorderStyleValue | '' {
		return this.#getProperty('borderStyle');
	}

	set 'border-style'(value: BorderStyleValue | '') {
		this.borderStyle = value;
	}

	get 'border-style'(): BorderStyleValue | '' {
		return this.borderStyle;
	}

	set borderColor(value: ColorValue | '') {
		this.#setProperty('borderColor', value);
	}

	get borderColor(): ColorValue | '' {
		return this.#getProperty('borderColor');
	}

	set 'border-color'(value: ColorValue | '') {
		this.borderColor = value;
	}

	get 'border-color'(): ColorValue | '' {
		return this.borderColor;
	}

	#setProperty<K extends keyof StyleValues>(key: K, input: unknown, important = false): void {
		const value = input === null ? '' : `${input}`;
		if (value === '') {
			if (this.#values[key] !== undefined) {
				delete this.#values[key];
				this.#important.delete(key);
				this.#changed();
			}
			return;
		}
		const representation = value.trim() as StyleValues[K]['representation'];
		const result = propertySchemas[key]['~standard'].validate(
			representation,
		) as StandardSchemaV1.Result<StyleValues[K]['value']>;

		// ignore styles that can't be validated and converted;
		if (result.issues) {
			return; //todo: issue warning.
		}

		this.#values[key] = { value: result.value, representation } as StyleValues[K];
		if (important) {
			this.#important.add(key);
		} else {
			this.#important.delete(key);
		}
		this.#changed();
	}

	#getProperty<K extends keyof StyleValues>(property: K): StyleValues[K]['representation'] | '' {
		return this.#values[property]?.representation ?? '';
	}
}

const propertyNames = {
	color: 'color',
	display: 'display',
	'flex-direction': 'flexDirection',
	gap: 'gap',
	'padding-top': 'paddingTop',
	'padding-right': 'paddingRight',
	'padding-bottom': 'paddingBottom',
	'padding-left': 'paddingLeft',
	'border-style': 'borderStyle',
	'border-top-width': 'borderTopWidth',
	'border-right-width': 'borderRightWidth',
	'border-bottom-width': 'borderBottomWidth',
	'border-left-width': 'borderLeftWidth',
	'border-color': 'borderColor',
} as const satisfies Record<string, keyof StyleValues>;

function styleProperty(property: string): keyof StyleValues | undefined {
	const name = asciiLowercase(property);
	return Object.hasOwn(propertyNames, name)
		? propertyNames[name as keyof typeof propertyNames]
		: undefined;
}

function parseLength(representation: LengthValue): number | null {
	const value = Number(representation.slice(0, -2));
	return /^\d+px$/.test(representation) && Number.isSafeInteger(value) ? value : null;
}

function parseBorderWidth(representation: BorderWidthValue): number | null {
	const value = parseLength(representation);
	return value !== null && value <= 1 ? value : null;
}

const schema = {
	enum<const T extends string>(...values: T[]) {
		return {
			'~standard': {
				version: 1,
				vendor: '@clack/ui',
				validate(input: unknown): StandardSchemaV1.Result<T> {
					const value = values.find((candidate) => candidate === input);
					return value === undefined
						? { issues: [{ message: `Expected one of: ${values.join(', ')}` }] }
						: { value };
				},
			},
		} satisfies StandardSchemaV1<T>;
	},
	length: {
		'~standard': {
			version: 1,
			vendor: '@clack/ui',
			validate(input: unknown): StandardSchemaV1.Result<number> {
				const value = typeof input === 'string' ? parseLength(input as LengthValue) : null;
				return value === null
					? { issues: [{ message: 'Expected a nonnegative whole-cell px length' }] }
					: { value };
			},
		},
	} satisfies StandardSchemaV1<LengthValue, number>,
	borderWidth: {
		'~standard': {
			version: 1,
			vendor: '@clack/ui',
			validate(input: unknown): StandardSchemaV1.Result<number> {
				const value =
					typeof input === 'string' ? parseBorderWidth(input as BorderWidthValue) : null;
				return value === null
					? { issues: [{ message: 'Expected a border width of 0px or 1px' }] }
					: { value };
			},
		},
	} satisfies StandardSchemaV1<BorderWidthValue, number>,
	borderColor: {
		'~standard': {
			version: 1,
			vendor: '@clack/ui',
			validate(input: unknown): StandardSchemaV1.Result<ParseResult | 'currentColor'> {
				if (input === 'currentColor') {
					return { value: input };
				}
				return schema.color['~standard'].validate(input);
			},
		},
	} satisfies StandardSchemaV1<ColorValue, ParseResult | 'currentColor'>,

	color: {
		'~standard': {
			version: 1,
			vendor: '@clack/ui',
			validate(input: unknown): StandardSchemaV1.Result<ParseResult | 'currentColor'> {
				if (typeof input !== 'string') {
					return { issues: [{ message: 'Expected a CSS color string' }] };
				}
				const representation = input.trim();
				if (representation === 'currentColor') {
					return { value: representation };
				}
				const value = parse(representation);
				return value === null ? { issues: [{ message: 'Invalid CSS color' }] } : { value };
			},
		},
	} satisfies StandardSchemaV1<ColorValue, ParseResult | 'currentColor'>,
};

const propertySchemas = {
	color: schema.color,
	display: schema.enum('inline', 'flex'),
	flexDirection: schema.enum('row', 'column'),
	gap: schema.length,
	paddingTop: schema.length,
	paddingRight: schema.length,
	paddingBottom: schema.length,
	paddingLeft: schema.length,
	borderStyle: schema.enum('solid', 'none'),
	borderTopWidth: schema.borderWidth,
	borderRightWidth: schema.borderWidth,
	borderBottomWidth: schema.borderWidth,
	borderLeftWidth: schema.borderWidth,
	borderColor: schema.borderColor,
} satisfies {
	[K in keyof StyleValues]: StandardSchemaV1<
		StyleValues[K]['representation'],
		StyleValues[K]['value']
	>;
};
