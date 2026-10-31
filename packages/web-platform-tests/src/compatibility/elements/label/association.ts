import type { DOMElement as DOMElementContract } from '../../contracts/nodes.ts';
import type { CompatibilityContext } from '../../context.ts';

export const spec = 'https://html.spec.whatwg.org/multipage/forms.html#the-label-element';

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('uses for before nested labelable descendants', (fixture) => {
		const document = fixture.document;
		const root = document.createElement('div');
		const label = document.createElement('label');
		const nested = document.createElement('input');
		const external = document.createElement('input');
		external.id = 'external-control';
		label.appendChild(nested);
		root.append(label, external);
		fixture.connect(root);
		expect(label.control).toBe(nested);
		label.htmlFor = external.id;
		expect(label.control).toBe(external);
		label.htmlFor = 'missing';
		expect(label.control).toBeNull();
	});

	context.test('explicit for association overrides nested labelable descendants', (fixture) => {
		const document = fixture.document as unknown as Document;
		const p = document.createElement('div'),
			label = document.createElement('label'),
			nested = document.createElement('input'),
			other = document.createElement('input');
		other.id = 'other';
		label.append(nested);
		p.append(label, other);
		fixture.connect(p as unknown as DOMElementContract);
		expect(label.control).toBe(nested);
		label.htmlFor = 'other';
		expect(label.control).toBe(other);
		label.htmlFor = 'missing';
		expect(label.control).toBeNull();
	});

	context.test('hidden input is not labelable', (fixture) => {
		const document = fixture.document as unknown as Document;
		const label = document.createElement('label'),
			e = document.createElement('input');
		e.type = 'hidden';
		label.append(e);
		expect(label.control).toBeNull();
		expect(e.labels).toBeNull();
	});
}
