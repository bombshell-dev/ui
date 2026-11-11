import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test(
		'ParentNode.children should be a live collection',
		({ document, HTMLCollection }) => {
			let node = document.getElementById('test')!;
			let parentNode = node.parentNode as Element;
			let children = parentNode.children;
			expect(children instanceof HTMLCollection).toBe(true);
			let li = document.createElement('li');
			expect(children.length).toBe(4);

			parentNode.appendChild(li);
			expect(children.length).toBe(5);

			parentNode.removeChild(li);
			expect(children.length).toBe(4);
		},
		{
			document: {
				contentType: 'text/html',
				content:
					'<!doctype html><div id="log"></div>\n<div style="display: none">\n  <ul><li id=\'test\'>1</li><li>2</li><li>3</li><li>4</li></ul>\n</div>',
			},
		},
	);
}
