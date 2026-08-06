import { createUI } from '@clack/ui';
import { createRoot, type Root } from './renderer.ts';

export type SolidUIOptions = Parameters<typeof createUI>[0];

export interface SolidUI extends Root {
	dispose(): Promise<void>;
}

/** Create a terminal UI reconciled by Solid. */
export async function createSolidUI(options: SolidUIOptions): Promise<SolidUI> {
	const ui = await createUI(options);
	const root = createRoot(ui.host);

	return {
		...root,
		async dispose() {
			try {
				await ui.dispose();
			} finally {
				root.unmount();
			}
		},
	};
}
