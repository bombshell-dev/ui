import { Type } from 'typebox';
import { Check, Errors } from 'typebox/value';
import type { StandardSchemaV1 } from '@standard-schema/spec';
import type { TLocalizedValidationError } from 'typebox/error';

/** Core DOM first, then higher-level APIs and host interactions. Values describe the schema. */
export const featureShape = {
	document: {
		basicCreation: true,
		creation: true,
		lookup: true,
		importNode: true,
		xml: true,
		parsing: true,
		xmlSerialization: true,
	},
	node: {
		basicAppend: true,
		relationships: true,
		connectivity: true,
		liveCollections: true,
		textContent: true,
		append: true,
		insertBefore: true,
		remove: true,
		replace: true,
		fragments: true,
		variadicMutation: true,
		cloning: true,
		comparison: true,
		normalization: true,
		adoption: true,
	},
	characterData: {
		stringStorage: true,
		data: true,
		editing: true,
		splitText: true,
	},
	element: {
		childElements: true,
		attributes: true,
		attributeNodes: true,
		namespaces: true,
		classList: true,
		dataset: true,
		reflection: true,
		selectors: true,
	},
	traversal: {
		nodeIterator: true,
		treeWalker: true,
	},
	parsing: {
		fragments: true,
		namespaces: true,
		serialization: true,
		contextual: true,
		markupMutation: true,
		recovery: true,
	},
	templates: {
		content: true,
		cloning: true,
		parsing: true,
	},
	events: {
		data: {
			custom: true,
			focus: true,
			keyboard: true,
			mouse: true,
			input: true,
		},
		dispatch: {
			target: true,
			capture: true,
			bubbling: true,
			cancellation: true,
			stopPropagation: true,
			stopImmediatePropagation: true,
			pathSnapshot: true,
			reuse: true,
			reentrancy: true,
		},
		listeners: {
			registration: true,
			objects: true,
			once: true,
			passive: true,
			abortSignal: true,
			snapshots: true,
			exceptionReporting: true,
		},
	},
	mutationObserver: {
		registration: true,
		records: {
			childList: true,
			attributes: true,
			characterData: true,
		},
		filtering: true,
		oldValue: true,
		subtree: true,
		takeRecords: true,
		disconnect: true,
		microtaskDelivery: true,
		detached: true,
		reentrancy: true,
	},
	focus: {
		eligibility: true,
		transitions: true,
		removal: true,
		inert: true,
		reentrancy: true,
	},
	selection: {
		range: {
			boundaries: true,
			comparison: true,
			stringification: true,
			cloneContents: true,
			deleteContents: true,
			extractContents: true,
			liveBoundaries: true,
			mutation: true,
		},
		document: {
			rangeManagement: true,
			direction: true,
			connectivity: true,
			liveUpdates: true,
			mutation: true,
			changeEvents: true,
		},
	},
	elements: {
		progress: true,
		meter: true,
		option: {
			attributes: true,
			text: true,
			selectedness: true,
		},
		optgroup: true,
		datalist: true,
		input: {
			value: true,
			sanitization: true,
			colorValue: true,
			numericValue: true,
			dateValue: true,
			stepping: true,
			checkedness: true,
			radioGroups: true,
			selection: true,
			rangeText: true,
			validation: true,
			formAssociation: true,
			labels: true,
			activation: true,
			cloning: true,
		},
		textarea: {
			value: true,
			selection: true,
			rangeText: true,
			validation: true,
			formAssociation: true,
			labels: true,
			cloning: true,
		},
		select: {
			options: true,
			indexedOptions: true,
			selection: true,
			mutation: true,
			validation: true,
			cloning: true,
		},
		selectedcontent: true,
		form: {
			controls: true,
			namedControls: true,
			reset: true,
			validation: true,
			submission: true,
			formData: true,
			dataEvents: true,
		},
		button: {
			attributes: true,
			formAssociation: true,
			activation: true,
		},
		label: {
			association: true,
			activation: true,
		},
		fieldset: {
			controls: true,
			disabled: true,
		},
		legend: true,
		output: {
			htmlFor: true,
			value: true,
			reset: true,
		},
		details: {
			open: true,
			toggleEvents: true,
			exclusiveGroups: true,
		},
		summary: {
			activation: true,
		},
		dialog: {
			show: true,
			close: true,
			modal: true,
			requestClose: true,
			focus: true,
			formSubmission: true,
		},
	},
	customElements: {
		registration: true,
		construction: true,
		upgrading: true,
		observedAttributes: true,
		connection: true,
		adoption: true,
		reactionOrdering: true,
		reentrancy: true,
		exceptionReporting: true,
		formAssociation: true,
	},
	shadow: {
		roots: {
			attachment: true,
			hostEligibility: true,
			connectivity: true,
			cloning: true,
			adoption: true,
		},
		slots: {
			named: true,
			fallback: true,
			manual: true,
			slotchange: true,
			observerOrdering: true,
		},
		events: {
			retargeting: true,
			composedPath: true,
			relatedTarget: true,
		},
		focus: {
			retargeting: true,
			delegation: true,
		},
		declarative: true,
		serialization: true,
	},
	style: {
		inline: true,
		parsing: true,
		attributeSynchronization: true,
		customProperties: true,
		stylesheets: true,
		computed: true,
		cascade: true,
		layers: true,
		constructedStylesheets: true,
		focusState: true,
		controlSelectors: true,
		relationalSelectors: true,
		mutationObservation: true,
	},
	input: {
		keyboard: {
			delivery: true,
			modifiers: true,
			navigation: true,
			activation: true,
			editing: true,
			multilineEditing: true,
			numberStepping: true,
			focusStyles: true,
			focusVisible: true,
			shadow: true,
			implicitSubmission: true,
			trustedEvents: true,
		},
		mouse: {
			delivery: true,
			buttons: true,
			hover: true,
			focus: true,
			activation: true,
			stateStyles: true,
			focusVisible: true,
			shadow: true,
			trustedEvents: true,
		},
	},
} as const;

