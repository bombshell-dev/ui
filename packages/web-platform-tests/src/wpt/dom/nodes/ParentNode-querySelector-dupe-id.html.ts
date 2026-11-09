import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	function title(source: string, name: string): string {
		return `WPT ${source}: ${name}`;
	}

	const { expect } = context.runner;

	for (const connected of [false, true]) {
		context.test(
			title(
				'ParentNode-querySelector-dupe-id.html',
				connected
					? 'Returns a non-null value for connected cloned node with duplicated ID'
					: 'Sanity: returns a non-null value',
			),
			({ DOMParser }) => {
				const html = '<html><div id="test1"><div id="test2"></div></div></html>';
				const doc = new DOMParser().parseFromString(html, 'text/html');
				const root = doc.documentElement;
				const test1 = doc.body.firstElementChild!;
				const test1Clone = test1.cloneNode(true) as Element;
				const expected = test1Clone.firstElementChild!;
				if (connected) root.appendChild(test1Clone);
				const test2 = test1Clone.querySelector('#test2');
				expect(test2).not.toBeNull();
				expect(test2).toBe(expected);
				expect(
					test1Clone.querySelector('[id=test2]'),
					'ID selector and attribute selector points to the same node',
				).toBe(expected);
				if (!connected)
					expect(
						test1Clone.querySelectorAll('#test2')[0],
						'querySelector and querySelectorAll[0] points to the same node',
					).toBe(expected);
			},
		);
	}
}
