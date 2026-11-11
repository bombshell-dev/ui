import type { CompatibilityContext } from '../../../shared/context.ts';
import { registerQueries } from './ParentNode-querySelector-All.js.ts';

export function register(context: CompatibilityContext): void {
	registerQueries(context, true);
}
