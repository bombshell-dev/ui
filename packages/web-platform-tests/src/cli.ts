import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
	argument,
	command,
	description,
	multiple,
	name,
	option,
	parse,
	printErrors,
	printHelp,
	schema,
} from '@bomb.sh/router';
import * as z from 'zod';

const app = command(
	name('wpt'),
	description('Run configured Web Platform Tests with literal-text filtering.'),
	option(
		name('file'),
		description('Consumer test entrypoint, relative to the current directory.'),
		schema(z.string().min(1)),
	),
	option(
		name('config'),
		description('Vitest configuration path; otherwise use normal Vitest discovery.'),
		schema(z.string().min(1).optional()),
	),
	argument(
		name('search'),
		description('Optional literal search text. Multiple words are joined with spaces.'),
		multiple(),
		schema(z.array(z.string()).default([])),
	),
);

const argv = process.argv.slice(2);
const result = parse(app, { argv: argv.length === 0 ? ['--help'] : argv });
if (!result.ok) {
	console.error(printErrors(result));
	process.exitCode = 1;
} else if (result.method === 'help') {
	process.stdout.write(`${printHelp(result)}\n`);
} else {
	const text = [
		...result.model.search,
		...Array.from(result.literals, (literal) => literal.text),
	].join(' ');
	const args = ['run', result.model.file];
	if (result.model.config) {
		args.push('--config', result.model.config);
	}
	if (text) {
		// Keep numeric-looking searches as strings through Vitest's argument parser.
		args.push('-t', `(?:${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`);
	}
	const vitest = fileURLToPath(new URL('./vitest.mjs', import.meta.resolve('vitest/package.json')));
	const child = spawnSync(process.execPath, [vitest, ...args], { stdio: 'inherit' });
	if (child.error) {
		console.error(child.error.message);
	}
	if (child.signal) {
		process.kill(process.pid, child.signal);
	} else {
		process.exitCode = child.status ?? 1;
	}
}
