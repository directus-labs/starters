import type { NextConfig } from 'next';
import initializeBundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = initializeBundleAnalyzer({
	enabled: process.env.BUNDLE_ANALYZER_ENABLED === 'true',
});

const nextConfig: NextConfig = {
	output: 'standalone',
	images: {
		dangerouslyAllowSVG: true,
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'simple-cms-starter.directus.app',
				pathname: '/assets/**',
			},
		],
	},
	env: {
		DIRECTUS_PUBLIC_TOKEN: process.env.DIRECTUS_PUBLIC_TOKEN,
		DIRECTUS_FORM_TOKEN: process.env.DIRECTUS_FORM_TOKEN,
		DRAFT_MODE_SECRET: process.env.DRAFT_MODE_SECRET,
	},
	async headers() {
		const isDev = process.env.NODE_ENV === 'development';

		return [
			{
				source: '/:path*',
				headers: [
					{
						key: 'Content-Security-Policy',
						value: isDev
							? "frame-src 'self' http://localhost:3000;"
							: "frame-src 'self' https://simple-cms-starter.directus.app;",
					},
				],
			},
		];
	},
};

export default withBundleAnalyzer(nextConfig);
