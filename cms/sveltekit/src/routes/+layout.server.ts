import { fetchSiteData } from '$lib/directus/fetchers';
import type { LayoutServerLoad } from './$types';

import { PUBLIC_ENABLE_VISUAL_EDITING } from '$env/static/public';

export const load = (async (event) => {

	const visualEditingEnabled = event.url.searchParams.get('visual-editing') === 'true' && PUBLIC_ENABLE_VISUAL_EDITING === 'true';
	const { globals, headerNavigation, footerNavigation } = await fetchSiteData(event.fetch);
	const accentColor = globals?.accent_color || '#6644ff';
	return { globals, headerNavigation, footerNavigation, accentColor, visualEditingEnabled };
}) satisfies LayoutServerLoad;
