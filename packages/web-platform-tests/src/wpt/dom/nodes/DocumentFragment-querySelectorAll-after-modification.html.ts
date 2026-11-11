import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	function title(source: string, name: string): string {
		return `WPT ${source}: ${name}`;
	}

	const { expect } = context.runner;

	context.test(
		title(
			'DocumentFragment-querySelectorAll-after-modification.html',
			'querySelectorAll should still work on DocumentFragments after they are modified',
		),
		({ document }) => {
			const frag = document.createDocumentFragment();
			frag.appendChild(document.createElement('div'));
			expect(Array.from(frag.querySelectorAll('img')), 'before modification').toEqual([]);
			frag.appendChild(document.createElement('div'));
			expect(Array.from(frag.querySelectorAll('img')), 'after modification').toEqual([]);
		},
	);
}
