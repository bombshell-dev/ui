import { domFeaturesSchema, enabled, type DOMFeatures, type DOMFeaturePath } from './features.ts';
import type {
	CompatibilityContext,
	CompatibilityRunner,
	CompatibilityTestOptions,
	FeatureModule,
} from './context.ts';
import { withFixture, type DOMFixtureOptions } from './fixture.ts';
import { registry } from './registry.ts';

/** Compatibility CompatibilityConfigurationError support. */
export class CompatibilityConfigurationError extends Error {
	readonly details: { feature?: string; prerequisite?: string; global?: string };
	constructor(
		message: string,
		details: { feature?: string; prerequisite?: string; global?: string } = {},
	) {
		super(message);
		this.name = 'CompatibilityConfigurationError';
		this.details = details;
	}
}

export interface DOMCompatibilityOptions<D> extends DOMFixtureOptions<D> {
	runner: CompatibilityRunner;
	features: DOMFeatures;
}

/** Registers only enabled cases. No skip/todo calls, implicit feature detection, or globals installation. */
export function testDOMCompatibility<D>(options: DOMCompatibilityOptions<D>): void {
	const validation = domFeaturesSchema['~standard'].validate(options.features);
	if (validation instanceof Promise)
		throw new CompatibilityConfigurationError('Feature validation must be synchronous');
	if (validation.issues) {
		throw new CompatibilityConfigurationError(
			validation.issues.map((issue) => `${issue.path?.join('.')}: ${issue.message}`).join('\n'),
		);
	}
	const features = validation.value;
	const modules: Record<DOMFeaturePath, FeatureModule> = registry;
	const selected = Object.entries(modules).filter(([path]) =>
		enabled(features, path as DOMFeaturePath),
	);
	// Validate prerequisites before registering anything; never silently enable dependencies.
	for (const [path, leaf] of selected) {
		if (leaf.input?.length && !options.input)
			throw new CompatibilityConfigurationError(`${path} requires an input driver`, {
				feature: path,
			});
		for (const prerequisite of leaf.requires ?? []) {
			if (!enabled(features, prerequisite))
				throw new CompatibilityConfigurationError(`${path} requires ${prerequisite}`, {
					feature: path,
					prerequisite,
				});
		}
	}
	const context: CompatibilityContext = {
		runner: options.runner,
		test(name, run, request = {}) {
			const testOptions: CompatibilityTestOptions = Array.isArray(request)
				? { requires: request }
				: (request as CompatibilityTestOptions);
			if (!(testOptions.requires ?? []).every((path) => enabled(features, path))) return;
			options.runner.it(name, () =>
				withFixture({ ...options, document: testOptions.document }, run),
			);
		},
	};
	function register(prefix: string, entries: typeof selected): void {
		const groups = new Map<string, typeof selected>();
		for (const entry of entries) {
			const part = entry[0].slice(prefix.length).split('.')[0]!;
			const group = groups.get(part) ?? [];
			group.push(entry);
			groups.set(part, group);
		}
		for (const [name, group] of groups) {
			options.runner.describe(name, () => {
				const path = prefix + name;
				const leaf = group.find(([key]) => key === path);
				if (leaf) leaf[1].register(context);
				else register(`${path}.`, group);
			});
		}
	}
	register('', selected);
}
