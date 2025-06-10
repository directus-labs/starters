import 'dotenv/config';
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import { fetchRedirects } from './src/lib/fetchRedirects';

const directusUrl = process.env.PUBLIC_DIRECTUS_URL || process.env.DIRECTUS_URL || '';
const directusHost = directusUrl?.split('//')[1];
const siteUrl = process.env.PUBLIC_SITE_URL || 'http://localhost:4321';

if (!directusUrl) {
  throw new Error(
    'Missing PUBLIC_DIRECTUS_URL in your .env. ' +
    'Make sure you have PUBLIC_DIRECTUS_URL set at the project root.'
  );
}

const redirectsArray = await fetchRedirects(directusUrl);
const redirectsConfig: Record<string, { status: 301 | 302; destination: string }> = {};

for (const { source, destination, permanent } of redirectsArray) {
  redirectsConfig[source] = {
    status: permanent ? 301 : 302,
    destination,
  };
}

export default defineConfig({
  site: siteUrl,
  adapter: vercel(),
  integrations: [react()],
  image: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: directusHost,
        pathname: '/assets/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8055',
        pathname: '/assets/**',
      },
    ],
  },
  redirects: redirectsConfig,

  vite: {
    envPrefix: ['PUBLIC_', 'DIRECTUS_'],
    assetsInclude: ['**/*.svg'],
  },
});
