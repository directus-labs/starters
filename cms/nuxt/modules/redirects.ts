/* eslint-disable no-console */

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

		const directus = createDirectus<Schema>(directusUrl).with(rest());

		const redirects = await directus.request(readItems('redirects'));

		for (const redirect of redirects) {
			if (!redirect.url_from || !redirect.url_to) {
				continue;
			}

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
	},
});
