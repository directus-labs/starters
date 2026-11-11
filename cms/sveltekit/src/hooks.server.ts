import type { Handle } from '@sveltejs/kit';
import { redirect as svelteRedirect } from '@sveltejs/kit';
import { PUBLIC_DIRECTUS_URL } from '$env/static/public';
import type { SvelteRedirect } from '$lib/directus/fetchRedirects';
import { fetchRedirects } from '$lib/directus/fetchRedirects';

let redirectRules: SvelteRedirect[] = [];

const redirectsLoaded: Promise<void> = (async () => {
	try {
		redirectRules = await fetchRedirects();
		console.info(`[hooks] Loaded ${redirectRules.length} redirects`);
	} catch (error: unknown) {
		console.error('[hooks] Failed to load redirects:', error);
	}
})();

export const handle: Handle = async ({ event, resolve }) => {
	// Mitigates GHSA-pfhg-q3qv-9q6r: SvelteKit 2 can redirect `use:enhance` form submissions to another site
	// when the path starts with "//", and the catch-all route accepts those paths. Fixed in SvelteKit 3, so
	// this can go when the starter upgrades.
	if (event.url.pathname.startsWith('//')) {
		return new Response('Not found', { status: 404 });
	}

	await redirectsLoaded;

	const incomingPath = event.url.pathname.replace(/\/$/, '') || '/';

	const match = redirectRules.find((r) => {
		const sourcePath = r.source.replace(/\/$/, '') || '/';
		return sourcePath === incomingPath;
	});

	if (match) {
		throw svelteRedirect(match.permanent ? 301 : 302, match.destination);
	}

	const response = await resolve(event);
	const frameAncestors = ["'self'", PUBLIC_DIRECTUS_URL].filter(Boolean).join(' ');
	response.headers.set('Content-Security-Policy', `frame-ancestors ${frameAncestors}`);

	return response;
};
