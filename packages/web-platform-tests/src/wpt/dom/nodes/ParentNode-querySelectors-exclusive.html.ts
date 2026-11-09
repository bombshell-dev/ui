import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	function title(source: string, name: string): string {
		return `WPT ${source}: ${name}`;
	}

	const { expect } = context.runner;

	context.test(
		title(
			'ParentNode-querySelectors-exclusive.html',
			'querySelector/querySelectorAll should not include their thisArg',
		),
		({ document }) => {
			const button = document.createElement('button');
			for (const stage of ['before modification', 'after modification']) {
				if (stage === 'after modification') button.innerHTML = 'text';
				for (const selector of ['*', 'button', 'button, span']) {
					expect(
						button.querySelector(selector),
						`querySelector, '${selector}', ${stage}`,
					).toBeNull();
				}
				for (const selector of ['*', 'button', 'button, span']) {
					expect(
						Array.from(button.querySelectorAll(selector)),
						`querySelectorAll, '${selector}', ${stage}`,
					).toEqual([]);
				}
			}
		},
	);
}
