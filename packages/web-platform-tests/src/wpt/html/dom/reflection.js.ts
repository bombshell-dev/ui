export interface ReflectionData {
	type: string;
	defaultVal?: unknown;
	invalidVal?: unknown;
	nonCanon?: Record<string, string>;
	keywords?: string[];
	isNullable?: boolean;
	domAttrName?: string;
	treatNullAsEmptyString?: unknown;
	comment?: string;
}
interface TypeInfo {
	jsType: 'string' | 'boolean' | 'number';
	defaultVal: unknown;
	domTests: unknown[];
	domExpected?: unknown[] | ((value: unknown) => unknown);
	idlTests?: unknown[];
	idlDomExpected?: unknown[] | ((value: unknown) => unknown);
	idlIdlExpected?: unknown[] | ((value: unknown) => unknown);
}

function resolveUrl(document: Document, url: unknown): string {
	url = String(url);
	var el = document.createElement('a');
	el.href = String(url);
	var ret = el.protocol + '//' + el.host + el.pathname + el.search + el.hash;
	if (ret == '//') {
		return String(url);
	} else {
		return ret;
	}
}

function parseInteger(input: string): number | false {
	var position = 0;
	var sign = 1;
	// Skip whitespace
	while (input.length > position && /^[ \t\n\f\r]$/.test(input[position]!)) {
		position++;
	}
	if (position >= input.length) {
		return false;
	}
	if (input[position] == '-') {
		sign = -1;
		position++;
	} else if (input[position] == '+') {
		position++;
	}
	if (position >= input.length) {
		return false;
	}
	if (!/^[0-9]$/.test(input[position]!)) {
		return false;
	}
	var value = 0;
	while (input.length > position && /^[0-9]$/.test(input[position]!)) {
		value *= 10;
		// Don't use parseInt even for single-digit strings . . .
		value += input.charCodeAt(position) - '0'.charCodeAt(0);
		position++;
	}
	if (value === 0) {
		return 0;
	}
	return sign * value;
}

var binaryString =
	'\x00\x01\x02\x03\x04\x05\x06\x07 ' +
	'\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f ' +
	'\x10\x11\x12\x13\x14\x15\x16\x17 ' +
	'\x18\x19\x1a\x1b\x1c\x1d\x1e\x1f ';
var maxInt = 2147483647;
var minInt = -2147483648;
var maxUnsigned = 4294967295;

