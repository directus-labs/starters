import { fetchSiteData } from '$lib/directus/fetchers';
import type { LayoutServerLoad } from './$types';

import { env } from '$env/dynamic/public';

export const load = (async (event) => {
	// Enabled by default; set to 'false' to disable
	const visualEditingEnabled =
		event.url.searchParams.get('visual-editing') === 'true' &&
		env.PUBLIC_ENABLE_VISUAL_EDITING !== 'false';
	const { globals, headerNavigation, footerNavigation } = await fetchSiteData();
	const accentColor = globals?.accent_color || '#6644ff';
	return { globals, headerNavigation, footerNavigation, accentColor, visualEditingEnabled };
}) satisfies LayoutServerLoad;
