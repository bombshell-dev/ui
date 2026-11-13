import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';

const executable = fileURLToPath(new URL('../bin/wpt.mjs', import.meta.url));
const dependencies = fileURLToPath(new URL('../../../node_modules', import.meta.url));
const implementation = fileURLToPath(new URL('../../ui/src/dom.ts', import.meta.url));
const consumers: URL[] = [];

interface CLIResult {
	status: number | null;
	output: string;
}

interface Report {
	numTotalTests: number;
	numPassedTests: number;
	numPendingTests: number;
	numFailedTests: number;
	testResults: { assertionResults: { fullName: string }[] }[];
}

afterEach(() => {
	for (const directory of consumers.splice(0)) {
		rmSync(directory, { recursive: true, force: true });
	}
});

function consumer(): URL {
	const directory = pathToFileURL(`${mkdtempSync(`${tmpdir()}/wpt-cli-consumer-`)}/`);
	consumers.push(directory);
	symlinkSync(dependencies, new URL('node_modules', directory), 'dir');
	writeFileSync(new URL('package.json', directory), JSON.stringify({ type: 'module' }));
	writeFileSync(new URL('consumer.txt', directory), 'consumer fixture');
	writeFileSync(
		new URL('consumer.config.mjs', directory),
		`import { defineConfig } from 'vitest/config';
import { wptNameFilter } from '@bomb.sh/web-platform-tests/vitest';
export default defineConfig({
  plugins: [wptNameFilter()],
  test: {
    setupFiles: ['./setup.mjs'],
    reporters: ['json'],
    outputFile: './results.json',
    maxWorkers: 1,
    experimental: { viteModuleRunner: false },
  },
});`,
	);
	writeFileSync(
		new URL('setup.mjs', directory),
		`import { readFileSync } from 'node:fs';
if (readFileSync('./consumer.txt', 'utf8') !== 'consumer fixture') {
  throw new Error('The consumer working directory was not preserved');
}`,
	);
	writeFileSync(
		new URL('wpt.test.ts', directory),
		`import { testDOMCompatibility } from '@bomb.sh/web-platform-tests/vitest/runner';
import { Document, Text, Comment, CharacterData, Node } from ${JSON.stringify(implementation)};
testDOMCompatibility({
  create: () => new Document(() => {}),
  config: {
    globals: { Text, Comment, CharacterData, Node },
    exclude: { '**': true },
    include: {
      'dom/nodes/Document-createTextNode.html': true,
      'dom/nodes/Document-createComment.html': true,
    },
  },
});`,
	);
	// These are ordinary harness tests, not shared WPT conformance cases.
	writeFileSync(
		new URL('literals.test.ts', directory),
		`import { it, expect } from 'vitest';
it('007', () => expect(true).toBe(true));
it('7', () => expect.fail('The leading zeroes were lost'));
it('--switch [value]+ (literal)', () => expect(true).toBe(true));
it('intentional failure', () => expect('actual').toBe('expected'));`,
	);
	return directory;
}

function invoke(directory: URL, args: string[]): CLIResult {
	rmSync(new URL('results.json', directory), { force: true });
	const result = spawnSync(process.execPath, [executable, ...args], {
		cwd: directory,
		encoding: 'utf8',
		timeout: 20_000,
	});
	expect(result.error).toBeUndefined();
	expect(result.signal).toBeNull();
	return { status: result.status, output: result.stdout + result.stderr };
}

function run(
	directory: URL,
	{ file, search = [] }: { file: string; search?: string[] },
): CLIResult {
	return invoke(directory, ['--file', file, '--config', 'consumer.config.mjs', ...search]);
}

function report(directory: URL): Report {
	return JSON.parse(readFileSync(new URL('results.json', directory), 'utf8')) as Report;
}

describe('wpt CLI in a separate consumer project', () => {
	it('uses consumer configuration and filters literal WPT names before registration', () => {
		const directory = consumer();
		const result = run(directory, {
			file: 'wpt.test.ts',
			search: ['createTextNode(a', '--', '--', 'b)'],
		});
		expect(result.status, result.output).toBe(0);
		const results = report(directory);
		expect(results.numTotalTests).toBe(1);
		expect(results.numPassedTests).toBe(1);
		expect(results.numPendingTests).toBe(0);
		expect(results.testResults[0]?.assertionResults[0]?.fullName).toContain(
			'createTextNode(a -- b)',
		);
	}, 30_000);

	it('succeeds when the literal filter matches no WPT cases', () => {
		const directory = consumer();
		const result = run(directory, {
			file: 'wpt.test.ts',
			search: ['no such WPT case [missing]'],
		});
		expect(result.status, result.output).toBe(0);
		expect(report(directory).numTotalTests).toBe(0);
		expect(report(directory).numFailedTests).toBe(0);
		expect(result.output).not.toContain('No test suite found');
	}, 30_000);

	it('preserves leading zeroes and literal arguments after --', () => {
		const directory = consumer();
		const numeric = run(directory, { file: 'literals.test.ts', search: ['007'] });
		expect(numeric.status, numeric.output).toBe(0);
		expect(report(directory).numPassedTests).toBe(1);
		const literal = run(directory, {
			file: 'literals.test.ts',
			search: ['--', '--switch', '[value]+', '(literal)'],
		});
		expect(literal.status, literal.output).toBe(0);
		expect(report(directory).numPassedTests).toBe(1);
	}, 30_000);

	it('forwards failing test runs as a nonzero exit status', () => {
		const directory = consumer();
		const result = run(directory, { file: 'literals.test.ts', search: ['intentional failure'] });
		expect(result.status, result.output).toBe(1);
		expect(report(directory).numFailedTests).toBe(1);
	}, 30_000);

	it('shows help and rejects invalid arguments or missing entrypoints', () => {
		const directory = consumer();
		for (const args of [[], ['--help']]) {
			const result = invoke(directory, args);
			expect(result.status, result.output).toBe(0);
			expect(result.output).toContain('wpt [OPTIONS]');
		}
		for (const args of [
			['createTextNode'],
			['--config', 'consumer.config.mjs'],
			['--file'],
			['--file', 'wpt.test.ts', '--unknown-option'],
		]) {
			const result = invoke(directory, args);
			expect(result.status, result.output).not.toBe(0);
		}
		const missing = run(directory, { file: 'missing.test.ts' });
		expect(missing.status, missing.output).not.toBe(0);
	}, 30_000);
});
