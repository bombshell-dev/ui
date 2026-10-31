import type { DOMFixture } from './context.ts';
import type { DOMElement } from './contracts/nodes.ts';

/** Connect markup and a stylesheet using only the consumer's DOM and style bindings. */
export function createStyleFixture(
	fixture: DOMFixture,
	{ markup, css }: { markup: string; css: string },
): {
	document: Document;
	root: HTMLDivElement;
	get: typeof getComputedStyle;
} {
	const document = fixture.document as unknown as Document;
	const root = document.createElement('div');
	const style = document.createElement('style');
	root.innerHTML = markup;
	style.textContent = css;
	fixture.connect(style as unknown as DOMElement);
	fixture.connect(root as unknown as DOMElement);
	return { document, root, get: fixture.globals('getComputedStyle') as typeof getComputedStyle };
}
