import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import tailwindcss from '@tailwindcss/vite'; // [!code ++]


export default defineConfig({
	plugins: [tailwindcss(), enhancedImages(), sveltekit()]
});
