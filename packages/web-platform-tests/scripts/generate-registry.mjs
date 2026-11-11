import { readdirSync, readFileSync, writeFileSync } from 'node:fs';

const root = new URL('../src/wpt/', import.meta.url);
const destination = new URL('../src/shared/registry.ts', import.meta.url);

function files(directory, prefix = '') {
	return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const name = prefix + entry.name;
		if (entry.isDirectory()) return files(new URL(`${entry.name}/`, directory), `${name}/`);
		return entry.isFile() && /\.(?:html|xhtml|xht|js)\.ts$/.test(name) ? [name] : [];
	});
}

const tests = files(root)
	.toSorted()
	.map((path) => ({
		path,
		alias: path.slice(0, -3).replace(/[^A-Za-z0-9_$]/g, '_'),
		content: readFileSync(new URL(path, root), 'utf8'),
	}))
	.filter(({ content }) => /^export function register\(/m.test(content));

const pathsByAlias = new Map();
for (const { path, alias } of tests) {
	if (pathsByAlias.has(alias)) {
		process.stderr.write(
			`WPT registry alias collision: "${pathsByAlias.get(alias)}" and "${path}" both map to "${alias}".\n`,
		);
		process.exit(1);
	}
	pathsByAlias.set(alias, path);
}

const output = [
	'// Generated from src/wpt filenames by scripts/generate-registry.mjs.',
	"import type { CompatibilityModule } from './context.ts';",
	...tests.map(({ path, content, alias }) => {
		const imports = [`register as register_${alias}`];
		if (/^export const input\b/m.test(content)) imports.push(`input as input_${alias}`);
		return imports.length === 1
			? `import { ${imports[0]} } from '../wpt/${path}';`
			: `import {\n${imports.map((name) => `\t${name},`).join('\n')}\n} from '../wpt/${path}';`;
	}),
	'',
	'// prettier-ignore',
	'export const registry = {',
	...tests.map(({ path, content, alias }) => {
		const members = [`register: register_${alias}`];
		if (/^export const input\b/m.test(content)) members.push(`input: input_${alias}`);
		return `\t'${path.slice(0, -3)}': { ${members.join(', ')} },`;
	}),
	'} satisfies Record<string, CompatibilityModule>;',
	'',
].join('\n');

if (process.argv.includes('--check')) {
	if (readFileSync(destination, 'utf8') !== output) {
		process.stderr.write(
			'WPT registry is stale. Run pnpm --filter @bomb.sh/web-platform-tests generate.\n',
		);
		process.exitCode = 1;
	}
} else writeFileSync(destination, output);
