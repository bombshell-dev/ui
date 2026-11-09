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
		'WPT ParentNode-querySelector-underscore-local-name.xhtml: Element local name with an underscore in querySelector',
		(fixture) => {
			const document = xhtml(fixture, '<data><_g><b>hey</b></_g></data>');
			expect(document.querySelector('data > _g > b')!.textContent).toBe('hey');
		},
	);
}