export type FeatureFlags<T> = {
	readonly [K in keyof T]: T[K] extends boolean ? boolean : FeatureFlags<T[K]>;
};
export type DOMFeatures = FeatureFlags<typeof featureShape>;
type Paths<T> = {
	[K in keyof T & string]: T[K] extends boolean ? K : `${K}.${Paths<T[K]>}`;
}[keyof T & string];
export type DOMFeaturePath = Paths<DOMFeatures>;

interface FeatureBranch {
	readonly [key: string]: boolean | FeatureBranch;
}

function featureSchema(shape: FeatureBranch): Type.TSchema {
	return Type.Object(
		Object.fromEntries(
			Object.entries(shape).map(([key, value]) => [
				key,
				typeof value === 'boolean' ? Type.Boolean() : featureSchema(value),
			]),
		),
		{ additionalProperties: false },
	);
}

// Both the schema and DOMFeatures derive from featureShape. Object.entries loses its literal keys.
const featureType = Type.Unsafe<DOMFeatures>(featureSchema(featureShape));

function featureIssues(error: TLocalizedValidationError): StandardSchemaV1.Issue[] {
	const path = error.instancePath
		.split('/')
		.slice(1)
		.map((part) => part.replace(/~1/g, '/').replace(/~0/g, '~'));
	const keys =
		error.keyword === 'required'
			? error.params.requiredProperties
			: error.keyword === 'additionalProperties'
				? error.params.additionalProperties
				: [];
	return keys.length
		? keys.map((key) => ({ message: error.message, path: [...path, key] }))
		: [{ message: error.message, path }];
}

/** Validate configuration only; DOM behavior is verified directly by enabled cases. */
export const domFeaturesSchema: StandardSchemaV1<unknown, DOMFeatures> = {
	'~standard': {
		version: 1,
		vendor: 'typebox',
		validate(value) {
			if (Check(featureType, value)) return { value };
			return { issues: Errors(featureType, value).flatMap(featureIssues) };
		},
	},
};

/** Compatibility enabled support. */
export function enabled(features: DOMFeatures, path: DOMFeaturePath): boolean {
	let value: unknown = features;
	for (const key of path.split('.')) {
		if (typeof value !== 'object' || value === null) return false;
		value = Reflect.get(value, key);
	}
	return value === true;
}

/** File paths are a mechanical spelling of the exhaustive schema paths. */
export function featureFile(path: string): string {
	return (
		path
			.split('.')
			.map((part) => part.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`))
			.join('/') + '.ts'
	);
}

/** Compatibility featurePaths support. */
export function featurePaths(shape: FeatureBranch = featureShape, prefix = ''): string[] {
	return Object.entries(shape).flatMap(([key, value]) => {
		const path = prefix ? `${prefix}.${key}` : key;
		return typeof value === 'boolean' ? [path] : featurePaths(value, path);
	});
}
