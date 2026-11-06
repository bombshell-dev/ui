import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
	root: fileURLToPath(new URL('.', import.meta.url)),
	base: './',
	build: {
		target: 'esnext',
		outDir: 'dist',
		emptyOutDir: true,
		rolldownOptions: {
			input: fileURLToPath(new URL('./compatibility.html', import.meta.url)),
		},
	},
});
