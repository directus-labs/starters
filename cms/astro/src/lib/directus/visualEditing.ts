import { setAttr as baseSetAttr } from '@directus/visual-editing';

interface ApplyOptions {
	collection: string;
	item: string | number;
	fields?: string | string[];
	mode?: 'modal' | 'popover' | 'drawer';
}

export type SetBlockAttrOptions = {
	blockCollection: string;
	blockItemId: string | number;
	fields: string | string[];
	mode?: 'modal' | 'popover' | 'drawer';
	/**
	 * Draft-only path override on the `pages` item, e.g. `blocks.item:block_pricing.pricing_cards.title`.
	 * Use when the editable field lives deeper than `blocks.item:{block}.{field}`.
	 */
	pageFields?: string | string[];
};

type PagePreviewContext = {
	contentVersion?: string;
	pageId?: string;
};

let pageId = '';

/**
 * Set from PageClient. Provides the page id when the preview URL omits `?id=`.
 * Version is always read from the URL at runtime — see resolvePageContext().
 */
export function setVisualEditingPageContext(id: string) {
	pageId = id;
}

/**
 * Prerendered Astro pages are built without preview query params, so draft
 * version/id must be read from the live URL when generating attrs.
 */
function resolvePageContext(): PagePreviewContext {
	if (typeof window === 'undefined') {
		return { pageId };
	}

	const params = new URLSearchParams(window.location.search);
	const rawVersion = params.get('version') || '';
	const contentVersion =
		rawVersion !== 'published' && rawVersion !== 'main' ? rawVersion : undefined;

	return {
		pageId: params.get('id') || pageId,
		contentVersion,
	};
}

export function getIsDraftPreview(): boolean {
	return !!resolvePageContext().contentVersion;
}

/** Page id for attrs — prefers `?id=` from the preview URL when present. */
export function getPageIdForEditing(): string {
	return resolvePageContext().pageId ?? pageId;
}

export const setAttr = (options: ApplyOptions) => {
	return baseSetAttr({ ...options });
};

function toPageBlockFields(
	blockCollection: string,
	fields: string | string[],
	pageFields?: string | string[],
): string | string[] {
	if (pageFields) return pageFields;

	const list = Array.isArray(fields) ? fields : [fields];
	const paths = list.map((field) => `blocks.item:${blockCollection}.${field}`);
	return paths.length === 1 ? paths[0] : paths;
}

/**
 * Visual editing attrs for page-builder blocks.
 *
 * Published/live preview: target the block collection directly for field popovers.
 *
 * Content versions (e.g. ?version=draft): route through the versioned `pages`
 * item with nested `blocks.item:…` paths and modal mode.
 */
export const setBlockAttr = (options: SetBlockAttrOptions) => {
	const { blockCollection, blockItemId, fields, mode, pageFields } = options;
	const { contentVersion, pageId: resolvedPageId } = resolvePageContext();

	if (contentVersion && resolvedPageId) {
		return setAttr({
			collection: 'pages',
			item: resolvedPageId,
			fields: toPageBlockFields(blockCollection, fields, pageFields),
			mode: 'modal',
		});
	}

	return setAttr({
		collection: blockCollection,
		item: blockItemId,
		fields,
		mode,
	});
};
