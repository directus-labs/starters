import { fetchSiteData } from '$lib/directus/fetchers';
import type { LayoutServerLoad } from './$types';

import { PUBLIC_ENABLE_VISUAL_EDITING } from '$env/static/public';

export const load = (async (event) => {
	// Enabled by default; set to 'false' to disable
	const visualEditingEnabled =
		event.url.searchParams.get('visual-editing') === 'true' &&
		PUBLIC_ENABLE_VISUAL_EDITING !== 'false';
	const { globals, headerNavigation, footerNavigation } = await fetchSiteData();
	const accentColor = globals?.accent_color || '#6644ff';
	return { globals, headerNavigation, footerNavigation, accentColor, visualEditingEnabled };
}) satisfies LayoutServerLoad;
