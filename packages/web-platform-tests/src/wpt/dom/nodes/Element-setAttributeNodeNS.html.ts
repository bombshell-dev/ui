import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	for (const namespacedFirst of [false, true]) {
		context.test(
			`Replacing an attribute prefix preserves name lookup order with namespacedFirst=${namespacedFirst}`,
			({ document }) => {
				const element = document.createElement('div');
				if (namespacedFirst) {
					element.setAttributeNS('urn:test', 'p:id', 'namespaced');
				}
				element.setAttributeNS(null, 'id', 'plain');
				if (!namespacedFirst) {
					element.setAttributeNS('urn:test', 'p:id', 'namespaced');
				}

				const replacement = document.createAttributeNS('urn:test', 'id');
				replacement.value = 'replacement';
				element.setAttributeNodeNS(replacement);

				expect(element.getAttribute('p:id')).toBe(null);
				expect(element.hasAttribute('p:id')).toBe(false);
				expect(element.getAttribute('id')).toBe(namespacedFirst ? 'replacement' : 'plain');
				expect(element.getAttributeNS(null, 'id')).toBe('plain');
				expect(element.getAttributeNS('urn:test', 'id')).toBe('replacement');

				element.removeAttributeNS('urn:test', 'id');
				expect(element.getAttribute('id')).toBe('plain');
				expect(element.id).toBe('plain');
			},
		);
	}
	context.test(
		'Replacing an attribute prefix preserves other attributes with the old qualified name',
		({ document }) => {
			const element = document.createElement('div');
			element.setAttributeNS('urn:test', 'p:id', 'namespaced');
			const attribute = document.createAttribute('p:id');
			attribute.value = 'plain';
			element.setAttributeNode(attribute);

			const replacement = document.createAttributeNS('urn:test', 'q:id');
			replacement.value = 'replacement';
			element.setAttributeNodeNS(replacement);

			expect(element.getAttribute('p:id')).toBe('plain');
			expect(element.getAttributeNode('p:id')).toBe(attribute);
			expect(element.getAttribute('q:id')).toBe('replacement');
			element.removeAttribute('q:id');
			expect(element.getAttribute('p:id')).toBe('plain');
			expect(element.getAttribute('q:id')).toBe(null);
		},
	);
}
