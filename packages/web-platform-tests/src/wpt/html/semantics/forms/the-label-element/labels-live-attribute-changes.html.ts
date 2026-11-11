import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'The labels NodeList stays live when label associations change.',
		({ document, cleanup }) => {
			const label = document.createElement('label');
			const input1 = document.createElement('input');
			const input2 = document.createElement('input');
			label.htmlFor = 'live-labels-1';
			input1.id = 'live-labels-1';
			input2.id = 'live-labels-2';
			document.body.append(label, input1, input2);
			cleanup(() => {
				label.remove();
				input1.remove();
				input2.remove();
			});

			const labels1 = input1.labels!;
			const labels2 = input2.labels!;
			expect(labels1).toHaveLength(1);
			expect(labels1[0]).toBe(label);
			expect(labels2).toHaveLength(0);

			label.htmlFor = 'live-labels-2';
			expect(labels1, "Changing 'for' should update the old control's labels.").toHaveLength(0);
			expect(labels2, "Changing 'for' should update the new control's labels.").toHaveLength(1);
			expect(labels2[0], "Changing 'for' should update the new control's labels.").toBe(label);

			input2.id = 'live-labels-3';
			expect(labels2, "Changing the control's ID should update its labels.").toHaveLength(0);

			input2.id = 'live-labels-2';
			expect(labels2, "Restoring the control's ID should update its labels.").toHaveLength(1);
			expect(labels2[0], "Restoring the control's ID should update its labels.").toBe(label);

			label.remove();
			input1.remove();
			input2.remove();
		},
	);
}