const typeMap: Record<string, TypeInfo> = {
	string: {
		jsType: 'string',
		defaultVal: '',
		domTests: [
			'',
			' ' + binaryString + ' foo ',
			undefined,
			7,
			1.5,
			'5%',
			'+100',
			'.5',
			true,
			false,
			{ test: 6 },
			NaN,
			+Infinity,
			-Infinity,
			'\0',
			null,
			{
				toString: function () {
					return 'test-toString';
				},
			},
			{
				valueOf: function () {
					return 'test-valueOf';
				},
				toString: null,
			},
		],
	},
	url: {
		jsType: 'string',
		defaultVal: '',
		domTests: [
			'',
			' foo ',
			'http://site.example/',
			'//site.example/path???@#l',
			binaryString,
			undefined,
			7,
			1.5,
			'5%',
			'+100',
			'.5',
			true,
			false,
			{ test: 6 },
			NaN,
			+Infinity,
			-Infinity,
			'\0',
			null,
			{
				toString: function () {
					return 'test-toString';
				},
			},
			{
				valueOf: function () {
					return 'test-valueOf';
				},
				toString: null,
			},
		],
		domExpected: (value: unknown) => (document: Document) => resolveUrl(document, value),
		idlIdlExpected: (value: unknown) => (document: Document) => resolveUrl(document, value),
	},
	enum: {
		jsType: 'string',
		defaultVal: '',
		domTests: [
			'',
			' ' + binaryString + ' foo ',
			undefined,
			7,
			1.5,
			'5%',
			'+100',
			'.5',
			true,
			false,
			{ test: 6 },
			NaN,
			+Infinity,
			-Infinity,
			'\0',
			null,
			{
				toString: function () {
					return 'test-toString';
				},
			},
			{
				valueOf: function () {
					return 'test-valueOf';
				},
				toString: null,
			},
		],
	},
	boolean: {
		jsType: 'boolean',
		defaultVal: false,
		domTests: [
			'',
			' foo ',
			undefined,
			null,
			7,
			1.5,
			'5%',
			'+100',
			'.5',
			true,
			false,
			{ test: 6 },
			NaN,
			+Infinity,
			-Infinity,
			'\0',
			{
				toString: function () {
					return 'test-toString';
				},
			},
			{
				valueOf: function () {
					return 'test-valueOf';
				},
				toString: null,
			},
		],
		domExpected: function (val: unknown) {
			return true;
		},
	},
	long: {
		jsType: 'number',
		defaultVal: 0,
		domTests: [
			-36,
			-1,
			0,
			1,
			maxInt,
			minInt,
			maxInt + 1,
			minInt - 1,
			maxUnsigned,
			maxUnsigned + 1,
			'',
			'-',
			'+',
			'-1',
			'-0',
			'0',
			'1',
			' ' + binaryString + ' foo ',
			// Test various different whitespace. Only 20, 9, A, C,
			// and D are whitespace.
			'\u00097',
			'\u000B7',
			'\u000C7',
			'\u00207',
			'\u00A07',
			'\uFEFF7',
			'\u000A7',
			'\u000D7',
			'\u20287',
			'\u20297',
			'\u16807',
			'\u180E7',
			'\u20007',
			'\u20017',
			'\u20027',
			'\u20037',
			'\u20047',
			'\u20057',
			'\u20067',
			'\u20077',
			'\u20087',
			'\u20097',
			'\u200A7',
			'\u202F7',
			'\u30007',
			'\t\u000B7',
			'\n\u000B7',
			'\f\u000B7',
			'\r\u000B7',
			'\x20\u000B7',
			'7\u000B',
			undefined,
			1.5,
			'5%',
			'+100',
			'.5',
			true,
			false,
			{ test: 6 },
			NaN,
			+Infinity,
			-Infinity,
			'\0',
			{
				toString: function () {
					return 2;
				},
				valueOf: null,
			},
			{
				valueOf: function () {
					return 3;
				},
				toString: null,
			},
		],
		domExpected: function (val: unknown) {
			var parsed = parseInteger(String(val));
			if (parsed === false || parsed > maxInt || parsed < minInt) {
				return null;
			}
			return parsed;
		},
		idlTests: [-36, -1, 0, 1, 2147483647, -2147483648],
		idlDomExpected: [-36, -1, 0, 1, 2147483647, -2147483648],
	},
};

function toASCIILowerCase(str: string): string {
	return str.replace(/[A-Z]/g, function (m) {
		return m.toLowerCase();
	});
}
function enumExpected(
	keywords: string[],
	nonCanon: Record<string, string>,
	invalidVal: unknown,
	contentVal: unknown,
): unknown {
	var ret = invalidVal;
	for (var i = 0; i < keywords.length; i++) {
		if (toASCIILowerCase(String(contentVal)) === toASCIILowerCase(keywords[i]!)) {
			ret = keywords[i];
			break;
		}
	}
	if (typeof nonCanon[String(ret)] != 'undefined') return nonCanon[String(ret)];
	return ret;
}

