import type { DOMElement as DOMElementContract } from '../../contracts/nodes.ts';
import type { CompatibilityContext } from '../../context.ts';

export const spec =
	'https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#association-of-controls-and-forms';

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('follows the nearest ancestor form when moved', (fixture) => {
		const document = fixture.document;
		const first = document.createElement('form');
		const second = document.createElement('form');
		const element = document.createElement('input');
		first.appendChild(element);
		expect(element.form).toBe(first);
		second.appendChild(element);
		expect(element.form).toBe(second);
		element.remove();
		expect(element.form).toBeNull();
	});

	context.test('explicit form id overrides ancestors and tracks id changes', (fixture) => {
		const document = fixture.document as unknown as Document;
		const p = document.createElement('div'),
			a = document.createElement('form'),
			b = document.createElement('form'),
			e = document.createElement('input');
		a.id = 'a';
		b.id = 'b';
		a.append(e);
		p.append(a, b);
		fixture.connect(p as unknown as DOMElementContract);
		expect(e.form).toBe(a);
		e.setAttribute('form', 'b');
		expect(e.form).toBe(b);
		b.id = 'changed';
		expect(e.form).toBeNull();
		e.removeAttribute('form');
		expect(e.form).toBe(a);
	});
}
