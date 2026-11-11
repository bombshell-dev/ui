import type { CompatibilityContext } from '../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	const possiblePositions = {
		beforebegin: 'previousSibling',
		afterbegin: 'firstChild',
		beforeend: 'lastChild',
		afterend: 'nextSibling',
	} as const;

	for (const position of Object.keys(possiblePositions) as (keyof typeof possiblePositions)[]) {
		const html = '<h3>' + position + '</h3>';
		context.test(
			'insertAdjacentHTML(' + position + ', ' + html + ' )',
			({ document, Node }) => {
				const el = document.querySelector('#element')!;

				el.insertAdjacentHTML(position, html);
				var heading = document.createElement('h3');
				heading.innerHTML = position;
				expect(el[possiblePositions[position]]!.nodeName).toBe('H3');
				expect(el[possiblePositions[position]]!.firstChild!.nodeType).toBe(Node.TEXT_NODE);
			},
			{
				document: {
					contentType: 'text/html',
					content:
						'<!doctype html>\n<title>insertAdjacentHTML</title>\n\n\n<style>\n#element {\n  display: none;\n}\n</style>\n\n<div id="element"></div>\n<div id="log"></div>\n\n\n',
				},
			},
		);
	}
}
