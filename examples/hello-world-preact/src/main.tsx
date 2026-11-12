import { createUI } from '@clack/ui';
import { render } from 'preact';
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
	try {
		render(<Greeting />, mount);
		await Promise.race([ui.main(), shutdown.promise]);
	} finally {
		render(null, mount);
	}
} finally {
	process.off('SIGINT', stop);
	process.off('SIGTERM', stop);
}
