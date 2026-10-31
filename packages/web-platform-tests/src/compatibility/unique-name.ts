let sequence = 0;
/** Provides uniqueName for compatibility testing. */
export function uniqueName(): string {
	return `x-dom-compat-${Date.now()}-${++sequence}`;
}
