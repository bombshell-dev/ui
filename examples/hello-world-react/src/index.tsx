import { stdin, stdout } from 'node:process';
import { createUI, installBrowserCompat } from '@clack/ui';
import { createRoot } from '@clack/ui-react';

await using ui = await createUI({ input: stdin, output: stdout });
const cleanupBrowser = installBrowserCompat(ui.host);
try {
	const { HelloWorld } = await import('./app.tsx');
	const root = createRoot(ui.host.element);
	try {
		root.render(<HelloWorld />);
		await ui.main();
	} finally {
		root.unmount();
	}
} finally {
	cleanupBrowser();
}
