import { fetchSiteData } from '$lib/directus/fetchers';
import type { LayoutServerLoad } from './$types';

export const load = (async () => {
	const { globals, headerNavigation, footerNavigation } = await fetchSiteData();
	const accentColor = globals?.accent_color || '#6644ff';
	return { globals, headerNavigation, footerNavigation, accentColor };
}) satisfies LayoutServerLoad;
