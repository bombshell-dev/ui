import frameworkBaseline from './packages/framework-baseline/knip.json' with { type: 'json' };
import webPlatformTests from './packages/web-platform-tests/knip.json' with { type: 'json' };

export default {
	workspaces: {
		'packages/framework-baseline': {
			entry: frameworkBaseline.entry,
			project: frameworkBaseline.project,
		},
		'packages/web-platform-tests': {
			entry: webPlatformTests.entry,
			project: webPlatformTests.project,
		},
	},
};
