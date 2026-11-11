import { PUBLIC_SITE_URL } from '$env/static/public';
import type { RequestHandler } from './$types';

// Allow all crawlers and point them at the sitemap, matching the other CMS frontends.
export const GET: RequestHandler = () => {
	const body = [
		'User-agent: *',
		'Allow: /',
		'',
		`Sitemap: ${PUBLIC_SITE_URL}/sitemap.xml`,
		''
	].join('\n');

	return new Response(body, { headers: { 'Content-Type': 'text/plain' } });
};
