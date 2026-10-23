import { defineMiddleware } from 'astro:middleware';

/**
 * Allow Directus Studio to embed this site in the live preview / visual editor iframe.
 */
export const onRequest = defineMiddleware(async (_context, next) => {
	const response = await next();
	const directusUrl = import.meta.env.PUBLIC_DIRECTUS_URL || '';
	const frameAncestors = ["'self'", directusUrl].filter(Boolean).join(' ');
	response.headers.set('Content-Security-Policy', `frame-ancestors ${frameAncestors}`);

	return response;
});
