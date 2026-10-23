import { createUI } from '@clack/ui';
import { createRoot } from '@clack/ui-preact';
import { Greeting } from './greeting.tsx';

const shutdown = Promise.withResolvers<void>();
const stop = () => shutdown.resolve();
process.once('SIGINT', stop);
process.once('SIGTERM', stop);

try {
	await using ui = await createUI({
		input: process.stdin,
		output: process.stdout,
		width: process.stdout.columns ?? 80,
		height: process.stdout.rows ?? 24,
	});

	// A root can be mounted on any Clack element, not just the document root.
	const mount = ui.document.createElement('div');
	ui.document.documentElement.appendChild(mount);
	using root = createRoot(mount);
	root.render(<Greeting />);

	await Promise.race([ui.main(), shutdown.promise]);
} finally {
	process.off('SIGINT', stop);
	process.off('SIGTERM', stop);
}
