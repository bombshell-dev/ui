import dom from './packages/dom/knip.json' with { type: 'json' };

export default {
	workspaces: {
		'packages/dom': { entry: dom.entry, project: dom.project },
	},
};
