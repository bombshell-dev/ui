import type { CompatibilityContext } from '../../../shared/context.ts';
import { testRemove } from './ChildNode-remove.js.ts';

export function register(context: CompatibilityContext): void {
	for (const type of ['text', 'comment', 'PI'] as const) {
		testRemove(
			context,
			(document) => {
				const text = document.createTextNode('text');
				const text_parent = document.createElement('div');
				const comment = document.createComment('comment');
				const comment_parent = document.createElement('div');
				const pi = document.createProcessingInstruction('foo', 'bar');
				const pi_parent = document.createElement('div');
				return {
					text: { node: text, parent: text_parent },
					comment: { node: comment, parent: comment_parent },
					PI: { node: pi, parent: pi_parent },
				}[type];
			},
			type,
		);
	}
}
