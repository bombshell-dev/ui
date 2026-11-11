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
		'WPT ParentNode-querySelector-multiple-attributes-xml.xhtml: querySelector with multiple attribute selectors in XML',
		(fixture) => {
			const document = xhtml(
				fixture,
				`<mlt>
    <tractor id="tractor0">
      <filter mlt_service="greyscale" track="0" id="targetFilter"/>
      <filter mlt_service="greyscale" track="1"/>
      <filter mlt_service="other" track="0"/>
    </tractor>
    <tractor id="tractor1">
      <filter mlt_service="greyscale" track="0"/>
    </tractor>
  </mlt>`,
			);
			const target = document.getElementById('targetFilter');
			expect(
				document.querySelector(
					'mlt > tractor[id="tractor0"] > filter[mlt_service="greyscale"][track="0"]',
				),
			).toBe(target);
		},
	);
}
