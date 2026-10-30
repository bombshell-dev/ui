export {
	testDOMCompatibility,
	CompatibilityConfigurationError,
} from './compatibility/test-dom-compatibility.ts';
export type { DOMCompatibilityOptions } from './compatibility/test-dom-compatibility.ts';
export { domFeaturesSchema } from './compatibility/features.ts';
export type { DOMFeatures, DOMFeaturePath } from './compatibility/features.ts';
export type {
	CompatibilityRunner,
	CompatibilityExpect,
	CompatibilityMatchers,
	CompatibilityContext,
	DOMFixture,
	FeatureModule,
} from './compatibility/context.ts';
export type { DOMFixtureOptions } from './compatibility/fixture.ts';
export type { DOMGlobalBindings } from './compatibility/globals.ts';
export type {
	DOMInputDriver,
	DOMTestInput,
	DOMInputCapability,
	DOMMouseButton,
} from './compatibility/input-driver.ts';
export type { DOMElement } from './compatibility/contracts/nodes.ts';
