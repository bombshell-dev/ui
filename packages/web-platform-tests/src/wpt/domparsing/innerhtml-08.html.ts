import type { CompatibilityContext } from '../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test('innerHTML on html element with trailing comment', ({ document, Node }) => {
		const html = document.createElement('html');
		html.innerHTML = '<head></head><body></body><!-- comment -->';
		expect(html.childNodes.length).toBe(3);
		expect(html.childNodes[0]!.nodeName).toBe('HEAD');
		expect(html.childNodes[1]!.nodeName).toBe('BODY');
		expect(html.childNodes[2]!.nodeType).toBe(Node.COMMENT_NODE);
		expect((html.childNodes[2] as Comment).data).toBe(' comment ');
	});
	context.test(
		'innerHTML on html element with trailing comment (no explicit head)',
		({ document, Node }) => {
			const html = document.createElement('html');
			html.innerHTML = '<body></body><!-- comment -->';
			expect(html.childNodes.length).toBe(3);
			expect(html.childNodes[0]!.nodeName).toBe('HEAD');
			expect(html.childNodes[1]!.nodeName).toBe('BODY');
			expect(html.childNodes[2]!.nodeType).toBe(Node.COMMENT_NODE);
			expect((html.childNodes[2] as Comment).data).toBe(' comment ');
		},
	);
}
