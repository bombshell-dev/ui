import webPlatformTests from './packages/web-platform-tests/knip.json' with { type: 'json' };

export default {
	workspaces: {
		'packages/web-platform-tests': {
			entry: webPlatformTests.entry,
			project: webPlatformTests.project,
		},
	},
};
