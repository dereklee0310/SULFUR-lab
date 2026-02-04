import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	ssr: {
		// This forces Vite to bundle the library for SSR,
		// preventing Node from seeing the .svelte extension
		noExternal: ['svelte-sonner']
	}
});