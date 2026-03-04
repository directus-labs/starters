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

	// Prevent Nitro/Rollup from resolving optional native bindings that may not exist on the build host (e.g. Vercel Linux has gnu, not musl).
	nitro: {
		externals: {
			external: [
				'@resvg/resvg-js-android-arm-eabi',
				'@resvg/resvg-js-android-arm64',
				'@resvg/resvg-js-darwin-arm64',
				'@resvg/resvg-js-darwin-x64',
				'@resvg/resvg-js-linux-arm-gnueabihf',
				'@resvg/resvg-js-linux-arm64-gnu',
				'@resvg/resvg-js-linux-arm64-musl',
				'@resvg/resvg-js-linux-x64-gnu',
				'@resvg/resvg-js-linux-x64-musl',
				'@resvg/resvg-js-win32-arm64-msvc',
				'@resvg/resvg-js-win32-ia32-msvc',
				'@resvg/resvg-js-win32-x64-msvc',
			],
		},
	},
});
