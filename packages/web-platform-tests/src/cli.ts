import {
	argument,
	cli,
	command,
	description,
	multiple,
	name,
	option,
	parse,
	printErrors,
	printHelp,
	schema,
	toggle,
} from '@bomb.sh/router';
import * as z from 'zod';
import { runWPT, watchWPT } from './vitest.ts';

const app = command(
	name('wpt'),
	description('Run upstream Web Platform Tests against a configured DOM implementation.'),
	option(
		name('config'),
		description('WPT configuration path, relative to the current directory.'),
		schema(z.string().min(1).default('wpt.config.ts')),
	),
	option(
		name('name'),
		cli(['--name', '-t']),
		description(
			'Report only subtest names matching this regular expression; each file still executes completely.',
		),
		schema(z.string().optional()),
	),
	toggle(
		name('watch'),
		cli(['--watch', '-w'], { switch: true }),
		description('Rerun selected WPT cases when the config or its implementation changes.'),
	),
	argument(
		name('files'),
		description('Optional upstream filename filters, using Vitest file selection.'),
		multiple(),
		schema(z.array(z.string()).default([])),
	),
);

const result = parse(app, { argv: process.argv.slice(2) });
if (!result.ok) {
	console.error(printErrors(result));
	process.exitCode = 1;
} else if (result.method === 'help') {
	process.stdout.write(`${printHelp(result)}\n`);
} else {
	try {
		const options = {
			config: result.model.config,
			files: [...result.model.files, ...Array.from(result.literals, (literal) => literal.text)],
			namePattern: result.model.name,
		};
		if (result.model.watch) {
			await watchWPT(options);
		} else {
			const vitest = await runWPT(options);
			await vitest.close();
		}
	} catch (error) {
		console.error(error instanceof Error ? error.message : String(error));
		process.exitCode = 1;
	}
}
