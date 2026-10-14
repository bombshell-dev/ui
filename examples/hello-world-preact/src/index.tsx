import { stdin, stdout } from 'node:process';
import { Box, Button, createUI, Input, registerComponents, Text } from '@clack/ui';
import { createRoot } from '@clack/ui-preact';
import { HelloWorld } from './app.tsx';

await using ui = await createUI({ input: stdin, output: stdout });
registerComponents(ui.host, [Box, Text, Input, Button]);
const root = createRoot(ui.host.element);
root.render(<HelloWorld />);
await ui.main();
