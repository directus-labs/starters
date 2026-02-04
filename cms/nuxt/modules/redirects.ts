import { createDirectus, readItems, rest } from '@directus/sdk';
import { defineNuxtModule, extendRouteRules, useLogger } from '@nuxt/kit';
import { withoutTrailingSlash } from 'ufo';

import type { Schema } from '#shared/types/schema';

export default defineNuxtModule({
	async setup(_moduleOptions, nuxt) {
		const directusUrl = nuxt.options.runtimeConfig.public.directusUrl as string | undefined;
		const logger = useLogger();

		if (!directusUrl) {
			logger.warn('Missing directusUrl in runtimeConfig');
			return;
		}

		// Skip redirects loading during prepare/postinstall phase when Directus may not be available
		const isPreparePhase = process.env.npm_lifecycle_event === 'postinstall' || process.env.NUXT_PREPARE === 'true';
		if (isPreparePhase) {
			logger.debug('Skipping redirects loading during prepare phase');
			return;
		}

		try {
			const directus = createDirectus<Schema>(directusUrl).with(rest());

			const redirects = await directus.request(readItems('redirects', {
				filter: {
					url_from: { _nnull: true },
					url_to: { _nnull: true }
				},
				// Get all redirects (Directus defaults to 100 for limit)
				limit: -1,
			}));

			for (const redirect of redirects) {
				if (!redirect.url_from || !redirect.url_to) {
					continue;
				}

				// If response code is not set, default to 301
				let responseCode = redirect.response_code ? parseInt(redirect.response_code) : 301;

				if (responseCode !== 301 && responseCode !== 302) {
					responseCode = 301;
				}

				// Add the redirect to the route rules
				// https://nuxt.com/docs/guide/concepts/rendering#route-rules
				extendRouteRules(withoutTrailingSlash(redirect.url_from), {
					redirect: {
						to: redirect.url_to,
						statusCode: responseCode as 301 | 302,
					},
				});
			}

			logger.info(`${redirects.length} redirects loaded`);

			for (const redirect of redirects) {
				logger.info(`${redirect.response_code} - From: ${redirect.url_from} To:${redirect.url_to}`);
			}
		} catch (error) {
			// Log as warning during development, error only in production builds
			const isDev = nuxt.options.dev;
			if (isDev) {
				logger.warn('Could not load redirects from Directus (this is normal if Directus is not running)');
			} else {
				logger.error('Error loading redirects', error);
			}
		}
	},
});
