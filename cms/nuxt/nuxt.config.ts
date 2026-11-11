export default defineNuxtConfig({
	components: [
		// Exclude UI components from auto-import - shadcn-nuxt handles their registration
		{ path: '~/components', pathPrefix: false, ignore: ['**/ui/**'] },
		{ path: '~/components/block', pathPrefix: false },
		{ path: '~/components/shared', pathPrefix: false },
		{ path: '~/components/base', pathPrefix: false },
		{ path: '~/components/forms', pathPrefix: false },
	],

	ssr: true,
	modules: [
		'@nuxt/image',
		'@nuxtjs/seo',
		'@nuxt/scripts',
		'@vueuse/nuxt',
		'@nuxt/fonts',
		'nuxt-security',
		'@nuxtjs/tailwindcss',
		'shadcn-nuxt',
		'@nuxt/icon',
		'@nuxtjs/color-mode',
		'@nuxt/eslint',
	],

	css: ['~/assets/css/tailwind.css'],

	runtimeConfig: {
		public: {
			siteUrl: process.env.NUXT_PUBLIC_SITE_URL as string,
			directusUrl: process.env.DIRECTUS_URL as string,
			// Enabled by default; set to 'false' to disable
			enableVisualEditing: process.env.NUXT_PUBLIC_ENABLE_VISUAL_EDITING !== 'false',
		},
		directusServerToken: process.env.DIRECTUS_SERVER_TOKEN,
	},

	shadcn: {
		/**
		 * Prefix for all the imported component
		 */
		prefix: '',
		/**
		 * Directory that the component lives in.
		 * @default "./components/ui"
		 */
		componentDir: './app/components/ui',
	},

	security: {
		// nuxt-security only knows esbuild's `drop`, which Vite 8 ignores. Console stripping lives in `vite.build` below.
		removeLoggers: false,
		headers: {
			contentSecurityPolicy: {
				'img-src': ["'self'", 'data:', '*'],
				'script-src': ["'self'", "'unsafe-inline'", '*'],
				'connect-src': ["'self'", process.env.DIRECTUS_URL || ''],
				'frame-ancestors': ["'self'", process.env.DIRECTUS_URL || ''],
			},
		},
	},

	devtools: { enabled: true },

	vite: {
		build: {
			rolldownOptions: {
				output: { minify: { compress: { dropConsole: true, dropDebugger: true } } },
			},
		},
	},

	postcss: {
		plugins: {
			// Tailwind 3 has no exports map, so Nuxt 4.6's ESM resolver can't load the `tailwindcss/nesting` that @nuxtjs/tailwindcss adds.
			'tailwindcss/nesting/index.js': {},
			'tailwindcss/nesting': false,
		},
	},

	// Image Configuration - https://image.nuxt.com/providers/directus
	image: {
		directus: {
			baseURL: `${process.env.DIRECTUS_URL}/assets/`,
		},
	},

	colorMode: {
		preference: 'system',
		classSuffix: '',
		storage: 'cookie',
	},

	site: {
		url: process.env.NUXT_PUBLIC_SITE_URL as string,
	},
	vue: {
		propsDestructure: true,
	},

	sitemap: {
		sources: ['/api/sitemap'],
	},

	compatibilityDate: '2025-01-16',
});
