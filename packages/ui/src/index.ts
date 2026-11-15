import { createNodePlatform } from './platform/node.ts';
import { startUI, type UI, type UIOptions } from './ui.ts';

export type { UI, UIOptions } from './ui.ts';

/** Create a UI on this process's terminal. */
export async function createUI(options: UIOptions = {}): Promise<UI> {
	return startUI(createNodePlatform(options), options.signal);
}
