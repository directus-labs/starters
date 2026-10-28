import { fetchSiteData } from '$lib/directus/fetchers';
import type { LayoutServerLoad } from './$types';

import { env } from '$env/dynamic/public';

export const load = (async (event) => {
	// Enable when Directus sends ?visual-editing=true (visual editing tab) or
	// ?preview=true (live preview tab) — both indicate an admin-controlled iframe.
	const visualEditingEnabled =
		(event.url.searchParams.get('visual-editing') === 'true' ||
			event.url.searchParams.get('preview') === 'true') &&
		env.PUBLIC_ENABLE_VISUAL_EDITING !== 'false';

	// Expose non-published versions so setBlockAttr() can route through the pages item.
	// Only in preview mode, matching the page loaders, which ignore version without preview=true.
	const preview = event.url.searchParams.get('preview') === 'true';
	let version = event.url.searchParams.get('version') || undefined;
	version = preview && version !== 'published' && version !== 'main' ? version : undefined;

	const { globals, headerNavigation, footerNavigation } = await fetchSiteData();
	const accentColor = globals?.accent_color || '#6644ff';
	return {
		globals,
		headerNavigation,
		footerNavigation,
		accentColor,
		visualEditingEnabled,
		contentVersion: version
	};
}) satisfies LayoutServerLoad;
