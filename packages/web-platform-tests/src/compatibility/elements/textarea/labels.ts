import type { DOMElement as DOMElementContract } from '../../contracts/nodes.ts';
import type { CompatibilityContext } from '../../context.ts';

export const spec = 'https://html.spec.whatwg.org/multipage/forms.html#dom-lfe-labels';
export const wpt =
	'https://github.com/web-platform-tests/wpt/blob/master/html/semantics/forms/the-label-element/labels-live-attribute-changes.html';

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'keeps retained labels live when a detached control moves under a label',
		(fixture) => {
			const document = fixture.document;
			const root = document.createElement('div');
			const label = document.createElement('label');
			const element = document.createElement('textarea');
			root.append(label, element);
			const labels = element.labels;
			expect(labels.length).toBe(0);
			expect(element.labels).toBe(labels);
			label.appendChild(element);
			expect(labels.length).toBe(1);
			expect(labels[0]).toBe(label);
			root.appendChild(element);
			expect(labels.length).toBe(0);
		},
	);

	context.test('keeps connected explicit labels in tree order', (fixture) => {
		const document = fixture.document as unknown as Document;
		const p = document.createElement('div'),
			e = document.createElement('textarea'),
			a = document.createElement('label'),
			b = document.createElement('label');
		e.id = 'control';
		a.htmlFor = b.htmlFor = 'control';
		p.append(a, e, b);
		fixture.connect(p as unknown as DOMElementContract);
		const labels = e.labels!;
		expect(Array.from(labels)).toEqual([a, b]);
		p.insertBefore(b, a);
		expect(Array.from(labels)).toEqual([b, a]);
		e.id = 'other';
		expect(labels.length).toBe(0);
	});

	context.test('does not associate labels with a different tree', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('textarea'),
			label = document.createElement('label');
		e.id = 'control';
		label.htmlFor = 'control';
		fixture.connect(e as unknown as DOMElementContract);
		expect(e.labels!.length).toBe(0);
		expect(label.control).toBeNull();
	});
}
