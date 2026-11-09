import type { CompatibilityContext, DOMFixture } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	function xml(
		{ DOMParser }: DOMFixture,
		options: { markup: string; type?: DOMParserSupportedType },
	): Document {
		return new DOMParser().parseFromString(options.markup, options.type ?? 'application/xml');
	}
	function xhtml(fixture: DOMFixture, markup: string): Document {
		return xml(fixture, {
			markup: `<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>${markup}</body></html>`,
			type: 'application/xhtml+xml',
		});
	}

	const { expect } = context.runner;

	context.test(
		'WPT ParentNode-querySelector-scope-numeric-id.xhtml: querySelector with :scope on element with numeric ID',
		(fixture) => {
			const document = xhtml(fixture, '<div id="9a"><b id="target_b"/></div>');
			const scope = document.getElementById('9a');
			expect(scope).not.toBeNull();
			const result = scope!.querySelector(':scope > b');
			expect(result).not.toBeNull();
			expect(result!.id).toBe('target_b');
		},
	);
}
