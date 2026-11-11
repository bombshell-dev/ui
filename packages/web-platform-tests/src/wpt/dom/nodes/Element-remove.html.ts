import type { CompatibilityContext } from '../../../shared/context.ts';
import { testRemove } from './ChildNode-remove.js.ts';

export function register(context: CompatibilityContext): void {
	testRemove(
		context,
		(document) => ({
			node: document.createElement('div'),
			parent: document.createElement('div'),
		}),
		'element',
	);
}
