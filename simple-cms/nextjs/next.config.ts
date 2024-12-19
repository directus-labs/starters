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
	},
};

export default withBundleAnalyzer(nextConfig);
