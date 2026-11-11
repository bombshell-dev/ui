import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	function title(source: string, name: string): string {
		return `WPT ${source}: ${name}`;
	}

	const { expect } = context.runner;

	for (const self of [true, false]) {
		context.test(
			title(
				'ParentNode-querySelector-orphan-scope.html',
				self
					? 'querySelectorAll on orphaned element does not return the element itself'
					: 'querySelectorAll descendant selector works on orphaned elements',
			),
			({ document }) => {
				const parent = document.createElement('div');
				parent.id = 'fuz';
				const child = document.createElement('span');
				child.id = 'buz';
				parent.appendChild(child);
				if (self)
					expect(
						parent.querySelectorAll('#fuz').length,
						'should not return the base element itself',
					).toBe(0);
				else {
					const results = parent.querySelectorAll('#fuz #buz');
					expect(results.length).toBe(1);
					expect(results[0]).toBe(child);
				}
			},
		);
	}
}
