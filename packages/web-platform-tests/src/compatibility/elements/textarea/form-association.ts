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
		const element = document.createElement('textarea');
		first.appendChild(element);
		expect(element.form).toBe(first);
		second.appendChild(element);
		expect(element.form).toBe(second);
		element.remove();
		expect(element.form).toBeNull();
	});

	context.test('updates form ownership on moving between forms', (fixture) => {
		const document = fixture.document as unknown as Document;
		const a = document.createElement('form'),
			b = document.createElement('form'),
			e = document.createElement('textarea');
		expect(e.form).toBeNull();
		a.append(e);
		expect(e.form).toBe(a);
		b.append(e);
		expect(e.form).toBe(b);
		e.remove();
		expect(e.form).toBeNull();
	});

	context.test('an empty explicit form attribute prevents ancestor ownership', (fixture) => {
		const document = fixture.document as unknown as Document;
		const form = document.createElement('form'),
			e = document.createElement('textarea');
		form.append(e);
		fixture.connect(form as unknown as DOMElementContract);
		e.setAttribute('form', '');
		expect(e.form).toBeNull();
		e.removeAttribute('form');
		expect(e.form).toBe(form);
	});
}
