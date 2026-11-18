export { CompatibilityConfigurationError, type WPTConfig, type WPTSelectors } from './config.ts';
export { features, type DOMFeature } from './frameworks/features.ts';
export {
	frameworks,
	featureSelectors,
	framework,
	uncoveredByWPT,
	type Framework,
} from './frameworks/frameworks.ts';
export { runWPT, type RunWPTOptions } from './vitest.ts';
