import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test('Test with ordinary child nodes', ({ document }) => {
		function checkNodes(connected: Node[], disconnected: Node[]) {
			for (const node of connected) expect(node.isConnected).toBe(true);
			for (const node of disconnected) expect(node.isConnected).toBe(false);
		}

		let nodes = [
			document.createElement('div'),
			document.createElement('div'),
			document.createElement('div'),
		];
		checkNodes([], nodes);

		// Append nodes[0]!.
		document.body.appendChild(nodes[0]!);
		checkNodes([nodes[0]!], [nodes[1]!, nodes[2]!]);

		// Append nodes[1]! and nodes[2]! together.
		nodes[1]!.appendChild(nodes[2]!);
		checkNodes([nodes[0]!], [nodes[1]!, nodes[2]!]);

		nodes[0]!.appendChild(nodes[1]!);
		checkNodes(nodes, []);

		// Remove nodes[2]!.
		nodes[2]!.remove();
		checkNodes([nodes[0]!, nodes[1]!], [nodes[2]!]);

		// Remove nodes[0]! and nodes[1]! together.
		nodes[0]!.remove();
		checkNodes([], nodes);
	});
}
