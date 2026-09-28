import { Dialog } from './components/dialog.ts';
import { Button } from './elements/button.ts';
import { Input } from './elements/input.ts';
import { Box } from './primitives/box.ts';
import { Text } from './primitives/text.ts';
import type { Host } from './host.ts';

/** Install the standard host elements into a host. */
export function installBuiltins(host: Host): void {
	Box.register(host);
	Text.register(host);
	Button.register(host);
	Input.register(host);
	Dialog.register(host);
}
