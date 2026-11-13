export {
	testDOMCompatibility,
	CompatibilityConfigurationError,
} from './shared/test-dom-compatibility.ts';
export type {
	DOMCompatibilityOptions,
	WPTConfig,
	WPTSelectors,
} from './shared/test-dom-compatibility.ts';
export { features, type DOMFeature } from './frameworks/features.ts';
export {
	frameworks,
	featureSelectors,
	framework,
	uncoveredByWPT,
	type Framework,
} from './frameworks/frameworks.ts';
export type {
	CompatibilityRunner,
	CompatibilityExpect,
	CompatibilityMatchers,
	CompatibilityContext,
	CompatibilityTestOptions,
	DOMFixture,
	CompatibilityModule,
} from './shared/context.ts';
export type { DOMFixtureOptions, DOMDocumentOptions } from './shared/fixture.ts';
export type { DOMGlobalBindings } from './shared/globals.ts';
export type {
	DOMInputDriver,
	DOMTestInput,
	DOMInputCapability,
	DOMMouseButton,
} from './shared/input-driver.ts';
