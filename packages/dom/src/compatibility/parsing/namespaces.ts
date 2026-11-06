import type { CompatibilityContext } from '../context.ts';

export const spec = 'https://html.spec.whatwg.org/multipage/parsing.html#parsing-main-inforeign';
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('uses HTML SVG and MathML namespaces during fragment parsing', ({ document }) => {
		const container = document.createElement('div');
		container.innerHTML = '<svg><linearGradient/></svg><math><mi>x</mi></math>';
		expect(container.children[0]?.namespaceURI).toBe('http://www.w3.org/2000/svg');
		expect(container.children[0]?.firstElementChild?.localName).toBe('linearGradient');
		expect(container.children[1]?.namespaceURI).toBe('http://www.w3.org/1998/Math/MathML');
	});

	context.test('switches into HTML at SVG foreignObject integration points', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('div');
		e.innerHTML = '<svg><foreignObject><div></div></foreignObject></svg>';
		const svg = e.firstElementChild!,
			foreign = svg.firstElementChild!,
			div = foreign.firstElementChild!;
		expect(svg.namespaceURI).toBe('http://www.w3.org/2000/svg');
		expect(foreign.localName).toBe('foreignObject');
		expect(div.namespaceURI).toBe('http://www.w3.org/1999/xhtml');
	});
}
