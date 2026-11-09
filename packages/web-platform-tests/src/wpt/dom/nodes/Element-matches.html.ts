import type { CompatibilityContext } from '../../../shared/context.ts';
import { registerMatches } from './Element-matches.js.ts';

export function register(context: CompatibilityContext): void {
	registerMatches(context);
}
