import { createUI } from '@clack/ui';
import { createRoot, type Root } from './root.ts';

export type PreactUIOptions = Parameters<typeof createUI>[0];

export interface PreactUI extends Root {
	dispose(): Promise<void>;
}

/** Create a terminal UI reconciled by Preact. */
export async function createPreactUI(options: PreactUIOptions): Promise<PreactUI> {
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
