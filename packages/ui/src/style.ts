/* oxlint-disable bombshell-dev/max-params -- Property setters take a key, value, and schema. */
import { parse, type names, type ParseResult } from 'hueful';
import type { StandardSchemaV1 } from '@standard-schema/spec';

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
	#changed: () => void;
	constructor(changed: () => void = () => {}) {
		this.#values = {};
		this.#changed = changed;
	}

	get values(): Readonly<Partial<StyleValues>> {
		return { ...this.#values };
	}

	set color(value: ColorValue | '') {
		this.#setProperty('color', value, schema.color);
	}

	get color() {
		return this.#getProperty('color');
	}

	set display(value: DisplayValue | '') {
		this.#setProperty('display', value, schema.enum('inline', 'flex'));
	}

	get display(): DisplayValue | '' {
		return this.#getProperty('display');
	}

	set flexDirection(value: FlexDirectionValue | '') {
		this.#setProperty('flexDirection', value, schema.enum('row', 'column'));
	}

	get flexDirection(): FlexDirectionValue | '' {
		return this.#getProperty('flexDirection');
	}

	set gap(value: LengthValue | '') {
		this.#setProperty('gap', value, schema.length);
	}

	get gap(): LengthValue | '' {
		return this.#getProperty('gap');
	}

	set paddingTop(value: LengthValue | '') {
		this.#setProperty('paddingTop', value, schema.length);
	}

	get paddingTop(): LengthValue | '' {
		return this.#getProperty('paddingTop');
	}

	set paddingRight(value: LengthValue | '') {
		this.#setProperty('paddingRight', value, schema.length);
	}

	get paddingRight(): LengthValue | '' {
		return this.#getProperty('paddingRight');
	}

	set paddingBottom(value: LengthValue | '') {
		this.#setProperty('paddingBottom', value, schema.length);
	}

	get paddingBottom(): LengthValue | '' {
		return this.#getProperty('paddingBottom');
	}

	set paddingLeft(value: LengthValue | '') {
		this.#setProperty('paddingLeft', value, schema.length);
	}

	get paddingLeft(): LengthValue | '' {
		return this.#getProperty('paddingLeft');
	}

	set borderTopWidth(value: BorderWidthValue | '') {
		this.#setProperty('borderTopWidth', value, schema.borderWidth);
	}

	get borderTopWidth(): BorderWidthValue | '' {
		return this.#getProperty('borderTopWidth');
	}

	set borderRightWidth(value: BorderWidthValue | '') {
		this.#setProperty('borderRightWidth', value, schema.borderWidth);
	}

	get borderRightWidth(): BorderWidthValue | '' {
		return this.#getProperty('borderRightWidth');
	}

	set borderBottomWidth(value: BorderWidthValue | '') {
		this.#setProperty('borderBottomWidth', value, schema.borderWidth);
	}

	get borderBottomWidth(): BorderWidthValue | '' {
		return this.#getProperty('borderBottomWidth');
	}

	set borderLeftWidth(value: BorderWidthValue | '') {
		this.#setProperty('borderLeftWidth', value, schema.borderWidth);
	}

	get borderLeftWidth(): BorderWidthValue | '' {
		return this.#getProperty('borderLeftWidth');
	}

	set borderStyle(value: BorderStyleValue | '') {
		this.#setProperty('borderStyle', value, schema.enum('solid', 'none'));
	}

	get borderStyle(): BorderStyleValue | '' {
		return this.#getProperty('borderStyle');
	}

	set borderColor(value: ColorValue | '') {
		this.#setProperty('borderColor', value, schema.borderColor);
	}

	get borderColor(): ColorValue | '' {
		return this.#getProperty('borderColor');
	}

	#setProperty<K extends keyof StyleValues>(
		key: K,
		input: StyleValues[K]['representation'] | '',
		schema: StandardSchemaV1<StyleValues[K]['representation'], StyleValues[K]['value']>,
	): void {
		if (typeof input !== 'string') return;
		const trimmed = input.trim();
		if (trimmed === '') {
			if (this.#values[key] !== undefined) {
				delete this.#values[key];
				this.#changed();
			}
			return;
		}
		const representation = trimmed as StyleValues[K]['representation'];
		const result = schema['~standard'].validate(representation) as StandardSchemaV1.Result<
			StyleValues[K]['value']
		>;

		// ignore styles that can't be validated and converted;
		if (result.issues) {
			return; //todo: issue warning.
		}

		this.#values[key] = { value: result.value, representation } as StyleValues[K];
		this.#changed();
	}

	#getProperty<K extends keyof StyleValues>(property: K): StyleValues[K]['representation'] | '' {
		return this.#values[property]?.representation ?? '';
	}
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
					const value = values.find((value) => value === input);
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
				if (input === 'currentColor') return { value: input };
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
				if (representation === 'currentColor') return { value: representation };
				const value = parse(representation);
				return value === null ? { issues: [{ message: 'Invalid CSS color' }] } : { value };
			},
		},
	} satisfies StandardSchemaV1<ColorValue, ParseResult | 'currentColor'>,
};
