export default defineNuxtConfig({
	components: [
		{ path: '~/components', pathPrefix: false },
		{ path: '~/components/block', pathPrefix: false },
		{ path: '~/components/shared', pathPrefix: false },
		{ path: '~/components/base', pathPrefix: false },
		{ path: '~/components/forms', pathPrefix: false },
	],

	ssr: true,
	future: {
		compatibilityVersion: 4,
	},
	modules: [
		'@nuxt/image',
		'@nuxtjs/seo',
		'@nuxt/scripts',
		'@vueuse/nuxt',
		'nuxt-security',
		'@nuxtjs/tailwindcss',
		'shadcn-nuxt',
		'@nuxt/icon',
		'@nuxtjs/color-mode',
	],

	css: ['~/assets/css/tailwind.css'],

	runtimeConfig: {
		public: {
			siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
			directusUrl: process.env.DIRECTUS_URL,
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
				'connect-src': ["'self'", process.env.DIRECTUS_URL!],
			},
		},
	},

	devtools: { enabled: true },

	// Image Configuration - https://image.nuxt.com/providers/directus
	image: {
		providers: {
			directus: {
				provider: 'directus',
				options: {
					baseURL: `${process.env.DIRECTUS_URL}/assets/`,
				},
			},
			local: {
				provider: 'ipx',
			},
		},
	},

	colorMode: {
		preference: 'system',
		fallback: 'light',
		classSuffix: '',
	},

	site: {
		url: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
	},
	vue: {
		propsDestructure: true,
	},

	compatibilityDate: '2025-01-16',
});
