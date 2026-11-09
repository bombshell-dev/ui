import type { CompatibilityContext } from '../../../shared/context.ts';
import { miscElements } from './elements-misc.js.ts';
import { stringRep } from './original-harness.js.ts';
import { expectedValue, reflectionMatrix, type ReflectionData } from './reflection.js.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	for (const [localName, properties] of Object.entries(miscElements)) {
		const attributes: [string, ReflectionData | string, string][] = [
			['title', 'string', 'title'],
			['lang', 'string', 'lang'],
			['dir', { type: 'enum', keywords: ['ltr', 'rtl', 'auto'] }, 'dir'],
			['className', 'string', 'class'],
			['classList', 'tokenlist', 'class'],
			['autofocus', 'boolean', 'autofocus'],
			['hidden', 'boolean', 'hidden'],
			['inert', 'boolean', 'inert'],
			['accessKey', 'string', 'accessKey'],
			['tabIndex', { type: 'long', defaultVal: null }, 'tabIndex'],
			...Object.entries(properties).map(
				([idlName, data]): [string, ReflectionData | string, string] => [
					idlName,
					data,
					typeof data === 'object' && 'domAttrName' in data ? data.domAttrName! : idlName,
				],
			),
		];
		for (const [idlName, input, domName] of attributes) {
			const matrix = reflectionMatrix(input, domName);
			if (!matrix) continue;
			const {
				data,
				expectedType,
				defaultVal,
				domTests,
				domExpected,
				idlTests,
				idlDomExpected,
				idlIdlExpected,
			} = matrix;
			let comment = data.comment;
			if (!comment && domName !== idlName) comment = '<' + localName + ' ' + domName + '>';
			const name = localName + '.' + idlName + (comment ? ' (' + comment + ')' : '');
			context.test(name + ': typeof IDL attribute', ({ document }) => {
				const element = document.createElement(localName) as HTMLElement & Record<string, unknown>;
				expect(typeof element[idlName]).toBe(expectedType);
			});
			if (defaultVal !== null || data.isNullable) {
				context.test(name + ': IDL get with DOM attribute unset', ({ document }) => {
					const element = document.createElement(localName) as HTMLElement &
						Record<string, unknown>;
					if (Array.isArray(defaultVal)) expect(defaultVal).toContain(element[idlName]);
					else expect(element[idlName]).toBe(defaultVal);
				});
			}
			for (let i = 0; i < domTests.length; i++) {
				if (domExpected[i] === null && !data.isNullable) continue;
				context.test(name + ': setAttribute() to ' + stringRep(domTests[i]), ({ document }) => {
					const element = document.createElement(localName) as HTMLElement &
						Record<string, unknown>;
					// Replay mutations from preceding upstream cases in the fresh fixture.
					for (let previous = 0; previous < i; previous++) {
						if (domExpected[previous] !== null || data.isNullable)
							element.setAttribute(domName, domTests[previous] as string);
					}
					element.setAttribute(domName, domTests[i] as string);
					expect(element.getAttribute(domName), 'getAttribute()').toBe(String(domTests[i]));
					const expected = expectedValue(domExpected[i], document);
					if (Array.isArray(expected)) expect(expected, 'IDL get').toContain(element[idlName]);
					else expect(element[idlName], 'IDL get').toBe(expected);
				});
			}
			for (let i = 0; i < idlTests.length; i++) {
				context.test(name + ': IDL set to ' + stringRep(idlTests[i]), ({ document }) => {
					const element = document.createElement(localName) as HTMLElement &
						Record<string, unknown>;
					// Replay mutations from preceding upstream cases in the fresh fixture.
					for (let previous = 0; previous < domTests.length; previous++) {
						if (domExpected[previous] !== null || data.isNullable)
							element.setAttribute(domName, domTests[previous] as string);
					}
					for (const value of idlTests.slice(0, i)) element[idlName] = value;
					const previousValue = element.getAttribute(domName);
					element[idlName] = idlTests[i];
					if (data.type === 'boolean')
						expect(element.hasAttribute(domName), 'hasAttribute()').toBe(Boolean(idlTests[i]));
					else if (idlDomExpected[i] !== null || data.isNullable) {
						let expected: string | null = String(idlDomExpected[i]);
						if (data.isNullable && idlDomExpected[i] === null) expected = null;
						else if (idlName === 'nonce') expected = previousValue;
						expect(element.getAttribute(domName), 'getAttribute()').toBe(expected);
					}
					if (data.type === 'enum' && data.nonCanon![String(element[idlName])]) {
						expect(element[idlName], 'IDL get canonical').toBe(
							data.nonCanon![String(element[idlName])],
						);
					}
					const expected = expectedValue(idlIdlExpected[i], document);
					if (Array.isArray(expected)) expect(expected, 'IDL get').toContain(element[idlName]);
					else if (expected !== null || data.isNullable)
						expect(element[idlName], 'IDL get').toBe(expected);
				});
			}
		}
	}
}
