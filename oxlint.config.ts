import config from './node_modules/@bomb.sh/tools/oxlintrc.json' with { type: 'json' };

export default {
	...config,
	overrides: [
		...(config.overrides ?? []),
		{
			files: ['packages/web-platform-tests/src/**/*.ts'],
			rules: {
				// Test registration and factories must return synchronously to the runner.
				'bombshell-dev/exported-function-async': 'off',
			},
		},
	],
	jsPlugins: ['./node_modules/@bomb.sh/tools/rules/plugin.js'],
};
