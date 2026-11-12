// Author: Domenic Denicola <d@domenic.me>.
import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test(
		'an attribute set by setAttribute should be accessible as a field on the `attributes` field of an Element',
		({ document }) => {
			const element = document.createElement('div');
			element.setAttribute('x', 'first');

			expect(element.attributes.length, 'one attribute').toBe(1);
			expect((element.attributes as NamedNodeMap & { x: Attr }).x.value).toBe('first');
		},
	);

	context.test(
		'setNamedItem and removeNamedItem on `attributes` should add and remove fields from `attributes`',
		({ document }) => {
			const element = document.createElement('div');
			const map = element.attributes as NamedNodeMap & { attr1: Attr; attr2: Attr };

			expect(map.length).toBe(0);

			const attr1 = document.createAttribute('attr1');
			map.setNamedItem(attr1);
			expect(map.attr1).toBe(attr1);
			expect(map.length).toBe(1);

			const attr2 = document.createAttribute('attr2');
			map.setNamedItem(attr2);
			expect(map.attr2).toBe(attr2);
			expect(map.length).toBe(2);

			const rm1 = map.removeNamedItem('attr1');
			expect(rm1).toBe(attr1);
			expect(map.length).toBe(1);

			const rm2 = map.removeNamedItem('attr2');
			expect(rm2).toBe(attr2);
			expect(map.length).toBe(0);
		},
	);

	context.test(
		'setNamedItem and removeNamedItem on `attributes` should not interfere with existing method names',
		({ document, NamedNodeMap }) => {
			const element = document.createElement('div');
			const map = element.attributes as NamedNodeMap & { foo: Attr };

			const fooAttribute = document.createAttribute('foo');
			map.setNamedItem(fooAttribute);

			const itemAttribute = document.createAttribute('item');
			map.setNamedItem(itemAttribute);

			expect(map.foo).toBe(fooAttribute);
			expect(map.item).toBe(NamedNodeMap.prototype.item);
			expect(typeof map.item).toBe('function');

			map.removeNamedItem('item');
			expect(map.item).toBe(NamedNodeMap.prototype.item);
			expect(typeof map.item).toBe('function');
		},
	);

	context.test(
		'an attribute with a null namespace should be accessible as a field on the `attributes` field of an Element',
		({ document }) => {
			const element = document.createElement('div');
			element.setAttributeNS(null, 'x', 'first');

			expect(element.attributes.length, 'one attribute').toBe(1);
			expect((element.attributes as NamedNodeMap & { x: Attr }).x.value).toBe('first');
		},
	);

	context.test(
		'an attribute with a set namespace should be accessible as a field on the `attributes` field of an Element',
		({ document }) => {
			const element = document.createElement('div');
			element.setAttributeNS('foo', 'x', 'first');

			expect(element.attributes.length, 'one attribute').toBe(1);
			expect((element.attributes as NamedNodeMap & { x: Attr }).x.value).toBe('first');
		},
	);

	context.test(
		'setting an attribute should not overwrite the methods of an `NamedNodeMap` object',
		({ document }) => {
			const element = document.createElement('div');
			element.setAttributeNS('foo', 'setNamedItem', 'first');

			expect(element.attributes.length, 'one attribute').toBe(1);
			expect(typeof element.attributes.setNamedItem).toBe('function');
		},
	);

	context.test(
		'setting an attribute should not overwrite the methods defined by prototype ancestors of an `NamedNodeMap` object',
		({ document }) => {
			const element = document.createElement('div');
			element.setAttributeNS('foo', 'toString', 'first');

			expect(element.attributes.length, 'one attribute').toBe(1);
			expect(typeof element.attributes.toString).toBe('function');
		},
	);

	context.test(
		'setting an attribute should not overwrite the length property of an `NamedNodeMap` object',
		({ document }) => {
			const element = document.createElement('div');
			element.setAttributeNS('foo', 'length', 'first');

			expect(element.attributes.length, 'one attribute').toBe(1);
		},
	);
}
