import { createUI } from '@clack/ui';
import { createRoot, type Root } from './root.ts';

export type ReactUIOptions = Parameters<typeof createUI>[0];

export interface ReactUI extends Root {
	dispose(): Promise<void>;
}

/** Create a terminal UI reconciled by React. */
export async function createReactUI(options: ReactUIOptions): Promise<ReactUI> {
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
