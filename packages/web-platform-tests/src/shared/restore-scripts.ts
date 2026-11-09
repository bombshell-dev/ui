class ScriptFixtureError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'ScriptFixtureError';
	}
}

/** Restore script fixture nodes without executing their contents or loading their sources. */
export function restoreScriptNodes(document: Document, scripts: readonly string[]): void {
	const placeholders = document.querySelectorAll('script');
	if (placeholders.length !== scripts.length) {
		throw new ScriptFixtureError(
			`Expected ${scripts.length} script placeholders, found ${placeholders.length}`,
		);
	}
	const template = document.createElement('template');
	for (const [index, markup] of scripts.entries()) {
		template.innerHTML = markup;
		const script = template.content.firstChild;
		if (template.content.childNodes.length !== 1 || script?.nodeName !== 'SCRIPT') {
			throw new ScriptFixtureError(`Invalid script fixture at index ${index}`);
		}
		placeholders[index]!.replaceWith(script);
	}
}
