import { featureShape, type DOMFeatures } from '../../src/compatibility/features.ts';

/** Input is explicitly enabled only by the automation runner's ?input=playwright mode. */
export function browserFeatures(input: boolean): DOMFeatures {
	return {
		...featureShape,
		input: {
			keyboard: {
				delivery: input,
				modifiers: input,
				navigation: input,
				activation: input,
				editing: input,
				multilineEditing: input,
				numberStepping: input,
				focusStyles: input,
				focusVisible: input,
				shadow: input,
				implicitSubmission: input,
				trustedEvents: input,
			},
			mouse: {
				delivery: input,
				buttons: input,
				hover: input,
				focus: input,
				activation: input,
				stateStyles: input,
				focusVisible: input,
				shadow: input,
				trustedEvents: input,
			},
		},
	};
}
