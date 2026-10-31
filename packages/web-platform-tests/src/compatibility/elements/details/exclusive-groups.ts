import type { DOMElement as DOMElementContract } from '../../contracts/nodes.ts';
import type { CompatibilityContext } from '../../context.ts';

export const spec = 'https://html.spec.whatwg.org/multipage/interactive-elements.html#details-name';
export const requires = ['elements.details.open'] as const;

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'keeps at most one details element open per nonempty named tree group',
		(fixture) => {
			const document = fixture.document;
			const root = document.createElement('div');
			const first = document.createElement('details');
			const second = document.createElement('details');
			first.name = second.name = 'group';
			root.append(first, second);
			first.open = true;
			second.open = true;
			expect(first.open).toBe(false);
			expect(second.open).toBe(true);
			first.name = 'different';
			first.open = true;
			expect(second.open).toBe(true);
		},
	);

	context.test('keeps differently named groups and empty names independent', (fixture) => {
		const document = fixture.document as unknown as Document;
		const p = document.createElement('div'),
			a = document.createElement('details'),
			b = document.createElement('details');
		a.name = 'a';
		b.name = 'b';
		p.append(a, b);
		fixture.connect(p as unknown as DOMElementContract);
		a.open = b.open = true;
		expect(a.open).toBe(true);
		expect(b.open).toBe(true);
		a.name = b.name = '';
		expect(a.open).toBe(true);
		expect(b.open).toBe(true);
	});
}