export function reflectionMatrix(input: ReflectionData | string, domName: string) {
	const data: ReflectionData = typeof input === 'string' ? { type: input } : { ...input };
	const typeInfo = typeMap[data.type];
	if (typeInfo === undefined) return undefined;
	if (typeof data.isNullable == 'undefined') data.isNullable = false;
	const expectedType = data.isNullable && data.defaultVal === null ? 'object' : typeInfo.jsType;
	let defaultVal = data.defaultVal;
	if (defaultVal === undefined) defaultVal = typeInfo.defaultVal;
	const cast: (value: unknown) => unknown =
		typeInfo.jsType === 'string' ? String : typeInfo.jsType === 'boolean' ? Boolean : Number;
	const domTests = typeInfo.domTests.slice(0);
	let domExpected = (
		typeof typeInfo.domExpected === 'function'
			? domTests.map(typeInfo.domExpected)
			: (typeInfo.domExpected ?? domTests.map(cast))
	).map((value) => (value === null ? defaultVal : value));
	const idlTests = (typeInfo.idlTests ?? typeInfo.domTests).slice(0);
	let idlDomExpected = (
		typeof typeInfo.idlDomExpected === 'function'
			? idlTests.map(typeInfo.idlDomExpected)
			: (typeInfo.idlDomExpected ?? idlTests.map(cast))
	).map((value) => (value === null ? defaultVal : value));
	let idlIdlExpected = (
		typeof typeInfo.idlIdlExpected === 'function'
			? idlTests.map(typeInfo.idlIdlExpected)
			: (typeInfo.idlIdlExpected ?? idlDomExpected)
	).map((value) => (value === null ? defaultVal : value));
	switch (data.type) {
		case 'boolean':
			domTests.push(domName);
			domExpected.push(true);
			break;
		case 'enum': {
			if (typeof data.invalidVal == 'undefined') data.invalidVal = defaultVal;
			if (typeof data.nonCanon == 'undefined') data.nonCanon = {};
			const keywords = data.keywords!;
			for (let i = 0; i < keywords.length; i++) {
				const keyword = keywords[i]!;
				if (keyword != '') {
					domTests.push(keyword, 'x' + keyword, keyword + '\0');
					idlTests.push(keyword, 'x' + keyword, keyword + '\0');
				}
				if (keyword.length > 1) {
					const sliced = keyword.slice(1);
					if (keywords.indexOf(sliced) == -1) {
						domTests.push(sliced);
						idlTests.push(sliced);
					}
				}
				if (keyword != keyword.toLowerCase()) {
					domTests.push(keyword.toLowerCase());
					idlTests.push(keyword.toLowerCase());
				}
				if (keyword != keyword.toUpperCase()) {
					domTests.push(keyword.toUpperCase());
					idlTests.push(keyword.toUpperCase());
				}
				if (keyword.indexOf('k') != -1) {
					domTests.push(keyword.replace(/k/g, '\u212A'));
					idlTests.push(keyword.replace(/k/g, '\u212A'));
				}
				if (keyword.indexOf('s') != -1) {
					domTests.push(keyword.replace(/s/g, '\u017F'));
					idlTests.push(keyword.replace(/s/g, '\u017F'));
				}
			}
			if (!data.isNullable) idlDomExpected = idlTests.slice(0);
			else
				idlDomExpected = idlTests.map((value) =>
					value === null || value === undefined ? null : value,
				);
			domExpected = domTests.map((value) =>
				enumExpected(keywords, data.nonCanon!, data.invalidVal, value),
			);
			idlIdlExpected = idlTests.map((value) =>
				data.isNullable && (value === null || value === undefined)
					? null
					: enumExpected(keywords, data.nonCanon!, data.invalidVal, value),
			);
			break;
		}
		case 'string':
			if ('treatNullAsEmptyString' in data) {
				for (let i = 0; i < idlTests.length; i++) {
					if (idlTests[i] === null) idlDomExpected[i] = idlIdlExpected[i] = '';
				}
			}
			break;
	}
	return {
		data,
		expectedType,
		defaultVal,
		domTests,
		domExpected,
		idlTests,
		idlDomExpected,
		idlIdlExpected,
	};
}

export function expectedValue(value: unknown, document: Document): unknown {
	return typeof value === 'function' ? value(document) : value;
}
